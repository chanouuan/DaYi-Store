<template>
  <Modal footer-hide :value="model_value" :width="90" :styles="{top:'16px'}" :mask-closable="false" @on-visible-change="modalChange">
    <p slot="header">
      编辑信息
    </p>
    <!-- 添加患者信息 -->
    <Form ref="cardForm" :rules="ruleCardForm" :model="formItem" :label-width="60">
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
      <Row>
        <Col span="15">
          <FormItem label="主诉">
            <Input :maxlength="200" v-model="formItem.patient_complaint" placeholder="请填写主诉症状"/>
          </FormItem>
        </Col>
        <Col span="9">
          <FormItem label="过敏史">
            <Select :max-tag-count="1" v-model="formItem.patient_allergies" placeholder="请填写过敏史" filterable multiple>
              <Option v-for="(item, index) in allergy" :value="item" :key="index">{{ item }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="15">
          <FormItem label="诊断">
            <Input :maxlength="200" v-model="formItem.patient_diagnosis" placeholder="请填写诊断"/>
          </FormItem>
        </Col>
        <Col span="9">
          <FormItem label="医师">
            <Select v-model="formItem.doctor_id" placeholder="请填写医师" filterable>
              <Option v-for="item in doctors" :value="item.id" :key="item.id">{{ item.nickname }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Divider orientation="center" dashed><Icon type="ios-create-outline"/> 处方笺</Divider>
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
        <Col span="1"><Button style="color:#2d8cf0;border-color:#2d8cf0" size="small" @click="noteRemove(index)">删除</Button></Col>
      </Row>
      <Row class="note-row" :key="index" v-else-if="note.category==2">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="4">{{ note.name }}</Col>
        <Col span="3">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="15">{{ note.usages_name }}</Col>
        <Col span="1"><Button style="color:#2d8cf0;border-color:#2d8cf0" size="small" @click="noteRemove(index)">删除</Button></Col>
      </Row>
      <Row class="note-row" :key="index" v-else-if="note.category==3">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="4">{{ note.name }}</Col>
        <Col span="3">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="3">￥{{ note.price }}</Col>
        <Col span="12">{{ note.remark }}&nbsp;</Col>
        <Col span="1"><Button style="color:#2d8cf0;border-color:#2d8cf0" size="small" @click="noteRemove(index)">删除</Button></Col>
      </Row>
      </template>
      <Divider orientation="right" dashed>合计：<span style="color:#ed4014">￥{{ totalMoney }}</span></Divider>
      <FormItem style="text-align: right">
        <Button type="primary" style="margin-left: 8px" :loading="submit" @click="saveDoctorCard(2)">保存并收费</Button>
        <Button type="primary" style="margin-left: 8px" :loading="submit" @click="saveDoctorCard(1)">保存</Button>
      </FormItem>
    </Form>
    <!-- 添加处方笺 -->
    <note-form ref="noteForm" @on-note="addNote"></note-form>
    <Spin fix v-if="loading"></Spin>
  </Modal>
</template>

<script>
import {
  getAllergyEnum,
  getDoctorList,
  getDoctorOrderDetail,
  saveDoctorCard
} from '@/api/server'
import NoteForm from '_c/diagnose/note-form'
import ElementAutoComplete from '_c/diagnose/element-auto-complete'
export default {
  name: 'card-form',
  components: {
    NoteForm,
    ElementAutoComplete
  },
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
      submit: false,
      allergy: [],
      doctors: [],
      formItem: {
        patient_id: 0,
        patient_name: '',
        patient_tel: '',
        patient_gender: '1',
        patient_age_year: '',
        patient_age_month: '',
        patient_complaint: '',
        patient_allergies: [],
        patient_diagnosis: '',
        doctor_id: 0,
        note_dose: 0,
        note_side: 0,
        advice: '',
        voice: '',
        notes: []
      },
      ruleCardForm: {
        patient_name: [
          { required: true, message: '患者姓名不能为空', trigger: 'blur' }
        ]
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
    modalChange (val) {
      // 关闭
      this.$emit('child-change', val)
      if (val) {
        this.loadData()
        this.detail()
      }
    },
    selectPatientName (row) {
      // 患者信息
      this.formItem.patient_id = row.id
      this.formItem.patient_name = row.name || ''
      this.formItem.patient_gender = row.gender + ''
      this.formItem.patient_tel = row.telephone
      this.formItem.patient_age_year = ~~row.age_year
      this.formItem.patient_age_month = ~~row.age_month
    },
    saveDoctorCard (type) {
      // 保存订单 type 1保存 2保存并收费
      if (this.submit) return
      this.submit = true
      let data = {
        order_id: this.order_id
      }
      // 处方笺必填
      if (!this.formItem.notes.length) {
        this.submit = false
        return this.$Message.error('请先添加药品')
      }
      this.$refs['cardForm'].validate((valid) => {
        if (!valid) {
          this.submit = false
          return
        }
        data = Object.assign(data, this.formItem)
        data.patient_age = data.patient_age_year + data.patient_age_month / 100
        data.patient_allergies = data.patient_allergies.join(';')
        data.notes = JSON.stringify(data.notes)
        // 保存
        saveDoctorCard(data).then(res => {
          res.money = parseFloat(this.totalMoney)
          res.order_id = ~~this.order_id
          res.type = type
          this.$emit('child-change', false)
          this.$emit('on-success', res)
        }).catch(err => {
          this.submit = false
          this.$Modal.error({
            title: '提示',
            content: err
          })
        })
      })
    },
    addNote (note) {
      // 添加处方
      if (note.relation_id) {
        // 先计算金额
        note.price *= note.total_amount
        this.formItem.notes.push(note)
      }
    },
    noteRemove (index) {
      // 删除处方
      let note = this.formItem.notes[index]
      this.formItem.notes.splice(index, 1)
      this.$refs.noteForm.note[note.category].count--
    },
    detail () {
      // 获取详情
      this.loading = true
      getDoctorOrderDetail({ order_id: this.order_id }).then(res => {
        this.loading = false
        this.formItem.patient_name = res.patient_name || ''
        this.formItem.patient_tel = res.patient_tel
        this.formItem.patient_gender = (res.patient_gender ? res.patient_gender : '1') + ''
        this.formItem.patient_age_year = res.patient_age ? parseInt(res.patient_age) : ''
        this.formItem.patient_age_month = res.patient_age ? Math.round((parseFloat(res.patient_age) - parseInt(res.patient_age)) * 100) : ''
        this.formItem.patient_complaint = res.patient_complaint
        this.formItem.patient_allergies = res.patient_allergies ? res.patient_allergies.split(';') : []
        this.formItem.patient_diagnosis = res.patient_diagnosis
        this.formItem.doctor_id = res.doctor_id
        this.formItem.note_dose = res.note_dose
        this.formItem.note_side = res.note_side
        this.formItem.advice = res.advice
        this.formItem.notes = res.notes || []
        this.$refs.noteForm.note[1].count = 0
        this.$refs.noteForm.note[2].count = 0
        this.$refs.noteForm.note[3].count = 0
        this.formItem.notes.forEach(n => {
          this.$refs.noteForm.note[n.category].count++
        })
      }).catch(err => {
        this.$Message.error(err)
      })
    },
    loadData () {
      // 获取过敏史
      if (!this.allergy.length) {
        getAllergyEnum().then(res => {
          this.allergy = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
      // 获取医生
      if (!this.doctors.length) {
        getDoctorList(true).then(res => {
          this.doctors = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
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
