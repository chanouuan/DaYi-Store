<template>
  <Card shadow>
    <p slot="title">
      {{ storeInfo.name }}
    </p>
    <a href="#" slot="extra" @click.prevent="changeAdvanced">
      <Icon type="ios-repeat" :class="rotateIcon"></Icon>
      {{ rotateModel }}
    </a>
    <div v-if="!advanced" style="text-align:center">
      <Button @click="createCard" style="width: 150px; height: 150px;font-size: 80px" shape="circle" icon="md-checkmark"></Button>
    </div>
    <!-- 添加患者信息 -->
    <Form v-if="advanced" ref="cardForm" :rules="ruleCardForm" :model="formItem" :label-width="60">
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
            <FormItem label="年龄" :label-width="38">
              <Input type="number" :maxlength="3" v-model="formItem.patient_age_year">
                <span slot="append">岁</span>
              </Input>
          </FormItem>
            </Col>
            <Col span="10">
            <FormItem label="" :label-width="5">
              <Input type="number" :maxlength="2" v-model="formItem.patient_age_month">
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
      <Divider orientation="center" dashed>处方笺</Divider>
      <!-- 处方笺列表 -->
      <Row type="flex" justify="start">
        <Col offset="1" span="3" v-for="note in formItem.notes" :key="note.relation_id">
          <Tag closable>{{ note.name }}</Tag>
        </Col>
      </Row>
      <Divider orientation="right" dashed>合计：<span style="color:#ed4014">￥{{ parseFloat(formItem.total_money).toFixed(2) }}</span></Divider>
      <FormItem style="text-align: right">
        <Button type="warning" icon="ios-print">打印</Button>
        <Button type="primary" style="margin-left: 8px" :loading="submit" @click="createCard">保存并收费</Button>
        <Button type="primary" style="margin-left: 8px" :loading="submit" @click="createCard">保存</Button>
      </FormItem>
    </Form>
    <!-- 添加处方笺 -->
    <note-form v-if="advanced" @on-note="addNote"></note-form>
  </Card>
</template>

<script>
import {
  getAllergyEnum,
  getDoctorList
} from '@/api/server'
import NoteForm from '_c/diagnose/note-form'
import ElementAutoComplete from '_c/diagnose/element-auto-complete'
import { oneOf } from '@/libs/tools'
export default {
  name: 'advice-form',
  components: {
    NoteForm,
    ElementAutoComplete
  },
  props: {
    storeInfo: Object
  },
  data () {
    return {
      submit: false,
      advanced: false,
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
        total_money: 0,
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
    rotateIcon () {
      return [
        'menu-icon',
        this.advanced ? 'rotate-icon' : ''
      ]
    },
    rotateModel () {
      return this.advanced ? '快捷模式' : '高级模式'
    }
  },
  methods: {
    selectPatientName (row) {
      // 患者信息
      this.formItem.patient_id = row.id
      this.formItem.patient_name = row.name
      this.formItem.patient_gender = row.gender + ''
      this.formItem.patient_tel = row.telephone
      this.formItem.patient_age_year = row.age_year
      this.formItem.patient_age_month = row.age_month
    },
    createCard () {
      // 创建订单
      if (this.submit) return
      this.submit = true
      // 高级模式表单验证
      if (this.advanced) {
        this.$refs['cardForm'].validate((valid) => {
          if (valid) {
            this.$Message.success('Success!')
          } else {
            this.$Message.error('Fail!')
          }
        })
      }
      // 结束录音
      let text = {
        code: 101,
        data: {
          code: 2,
          user_id: this.$store.state.user.userId
        }
      }
      text = JSON.stringify(text)
      console.log(text)
      this.$store.dispatch('sendQtText', { text })
    },
    addNote (note) {
      // 添加处方
      if (note.relation_id) {
        this.formItem.notes.push(note)
      }
    },
    changeAdvanced () {
      // 切换模式
      this.advanced = !this.advanced
      this.loadData()
    },
    loadData () {
      if (!this.advanced) return
      // 当前登录人是否医生
      if (oneOf(3, this.$store.state.user.role)) {
        this.formItem.doctor_id = this.$store.state.user.userId
      }
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
        getDoctorList().then(res => {
          this.doctors = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
    }
  },
  mounted () {
    this.loadData()
  }
}
</script>

<style scoped>
.menu-icon{
  font-weight: bold;
  font-size: 16px;
  transition: all .3s;
}
.rotate-icon{
  transform: rotate(180deg);
}
</style>
