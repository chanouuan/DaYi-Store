import {
  login,
  logout,
  getUserInfo,
  getMessage,
  getContentByMsgId,
  hasRead,
  removeReaded,
  restoreTrash
} from '@/api/user'
import {
  getUsageEnum,
  getNoteFrequencyEnum,
  getLocalPayWay
} from '@/api/server'
import { setToken, getToken } from '@/libs/util'

export default {
  state: {
    userName: '',
    userId: 0,
    avatorImgPath: '',
    token: getToken(),
    access: [],
    hasGetInfo: false,
    clinicInfo: {}, // 诊所信息
    advanced: false, // 会诊是否高级模式
    usageList: {}, // 药品使用方式
    frequencyList: [], // 药品使用频率
    localPayWay: [], // 线下支付方式
    unreadCount: 0,
    messageUnreadList: [],
    messageReadedList: [],
    messageTrashList: [],
    messageContentStore: {}
  },
  mutations: {
    setLocalPayWay (state, localPayWay) {
      state.localPayWay = localPayWay
    },
    setUsage (state, usage) {
      state.usageList = usage
    },
    setFrequency (state, frequency) {
      state.frequencyList = frequency
    },
    setAvator (state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, name) {
      state.userName = name
    },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    },
    setClinicInfo (state, clinicInfo) {
      state.clinicInfo = clinicInfo
    },
    setAdvanced (state, advanced) {
      state.advanced = advanced
    },
    setMessageCount (state, count) {
      state.unreadCount = count
    },
    setMessageUnreadList (state, list) {
      state.messageUnreadList = list
    },
    setMessageReadedList (state, list) {
      state.messageReadedList = list
    },
    setMessageTrashList (state, list) {
      state.messageTrashList = list
    },
    updateMessageContentStore (state, { msg_id, content }) {
      state.messageContentStore[msg_id] = content
    },
    moveMsg (state, { from, to, msg_id }) {
      const index = state[from].findIndex(_ => _.msg_id === msg_id)
      const msgItem = state[from].splice(index, 1)[0]
      msgItem.loading = false
      state[to].unshift(msgItem)
    }
  },
  getters: {
    messageUnreadCount: state => state.messageUnreadList.length,
    messageReadedCount: state => state.messageReadedList.length,
    messageTrashCount: state => state.messageTrashList.length
  },
  actions: {
    // 登录
    handleLogin ({ commit }, { userName, password, clinic_id }) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          password,
          clinic_id
        }).then(res => {
          commit('setAvator', res.avatar)
          commit('setUserId', res.user_id)
          commit('setUserName', res.nickname)
          commit('setAccess', res.permission)
          commit('setToken', res.token)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          commit('setAccess', [])
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(res => {
          commit('setAvator', res.avatar)
          commit('setUserName', res.nickname)
          commit('setUserId', res.id)
          commit('setAccess', res.permission)
          commit('setMessageCount', res.unread_count)
          commit('setHasGetInfo', true)
          commit('setClinicInfo', res.clinic_info)
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 加载药品使用方式
    getUsageList ({ state, commit }) {
      if (state.usageList[1]) {
        return Promise.resolve(state.usageList)
      }
      return new Promise((resolve, reject) => {
        getUsageEnum().then(res => {
          commit('setUsage', res)
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 加载药品使用频率
    getFrequencyList ({ state, commit }) {
      if (state.frequencyList.length) {
        return Promise.resolve(state.frequencyList)
      }
      return new Promise((resolve, reject) => {
        getNoteFrequencyEnum().then(res => {
          commit('setFrequency', res)
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 获取线下支付方式
    getLocalPayWay ({ state, commit }) {
      if (state.localPayWay.length) {
        return Promise.resolve(state.localPayWay)
      }
      return new Promise((resolve, reject) => {
        getLocalPayWay().then(res => {
          commit('setLocalPayWay', res)
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 获取消息列表，其中包含未读、已读、回收站三个列表
    getMessageList ({ state, commit }) {
      return new Promise((resolve, reject) => {
        getMessage().then(res => {
          const { unread, readed, trash } = res.data
          commit('setMessageUnreadList', unread.sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
          commit('setMessageReadedList', readed.map(_ => {
            _.loading = false
            return _
          }).sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
          commit('setMessageTrashList', trash.map(_ => {
            _.loading = false
            return _
          }).sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 根据当前点击的消息的id获取内容
    getContentByMsgId ({ state, commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        let contentItem = state.messageContentStore[msg_id]
        if (contentItem) {
          resolve(contentItem)
        } else {
          getContentByMsgId(msg_id).then(res => {
            const content = res.data
            commit('updateMessageContentStore', { msg_id, content })
            resolve(content)
          })
        }
      })
    },
    // 把一个未读消息标记为已读
    hasRead ({ state, commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        hasRead(msg_id).then(() => {
          commit('moveMsg', {
            from: 'messageUnreadList',
            to: 'messageReadedList',
            msg_id
          })
          commit('setMessageCount', state.unreadCount - 1)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 删除一个已读消息到回收站
    removeReaded ({ commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        removeReaded(msg_id).then(() => {
          commit('moveMsg', {
            from: 'messageReadedList',
            to: 'messageTrashList',
            msg_id
          })
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 还原一个已删除消息到已读消息
    restoreTrash ({ commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        restoreTrash(msg_id).then(() => {
          commit('moveMsg', {
            from: 'messageTrashList',
            to: 'messageReadedList',
            msg_id
          })
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}
