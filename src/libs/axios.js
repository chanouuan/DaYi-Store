import axios from 'axios'
import qs from 'qs'
import store from '@/store'
// import { Spin } from 'iview'
// const addErrorLog = errorInfo => {
//   const { statusText, status, request: { responseURL } } = errorInfo
//   let info = {
//     type: 'ajax',
//     code: status,
//     mes: statusText,
//     url: responseURL
//   }
//   if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
// }

class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        // 'Content-Type': 'application/json'
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    // instance.interceptors.request.use(config => {
    // 添加全局的loading...
    // if (!Object.keys(this.queue).length) {
    // Spin.show() // 不建议开启，因为界面不友好
    // }
    // this.queue[url] = true
    // return config
    // }, error => {
    // return Promise.reject(error)
    // })
    // 响应拦截
    instance.interceptors.response.use(res => {
      // this.destroy(url)
      const { data, status } = res
      // 响应
      if (data && typeof data === 'object' && 'errorcode' in data) {
        if (data.errorcode !== 0) {
          // 用户未登录
          if (data.errorcode === 3010) {
            store.commit('setToken', '')
            store.commit('setAccess', [])
          }
          return Promise.reject(data.message)
        } else {
          return data.result
        }
      }
      return Promise.reject(new Error({ data, status }))
    }, error => {
      // this.destroy(url)
      let errorInfo = error.response
      if (!errorInfo) {
        const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: { responseURL: config.url }
        }
      }
      // addErrorLog(errorInfo)
      return Promise.reject(errorInfo.statusText || '连接超时，请检查网络！')
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    // POST 参数要格式化，否则服务端接收不到
    if (options && 'data' in options) {
      options.data = qs.stringify(options.data)
    }
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
