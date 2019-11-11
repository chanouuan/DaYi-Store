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
export const getDoctorList = (all) => {
  return axios.request({
    url: 'serverClinic/getDoctorList',
    data: {
      token: getToken(),
      all: all || ''
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

// 获取药品剂型
export const getDosageEnum = () => {
  return axios.request({
    url: 'serverClinic/getDosageEnum',
    method: 'get'
  })
}

// 获取药品单位
export const getDrugUnitEnum = () => {
  return axios.request({
    url: 'serverClinic/getDrugUnitEnum',
    method: 'get'
  })
}

// 获取诊疗项目单位
export const getTreatmentUnitEnum = () => {
  return axios.request({
    url: 'serverClinic/getTreatmentUnitEnum',
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
export const searchDrug = (clinic_id, drug_type, name, is_procure) => {
  return axios.request({
    url: 'serverClinic/searchDrug',
    data: { clinic_id, drug_type, name, is_procure },
    method: 'post'
  })
}

// 查询药品
export const searchDrugDict = (drug_type, name) => {
  return axios.request({
    url: 'serverClinic/searchDrugDict',
    data: { drug_type, name },
    method: 'post'
  })
}

// 搜索诊疗项目
export const searchTreatmentSheet = (clinic_id, name) => {
  return axios.request({
    url: 'serverClinic/searchTreatmentSheet',
    data: { clinic_id, name },
    method: 'post'
  })
}

// 医生接诊
export const createDoctorCard = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/createDoctorCard',
    data: data,
    method: 'post'
  })
}

// 编辑保存会诊单
export const saveDoctorCard = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/saveDoctorCard',
    data: data,
    method: 'post'
  })
}

// 获取今日会诊列表
export const getTodayOrderList = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getTodayOrderList',
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

// 获取会诊详情
export const getDoctorOrderDetail = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getDoctorOrderDetail',
    data: data,
    method: 'post'
  })
}

// 获取支付方式
export const getLocalPayWay = () => {
  return axios.request({
    url: 'serverClinic/getLocalPayWay',
    method: 'get'
  })
}

// 线下付款
export const localCharge = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/localCharge',
    data: data,
    method: 'post'
  })
}

// 获取打印模板
export const printTemplete = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/printTemplete',
    data: data,
    method: 'post'
  })
}

// 购药
export const buyDrug = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/buyDrug',
    data: data,
    method: 'post'
  })
}

// 药品列表
export const getDrugList = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getDrugList',
    data: data,
    method: 'post'
  })
}

// 添加药品
export const saveDrug = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/saveDrug',
    data: data,
    method: 'post'
  })
}

// 获取药品信息
export const getDrugInfo = (id) => {
  return axios.request({
    url: 'serverClinic/getDrugInfo',
    params: { id },
    method: 'get'
  })
}

// 诊疗项目列表
export const getTreatmentList = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getTreatmentList',
    data: data,
    method: 'post'
  })
}

// 添加诊疗项目
export const saveTreatment = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/saveTreatment',
    data: data,
    method: 'post'
  })
}

// 获取诊疗项目信息
export const getTreatmentInfo = (id) => {
  return axios.request({
    url: 'serverClinic/getTreatmentInfo',
    params: { id },
    method: 'get'
  })
}

// 获取员工列表
export const getEmployeeList = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getEmployeeList',
    data: data,
    method: 'post'
  })
}

// 添加员工
export const saveEmployee = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/saveEmployee',
    data: data,
    method: 'post'
  })
}

// 获取员工信息
export const getEmployeeInfo = (id) => {
  return axios.request({
    url: 'serverClinic/getEmployeeInfo',
    params: { id },
    method: 'get'
  })
}

// 获取员工职位
export const getEmployeeTitle = () => {
  return axios.request({
    url: 'serverClinic/getEmployeeTitle',
    method: 'get'
  })
}

// 获取员工角色
export const getEmployeeRole = () => {
  return axios.request({
    url: 'serverClinic/getEmployeeRole',
    data: { token: getToken() },
    method: 'post'
  })
}

// 库存列表
export const getStockList = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getStockList',
    data: data,
    method: 'post'
  })
}

// 获取出入库方式
export const getStockWayEnum = () => {
  return axios.request({
    url: 'serverClinic/getStockWayEnum',
    method: 'get'
  })
}

// 获取出入库列表
export const getStockPullOrPush = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getStockPullOrPush',
    data: data,
    method: 'post'
  })
}

// 获取进销存详情
export const getStockSale = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/getStockSale',
    data: data,
    method: 'post'
  })
}

// 获取批次详情
export const batchDetail = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/batchDetail',
    data: data,
    method: 'post'
  })
}

// 新增出入库
export const addStock = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/addStock',
    data: data,
    method: 'post'
  })
}

// 确认出入库
export const confirmStock = (stock_id) => {
  return axios.request({
    url: 'serverClinic/confirmStock',
    data: {
      token: getToken(),
      stock_id: stock_id
    },
    method: 'post'
  })
}

// 删除出入库
export const delStock = (stock_id) => {
  return axios.request({
    url: 'serverClinic/delStock',
    data: {
      token: getToken(),
      stock_id: stock_id
    },
    method: 'post'
  })
}

// 出入库详情
export const stockDetail = (stock_id) => {
  return axios.request({
    url: 'serverClinic/stockDetail',
    data: {
      token: getToken(),
      stock_id: stock_id
    },
    method: 'post'
  })
}

// 编辑出入库
export const editStock = (data) => {
  data.token = getToken()
  return axios.request({
    url: 'serverClinic/editStock',
    data: data,
    method: 'post'
  })
}
