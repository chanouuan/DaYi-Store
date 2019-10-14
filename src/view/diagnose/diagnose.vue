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
      <AdviceForm :storeInfo="storeInfo" v-if="currentStep==1"></AdviceForm>
    </Col>
    <Col span="6">
      <Card shadow>
          <Table :columns="columns1" :data="data1"></Table>
          <Page style="margin-top:15px;" :total="100" simple />
      </Card>
    </Col>
  </Row>
</template>

<script>
import CreateCard from '_c/diagnose/create-card'
import AdviceForm from '_c/diagnose/advice-form'
export default {
  components: {
    CreateCard,
    AdviceForm
  },
  data () {
    return {
      currentStep: 0,
      storeInfo: {
        id: 0,
        name: ''
      },
      columns1: [
        {
          title: 'Name',
          key: 'name'
        },
        {
          title: 'Address',
          key: 'address'
        }
      ],
      data1: [
        {
          name: 'John Brown',
          age: 18,
          address: 'New York No. 1 Lake Park',
          date: '2016-10-03'
        },
        {
          name: 'Jim Green',
          age: 24,
          address: 'London No. 1 Lake Park',
          date: '2016-10-01'
        },
        {
          name: 'Joe Black',
          age: 30,
          address: 'Sydney No. 1 Lake Park',
          date: '2016-10-02'
        },
        {
          name: 'Jon Snow',
          age: 26,
          address: 'Ottawa No. 2 Lake Park',
          date: '2016-10-04'
        }
      ]
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
      console.log(text)
      this.$store.dispatch('sendQtText', { text })
    }
  },
  created () {
    this.storeInfo = this.$store.state.user.storeInfo
  }
}
</script>

<style scoped>

</style>
