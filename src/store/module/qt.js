import config from '@/config'
import qwebchannel from '@/libs/qwebchannel'
import { Notice } from 'view-design'

export default {
  state: {
    qtSocket: null,
    qtDialog: null,
    qtRunning: false
  },
  getters: {
    //
  },
  mutations: {
    //
    setQtSocket (state, qtSocket) {
      state.qtSocket = qtSocket
    },
    setQtDialog (state, qtDialog) {
      state.qtDialog = qtDialog
    },
    setQtRunning (state, qtRunning) {
      state.qtRunning = qtRunning
    }
  },
  actions: {
    //
    createQtChannel ({ state, commit }) {
      let baseUrl = config.qtChannelWebSocketAddr
      let beginTime = (new Date()).getTime()
      Notice.info({
        title: `Connecting at ${baseUrl}`,
        duration: 2
      })
      return new Promise((resolve, reject) => {
        if (state.qtRunning) return
        const qtSocket = new WebSocket(baseUrl)
        qtSocket.onclose = () => {
          commit('setQtRunning', false)
          Notice.error({
            title: '通信连接已关闭'
          })
        }
        qtSocket.onerror = (error) => {
          commit('setQtRunning', false)
          console.error(JSON.stringify(error))
        }
        qtSocket.onopen = () => {
          qwebchannel.QWebChannel(qtSocket, (channel) => {
            const dialog = channel.objects.dialog
            commit('setQtDialog', dialog)
            commit('setQtRunning', true)
            Notice.success({
              title: '系统通信启动成功（' + parseFloat((new Date().getTime() - beginTime) / 1000).toFixed(2) + 's）',
              duration: 2
            })
          })
        }
        commit('setQtSocket', qtSocket)
      })
    },
    sendQtText ({ state }, { text }) {
      if (!state.qtRunning) return
      Notice.info({
        title: '发送消息',
        desc: text
      })
      state.qtDialog.receiveText(text)
    },
    onQtMessage ({ state }, fn) {
      if (!state.qtRunning) return
      state.qtDialog.sendText.connect((message) => {
        Notice.warning({
          title: '接收消息',
          desc: message
        })
        fn && fn(message)
      })
    },
    sendLoginCmd ({ state, rootState }) {
      // 登录
      if (!state.qtRunning) return
      const { user: { clinicInfo } } = rootState
      let text = {
        code: 100,
        data: {
          'hospital_id': clinicInfo.id,
          'hospital_name': clinicInfo.name
        }
      }
      state.qtDialog.receiveText(JSON.stringify(text))
    },
    sendBeginVoiceCmd ({ state, rootState }) {
      // 开始录音
      if (!state.qtRunning) return
      const { user: { userId, userName } } = rootState
      let text = {
        code: 101,
        data: {
          'user_id': userId,
          'user_name': userName
        }
      }
      state.qtDialog.receiveText(JSON.stringify(text))
    },
    sendEndVoiceCmd ({ state, rootState }, { order_id }) {
      // 结束录音
      if (!state.qtRunning) return
      const { user: { userId, userName } } = rootState
      let text = {
        code: 102,
        data: {
          'user_id': userId,
          'user_name': userName,
          'order_id': order_id
        }
      }
      state.qtDialog.receiveText(JSON.stringify(text))
    },
    sendPrintCmd ({ state }, { type, print_size, content }) {
      // 打印
      if (!state.qtRunning) return
      let text = {
        code: 300,
        data: {
          'type': type, // 1直接打印 2预览打印
          'print_size': print_size, // A4 B5 D57
          'content': content
        }
      }
      state.qtDialog.receiveText(JSON.stringify(text))
    }
  }
}
