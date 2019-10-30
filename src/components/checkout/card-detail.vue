<template>
  <Modal :value="model_value" :width="80" :styles="{top:'16px'}" :mask-closable="false" @on-visible-change="modalChange">
    <p slot="header">
      查看信息
    </p>
    <Card v-if="formItem.enum_source===1" shadow>
      <!-- 患者信息 -->
      <Row>
        <Col span="6">
          姓名：{{ formItem.patient_name }}
        </Col>
        <Col span="6">
          性别：{{ gender }}
        </Col>
        <Col span="6">
          年龄：{{ age }}
        </Col>
        <Col span="6">
          手机：{{ formItem.patient_tel }}
        </Col>
      </Row>
      <Row style="margin-top:10px">
        <Col span="15">
          主诉：{{ formItem.patient_complaint }}
        </Col>
        <Col span="9">
          过敏史：{{ formItem.patient_allergies }}
        </Col>
      </Row>
      <Row style="margin-top:10px">
        <Col span="15">
          诊断：{{ formItem.patient_diagnosis }}
        </Col>
        <Col span="9">
          医师：{{ formItem.doctor_name }}
        </Col>
      </Row>
      <Row style="margin-top:10px">
        <Col>录音：{{ formItem.voice }}</Col>
      </Row>
      <Divider orientation="center">药品</Divider>
      <!-- 处方笺列表 -->
      <template v-for="(note, index) in formItem.notes">
      <Row class="note-row" :key="index" v-if="note.category==1">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="4">{{ note.name }}</Col>
        <Col span="3">{{ note.package_spec }}</Col>
        <Col span="3">{{ note.single_amount+note.dosage_unit }}</Col>
        <Col span="3">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="3">{{ note.usages_name }}</Col>
        <Col span="3">{{ note.frequency_name }}</Col>
        <Col span="3">{{ note.drug_days }}天</Col>
        <Col span="1">￥{{ note.price }}</Col>
      </Row>
      <Row class="note-row" :key="index" v-else-if="note.category==2">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="4">{{ note.name }}</Col>
        <Col span="3">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="15">{{ note.usages_name }}</Col>
        <Col span="1">￥{{ note.price }}</Col>
      </Row>
      <Row class="note-row" :key="index" v-else-if="note.category==3">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="4">{{ note.name }}</Col>
        <Col span="3">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="3">￥{{ note.price }}</Col>
        <Col span="12">{{ note.remark }}&nbsp;</Col>
        <Col span="1">￥{{ note.price }}</Col>
      </Row>
      </template>
      <!-- 收费 -->
      <Divider orientation="center">费用</Divider>
      <Row>
        <Col span="8">
          已收：￥{{ formItem.pay }}
        </Col>
        <Col span="8">
          优惠：￥{{ formItem.discount }}
        </Col>
        <Col span="8">
          支付方式：{{ payway }}
        </Col>
      </Row>
    </Card>
    <Card v-else-if="formItem.enum_source===2" shadow>
      <!-- 患者信息 -->
      <Row>
        <Col span="6">
          姓名：{{ formItem.patient_name }}
        </Col>
        <Col span="6">
          性别：{{ gender }}
        </Col>
        <Col span="6">
          年龄：{{ age }}
        </Col>
        <Col span="6">
          手机：{{ formItem.patient_tel }}
        </Col>
      </Row>
      <Divider orientation="center">药品</Divider>
      <!-- 处方笺列表 -->
      <template v-for="(note, index) in formItem.notes">
      <Row class="note-row" :key="index">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="8">{{ note.name }}</Col>
        <Col span="5">{{ note.package_spec }}</Col>
        <Col span="5">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="5">￥{{ note.price }}</Col>
      </Row>
      </template>
      <!-- 收费 -->
      <Divider orientation="center">费用</Divider>
      <Row>
        <Col span="8">
          已收：￥{{ formItem.pay }}
        </Col>
        <Col span="8">
          优惠：￥{{ formItem.discount }}
        </Col>
        <Col span="8">
          支付方式：{{ payway }}
        </Col>
      </Row>
    </Card>
    <div slot="footer">
      <Button v-show="formItem.enum_source===1" type="default" :loading="loading" @click="printCard">打印会诊单</Button>
      <Button type="default" :loading="loading" @click="printCharge">打印收费单</Button>
      <Button type="primary" :loading="loading" @click="modalChange(false)">关闭</Button>
    </div>
  </Modal>
</template>

<script>
import {
  getDoctorOrderDetail,
  printTemplete
} from '@/api/server'
export default {
  name: 'card-detail',
  model: {
    prop: 'model_value',
    event: 'child-change'
  },
  props: {
    model_value: Boolean,
    order_id: Number
  },
  data () {
    return {
      loading: false,
      formItem: {
        enum_source: 0,
        patient_id: 0,
        patient_name: '',
        patient_tel: '',
        patient_gender: '1',
        patient_age: '',
        patient_complaint: '',
        patient_allergies: [],
        patient_diagnosis: '',
        doctor_id: 0,
        note_dose: 0,
        note_side: 0,
        advice: '',
        voice: '',
        pay: 0,
        discount: 0,
        payway: [],
        notes: []
      }
    }
  },
  computed: {
    payway () {
      // 支付方式
      let arr = []
      this.formItem.payway.forEach(n => {
        arr.push(n.payway + '￥' + n.money)
      })
      return arr.join(' | ')
    },
    gender () {
      // 性别
      if (!this.formItem.patient_name) return ''
      if (this.formItem.patient_gender === 1) return '男'
      if (this.formItem.patient_gender === 2) return '女'
      return '保密'
    },
    age () {
      // 年龄
      let year = this.formItem.patient_age ? parseInt(this.formItem.patient_age) : ''
      let month = this.formItem.patient_age ? Math.round((parseFloat(this.formItem.patient_age) - parseInt(this.formItem.patient_age)) * 100) : ''
      let arr = []
      if (year) {
        arr.push(year + '岁')
      }
      if (month) {
        arr.push(month + '个月')
      }
      return arr.join('')
    }
  },
  methods: {
    modalChange (val) {
      // 关闭
      this.$emit('child-change', val)
      if (val) {
        this.detail()
      }
    },
    printCard () {
      // 打印
      this.loading = true
      let text = {
        type: 1, // 1直接打印 2预览打印
        print_size: 'A4', // A4 B5 D57
        content: ''
      }
      printTemplete({ order_id: this.order_id, type: 2 }).then(res => {
        this.loading = false
        text.content = res.content
        this.$store.dispatch('sendPrintCmd', text)
      }).catch(err => {
        this.loading = false
        this.$Message.error(err)
      })
    },
    printCharge () {
      // 打印
      this.loading = true
      let text = {
        type: 1, // 1直接打印 2预览打印
        print_size: 'D57', // A4 B5 D57
        content: ''
      }
      printTemplete({ order_id: this.order_id, type: 3 }).then(res => {
        this.loading = false
        text.content = res.content
        this.$store.dispatch('sendPrintCmd', text)
      }).catch(err => {
        this.loading = false
        this.$Message.error(err)
      })
    },
    detail () {
      // 获取详情
      this.loading = true
      getDoctorOrderDetail({ order_id: this.order_id }).then(res => {
        this.loading = false
        this.formItem = Object.assign({}, res)
      }).catch(err => {
        this.loading = false
        this.$Message.error(err)
      })
    }
  }
}
</script>

<style scoped>
.note-row{
  height: 36px;
  line-height: 36px;
}
</style>
