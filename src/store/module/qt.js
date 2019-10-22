import config from '@/config'
import qwebchannel from '@/libs/qwebchannel'
import { Notice } from 'iview'

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
          Notice.error({
            title: '通信连接错误: ' + JSON.stringify(error)
          })
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
    sendQtText ({ state, commit }, { text }) {
      if (!state.qtRunning) return
      Notice.info({
        title: '发送消息',
        desc: text
      })
      state.qtDialog.receiveText(text)
    },
    onQtMessage ({ state, commit }, fn) {
      if (!state.qtRunning) return
      state.qtDialog.sendText.connect((message) => {
        Notice.warning({
          title: '接收消息',
          desc: message
        })
        fn && fn(message)
      })
    }
  }
}
