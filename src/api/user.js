import axios from '@/libs/api.request'
import md5 from 'js-md5'

export const login = ({ userName, password }) => {
  const data = {
    username: userName,
    password: md5(password)
  }
  return axios.request({
    url: 'serverClinic/login',
    data,
    method: 'post'
  })
}

export const getUserInfo = (token) => {
  return axios.request({
    url: 'serverClinic/getUserProfile',
    data: {
      token: token
    },
    method: 'post'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'serverClinic/logout',
    data: {
      token: token
    },
    method: 'post'
  })
}

export const getMessage = () => {
  return axios.request({
    url: 'message/init',
    method: 'get'
  })
}

export const getContentByMsgId = msg_id => {
  return axios.request({
    url: 'message/content',
    method: 'get',
    params: {
      msg_id
    }
  })
}

export const hasRead = msg_id => {
  return axios.request({
    url: 'message/has_read',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const removeReaded = msg_id => {
  return axios.request({
    url: 'message/remove_readed',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const restoreTrash = msg_id => {
  return axios.request({
    url: 'message/restore',
    method: 'post',
    data: {
      msg_id
    }
  })
}
