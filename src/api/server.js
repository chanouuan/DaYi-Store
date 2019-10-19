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
export const getUsageEnum = () => {
  return axios.request({
    url: 'serverClinic/getUsageEnum',
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

// 搜索药品
export const searchDrug = (store_id, drug_type, name) => {
  return axios.request({
    url: 'serverClinic/searchDrug',
    data: { store_id, drug_type, name },
    method: 'post'
  })
}

// 搜索诊疗项目
export const searchTreatmentSheet = (store_id, name) => {
  return axios.request({
    url: 'serverClinic/searchTreatmentSheet',
    data: { store_id, name },
    method: 'post'
  })
}

// 医生接诊
export const doctorCreateCard = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/doctorCreateCard',
    data: data,
    method: 'post'
  })
}

// 获取会诊列表
export const getDoctorOrderList = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getDoctorOrderList',
    data: data,
    method: 'post'
  })
}
