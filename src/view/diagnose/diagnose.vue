<template>
  <Row :gutter="16">
    <Col span="18">
      <Card style="margin-bottom: 16px" shadow>
        <Steps :current="currentStep">
          <Step title="待就诊" content="医生待就诊"></Step>
          <Step title="就诊中" content="医生就诊中"></Step>
          <Step title="完成" content="医生就诊结束"></Step>
        </Steps>
      </Card>
      <CreateCard @on-voice="voice" :storeInfo="storeInfo" v-if="currentStep==0"></CreateCard>
      <AdviceForm @on-back="back" @on-success="success" :storeInfo="storeInfo" v-else-if="currentStep==1"></AdviceForm>
      <CompleteCard @on-complete="complete" :storeInfo="storeInfo" v-else-if="currentStep==2"></CompleteCard>
    </Col>
    <Col span="6">
      <Card shadow>
        <p slot="title" style="overflow:hidden;text-align:center">
          <Icon @click="nextPage" type="md-arrow-dropright" size="20" color="#2b85e4" style="float:right;cursor:pointer;"/>
          <Icon @click="lastPage" type="md-arrow-dropleft" size="20" color="#2b85e4" style="float:left;cursor:pointer;"/>
          今日就诊<span v-show="totalCount">（{{ totalCount }}）</span>
        </p>
        <Table :no-data-text="noDataText" :columns="todayRecordColumns" :data="todayRecordData" :loading="todayRecordLoading"></Table>
        <Page style="margin-top:15px;" :page-size="pageSize" :current.sync="current" :total="totalCount" @on-change="changePage" simple/>
      </Card>
    </Col>
  </Row>
</template>

<script>
import {
  getTodayOrderList
} from '@/api/server'
import CreateCard from '_c/diagnose/create-card'
import AdviceForm from '_c/diagnose/advice-form'
import CompleteCard from '_c/diagnose/complete-card'
export default {
  components: {
    CreateCard,
    AdviceForm,
    CompleteCard
  },
  data () {
    return {
      currentStep: 0,
      todayRecordLoading: false,
      totalCount: 0,
      pageSize: 5,
      currentPage: new Date(),
      current: 1,
      storeInfo: {
        id: 0,
        name: ''
      },
      todayRecordColumns: [
        {
          title: '姓名',
          key: 'patient_name',
          render: (h, params) => {
            if (!params.row.patient_name) {
              return h('span', '待录入')
            }
            return h('div', [
              h('Icon', {
                props: {
                  type: 'md-female',
                  color: params.row.patient_gender === 1 ? 'blue' : 'pink'
                }
              }),
              h('span', params.row.patient_name)
            ])
          }
        },
        {
          title: '时间',
          key: 'create_time'
        }
      ],
      todayRecordData: []
    }
  },
  computed: {
    noDataText () {
      if (!this.todayRecordData.length) {
        return this.currentPage.getFullYear() + '-' + (this.currentPage.getMonth() + 1) + '-' + this.currentPage.getDate()
      }
      return '暂无数据'
    }
  },
  methods: {
    voice () {
      this.currentStep = 1
      // 录音
      let text = {
        code: 101,
        data: {
          code: 1,
          user_id: this.$store.state.user.userId
        }
      }
      text = JSON.stringify(text)
      this.$store.dispatch('sendQtText', { text })
    },
    success (data) {
      this.currentStep = 2
    },
    back () {
      this.currentStep = 0
    },
    complete () {
      this.currentStep = 0
      this.currentPage = new Date()
      this.loadDoctorOrderList()
    },
    loadDoctorOrderList (data) {
      // 加载会诊记录
      data = data || {}
      if (this.todayRecordLoading) return
      this.todayRecordLoading = true
      if (!data.page) this.current = 1
      getTodayOrderList(data).then(res => {
        this.todayRecordLoading = false
        this.totalCount = res.total_count
        this.pageSize = res.page_size
        this.todayRecordData = res.list
      }).catch(err => {
        this.todayRecordLoading = false
        this.$Message.error(err)
      })
    },
    changePage (page) {
      // 会诊记录换页
      let start_time = this.currentPage.getFullYear() + '-' + (this.currentPage.getMonth() + 1) + '-' + this.currentPage.getDate()
      this.loadDoctorOrderList({ page, start_time })
    },
    lastPage () {
      // 上一天
      this.currentPage.setTime(this.currentPage.getTime() - 86400000)
      let start_time = this.currentPage.getFullYear() + '-' + (this.currentPage.getMonth() + 1) + '-' + this.currentPage.getDate()
      this.loadDoctorOrderList({ start_time })
    },
    nextPage () {
      // 下一天
      this.currentPage.setTime(this.currentPage.getTime() + 86400000)
      let start_time = this.currentPage.getFullYear() + '-' + (this.currentPage.getMonth() + 1) + '-' + this.currentPage.getDate()
      this.loadDoctorOrderList({ start_time })
    }
  },
  created () {
    this.storeInfo = this.$store.state.user.storeInfo
    this.loadDoctorOrderList()
  }
}
</script>

<style scoped>

</style>
