<template>
  <Card shadow>
    <p slot="title">
      {{ clinicInfo.name }}
    </p>
    <Form :model="formItem" :label-width="60">
      <Row>
        <Col span="6">
          <FormItem label="姓名" prop="patient_name">
            <element-auto-complete v-model="formItem.patient_name" @on-select="selectPatientName" _placeholder="请填写患者姓名" _apiname="searchPatient"></element-auto-complete>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="性别">
            <RadioGroup v-model="formItem.patient_gender">
              <Radio label="1">男</Radio>
              <Radio label="2">女</Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="6">
          <Row>
            <Col span="14">
            <FormItem label="年龄" :label-width="40">
              <Input :maxlength="3" v-model.number="formItem.patient_age_year">
                <span slot="append">岁</span>
              </Input>
            </FormItem>
            </Col>
            <Col span="10">
            <FormItem label="" :label-width="5">
              <Input :maxlength="2" v-model.number="formItem.patient_age_month">
                <span slot="append">月</span>
              </Input>
            </FormItem>
            </Col>
          </Row>
        </Col>
        <Col span="6">
          <FormItem label="手机">
            <Input :maxlength="11" type="tel" v-model="formItem.patient_tel" placeholder="请填写手机号码"/>
          </FormItem>
        </Col>
      </Row>
      <Divider orientation="center" dashed><Icon type="ios-create-outline"/> 药品</Divider>
      <!-- 药品列表 -->
      <template v-for="(note, index) in formItem.notes">
      <Row class="note-row" :key="index">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="7">{{ note.name }}</Col>
        <Col span="5">{{ note.package_spec }}</Col>
        <Col span="5">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="5">￥{{ note.price }}</Col>
        <Col span="1"><Button size="small" shape="circle" icon="ios-close" @click="noteRemove(index)"></Button></Col>
      </Row>
      </template>
      <Divider orientation="right" dashed>合计：<span style="color:#ed4014">￥{{ totalMoney }}</span></Divider>
      <FormItem style="text-align: right">
        <Button type="warning" icon="md-print" :loading="submit" @click="createCard(1)">收费并打印</Button>
        <Button type="primary" style="margin-left: 8px" :loading="submit" @click="createCard(0)">收费</Button>
      </FormItem>
    </Form>
    <!-- 添加药品 -->
    <note-form ref="noteForm" @on-note="addNote"></note-form>
    <!-- 收费 -->
    <Charge @on-charge-complete="chargeComplete" v-model="chargeModal" :money="chargeParam.money" :order_id="chargeParam.order_id"></Charge>
  </Card>
</template>

<script>
import {
  buyDrug,
  printTemplete
} from '@/api/server'
import NoteForm from '_c/buy_drug/note-form'
import Charge from '_c/charge/charge'
import ElementAutoComplete from '_c/diagnose/element-auto-complete'
export default {
  components: {
    NoteForm,
    Charge,
    ElementAutoComplete
  },
  data () {
    return {
      submit: false,
      chargeModal: false,
      printStatus: 0,
      chargeParam: {
        money: 0,
        order_id: 0
      },
      formItem: {
        patient_id: 0,
        patient_name: '',
        patient_tel: '',
        patient_gender: '1',
        patient_age_year: '',
        patient_age_month: '',
        notes: []
      }
    }
  },
  computed: {
    totalMoney () {
      // 计算总金额
      let total = 0
      this.formItem.notes.forEach(element => {
        total += element.price
      })
      return parseFloat(total).toFixed(2)
    }
  },
  methods: {
    selectPatientName (row) {
      // 患者信息
      this.formItem.patient_id = row.id
      this.formItem.patient_name = row.name || ''
      this.formItem.patient_gender = row.gender + ''
      this.formItem.patient_tel = row.telephone
      this.formItem.patient_age_year = ~~row.age_year
      this.formItem.patient_age_month = ~~row.age_month
    },
    addNote (note) {
      // 添加药品
      if (note.relation_id) {
        // 先计算金额
        note.price *= note.total_amount
        this.formItem.notes.push(note)
      }
    },
    noteRemove (index) {
      // 删除药品
      let note = this.formItem.notes[index]
      this.formItem.notes.splice(index, 1)
      this.$refs.noteForm.note[note.category].count--
    },
    chargeComplete (res) {
      // 收费完成
      if (this.printStatus && res.msg_code === 'ok') {
        // 打印
        let text = {
          type: 1, // 1直接打印 2预览打印
          print_size: 'D57', // A4 B5 D57
          content: ''
        }
        printTemplete({ order_id: res.order_id, type: 3 }).then(res => {
          text.content = res.content
          this.$store.dispatch('sendPrintCmd', text)
        }).catch(err => {
          this.$Message.error(err)
        })
      }
      this.initData()
    },
    createCard (type) {
      // 创建订单
      if (this.submit) return
      this.submit = true
      // 处方笺必填
      if (!this.formItem.notes.length) {
        this.submit = false
        return this.$Message.error('请先添加药品')
      }
      this.printStatus = type
      let data = Object.assign({}, this.formItem)
      data.patient_age = data.patient_age_year + data.patient_age_month / 100
      let notes = []
      data.notes.forEach(n => {
        notes.push({
          category: n.category,
          relation_id: n.relation_id,
          total_amount: n.total_amount
        })
      })
      data.notes = JSON.stringify(notes)
      // 生成订单
      buyDrug(data).then(res => {
        // 收费
        this.submit = false
        this.chargeParam.money = ~~this.totalMoney
        this.chargeParam.order_id = ~~res.order_id
        this.chargeModal = true
      }).catch(err => {
        this.submit = false
        this.$Modal.error({
          title: '提示',
          content: err
        })
      })
    },
    initData () {
      // 初始化
      this.formItem = {
        patient_id: 0,
        patient_name: '',
        patient_tel: '',
        patient_gender: '1',
        patient_age_year: '',
        patient_age_month: '',
        notes: []
      }
      this.$refs.noteForm.note[1].count = 0
      this.$refs.noteForm.note[2].count = 0
      this.$refs.noteForm.note[4].count = 0
    }
  },
  created () {
    this.clinicInfo = this.$store.state.user.clinicInfo
  }
}
</script>

<style scoped>

</style>
