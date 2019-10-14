import axios from '@/libs/api.request'
import { getToken } from '@/libs/util'

// 患者快捷搜索
export const searchPatient = (name) => {
  return axios.request({
    url: 'serverClinic/searchPatient',
    data: { name },
    method: 'post'
  })
}

// 获取过敏史
export const getAllergyEnum = () => {
  return axios.request({
    url: 'serverClinic/getAllergyEnum',
    method: 'get'
  })
}

// 获取医生列表
export const getDoctorList = () => {
  return axios.request({
    url: 'serverClinic/getDoctorList',
    data: {
      token: getToken()
    },
    method: 'post'
  })
}

// 获取药品用法
export const getUsageEnum = (category) => {
  return axios.request({
    url: 'serverClinic/getUsageEnum',
    params: {
      category: category
    },
    method: 'get'
  })
}

// 获取药品使用频率
export const getNoteFrequencyEnum = () => {
  return axios.request({
    url: 'serverClinic/getNoteFrequencyEnum',
    method: 'get'
  })
}
