<template>
  <Card shadow>
    <p slot="title">
      {{ clinicInfo.name }}
    </p>
    <a href="#" slot="extra" @click.prevent="changeAdvanced">
      <Icon type="md-refresh" :class="rotateIcon"></Icon>
      {{ rotateModel }}
    </a>
    <div v-if="!advanced" style="text-align:center">
      <div style="position:absolute;bottom:0;left:0">
        <Button @click="backTo" type="text">
          <Icon type="ios-arrow-back"></Icon> 返回上一步
        </Button>
      </div>
      <i-circle
        :size="150"
        :percent="66"
        stroke-linecap="square"
        stroke-color="#43a3fb"
        style="cursor:pointer;"
        @click.native="createCard(1)">
        <div style="font-size:16px;">
          结束会诊
        </div>
      </i-circle>
    </div>
    <template v-else>
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
        <Col span="1"><Button size="small" shape="circle" icon="ios-close" @click="noteRemove(index)"></Button></Col>
      </Row>
      <Row class="note-row" :key="index" v-else-if="note.category==2">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="4">{{ note.name }}</Col>
        <Col span="3">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="15">{{ note.usages_name }}</Col>
        <Col span="1"><Button size="small" shape="circle" icon="ios-close" @click="noteRemove(index)"></Button></Col>
      </Row>
      <Row class="note-row" :key="index" v-else-if="note.category==3">
        <Col span="1">{{ index+1 }}.</Col>
        <Col span="4">{{ note.name }}</Col>
        <Col span="3">{{ note.total_amount+note.dispense_unit }}</Col>
        <Col span="3">￥{{ note.price }}</Col>
        <Col span="12">{{ note.remark }}&nbsp;</Col>
        <Col span="1"><Button size="small" shape="circle" icon="ios-close" @click="noteRemove(index)"></Button></Col>
      </Row>
      </template>
      <Divider orientation="right" dashed>合计：<span style="color:#ed4014">￥{{ totalMoney }}</span></Divider>
      <FormItem style="text-align: right">
        <Button @click="backTo"><Icon type="ios-arrow-back"></Icon> 返回上一步</Button>
        <Button type="warning" style="margin-left: 8px" icon="md-print" :loading="submit" @click="createCard(3)">打印</Button>
        <Button type="primary" style="margin-left: 8px" :loading="submit" @click="createCard(2)">保存并收费</Button>
        <Button type="primary" style="margin-left: 8px" :loading="submit" @click="createCard(1)">保存</Button>
      </FormItem>
    </Form>
    <!-- 添加处方笺 -->
    <note-form ref="noteForm" @on-note="addNote"></note-form>
    <!-- 收费 -->
    <Charge @on-charge-complete="chargeComplete" v-model="chargeModal" :money="chargeParam.money" :order_id="chargeParam.order_id"></Charge>
    </template>
  </Card>
</template>

<script>
import {
  getAllergyEnum,
  getDoctorList,
  createDoctorCard,
  printTemplete
} from '@/api/server'
import NoteForm from '_c/diagnose/note-form'
import ElementAutoComplete from '_c/diagnose/element-auto-complete'
import Charge from '_c/charge/charge'
export default {
  name: 'advice-form',
  components: {
    NoteForm,
    ElementAutoComplete,
    Charge
  },
  props: {
    clinicInfo: Object
  },
  data () {
    return {
      chargeModal: false,
      chargeParam: {
        money: 0,
        order_id: 0
      },
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
    },
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
    backTo () {
      // 返回上一步
      this.$Modal.confirm({
        title: '确认返回上一步吗？',
        content: '<p>本次会诊记录将不再保存。</p>',
        onOk: () => {
          // 先结束录音
          this.endVoice(1, '', '')
          this.$emit('on-back')
        }
      })
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
    chargeComplete (res) {
      // 收费完成
      this.$emit('on-success', res)
    },
    createCard (type) {
      // 创建订单
      if (this.submit) return
      this.submit = true
      let data = {
        advanced: ~~this.advanced
      }
      // 高级模式表单验证
      if (this.advanced) {
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
          // 生成订单
          createDoctorCard(data).then(res => {
            this.endVoice(type, res.order_id, res.print_code)
            if (type === 2) {
              // 收费
              this.chargeParam.money = parseFloat(this.totalMoney)
              this.chargeParam.order_id = ~~res.order_id
              this.chargeModal = true
            } else {
              this.$emit('on-success', res)
            }
          }).catch(err => {
            this.submit = false
            this.$Modal.error({
              title: '提示',
              content: err
            })
          })
        })
      } else {
        // 生成订单
        createDoctorCard(data).then(res => {
          this.endVoice(type, res.order_id, res.print_code)
          this.$emit('on-success', res)
        }).catch(err => {
          this.submit = false
          this.$Modal.error({
            title: '提示',
            content: err
          })
        })
      }
    },
    endVoice (type, order_id, print_code) {
      // 结束录音
      this.$store.dispatch('sendEndVoiceCmd', { order_id })
      if (type !== 3 && !print_code) return
      // 打印
      let text = {
        type: 1, // 1直接打印 2预览打印
        print_size: print_code ? 'D57' : 'A4', // A4 B5 D57
        content: ''
      }
      printTemplete({ order_id: order_id, type: print_code ? 1 : 2 }).then(res => {
        text.content = res.content
        this.$store.dispatch('sendPrintCmd', text)
      }).catch(err => {
        this.$Message.error(err)
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
    changeAdvanced () {
      // 切换模式
      this.advanced = !this.advanced
      this.$store.commit('setAdvanced', this.advanced)
      this.loadData()
    },
    loadData () {
      if (!this.advanced) return
      // 当前登录人设为就诊医生
      this.formItem.doctor_id = this.$store.state.user.userId
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
          // 将当前登录人加入到医师列表
          let has = false
          this.doctors.forEach(n => {
            if (n.id === this.$store.state.user.userId) {
              has = true
            }
          })
          if (!has) {
            this.doctors.push({
              id: this.$store.state.user.userId,
              nickname: this.$store.state.user.userName
            })
          }
        }).catch(err => {
          this.$Message.error(err)
        })
      }
    }
  },
  mounted () {
    this.advanced = this.$store.state.user.advanced
    this.loadData()
  }
}
</script>

<style scoped>
.menu-icon{
  font-size: 16px;
  transition: all .3s;
}
.rotate-icon{
  transform: rotate(180deg);
}
.note-row{
  height: 36px;
  line-height: 36px;
}
</style>
