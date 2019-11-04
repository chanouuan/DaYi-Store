<template>
  <Card shadow v-show="model_value">
    <Form ref="formRef" :rules="ruleForm" :model="form" :label-width="100">
      <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
        项目
      </p>
      <Row>
        <Col span="8">
          <FormItem label="项目编号" prop="ident">
            <Input :maxlength="20" v-model.trim="form.ident"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="项目名称" prop="name">
            <Input :maxlength="20" v-model.trim="form.name"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="项目单价" prop="price">
            <Input :maxlength="5" v-model.number="form.price"/>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="项目单位" prop="unit">
            <Select v-model="form.unit" transfer filterable>
              <Option v-for="(item, index) in unitList" :value="item" :key="index">{{ item }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="拼音码">
            <Input :maxlength="20" v-model.trim="form.py_code"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="五笔码">
            <Input :maxlength="20" v-model.trim="form.wb_code"/>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="6">
          <FormItem label="项目提成">
            <Select v-model="form.royalty">
              <Option :value="0">无提成</Option>
              <Option :value="1">提成比例</Option>
              <Option :value="2">固定金额</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="" :label-width="10">
            <Input v-if="form.royalty" v-model.number="form.royalty_ratio" :maxlength="5">
              <span slot="append">{{ royaltyUnit }}</span>
            </Input>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="特检项目">
            <RadioGroup v-model="form.is_special">
              <Radio label="" border>否</Radio>
              <Radio label="1" border>是</Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="6" v-show="id">
          <FormItem label="启用状态">
            <RadioGroup v-model="form.status">
              <Radio label="" border>停用</Radio>
              <Radio label="1" border>启用</Radio>
            </RadioGroup>
          </FormItem>
        </Col>
      </Row>
      <div style="text-align: center;margin: 16px 0;">
        <Button style="width: 150px" type="default" :loading="submit" @click="cancel()">取消</Button>
        <Button type="primary" style="width: 150px;margin-left: 16px" :loading="submit" @click="save()">保存</Button>
      </div>
    </Form>
  </Card>
</template>

<script>
import {
  getTreatmentUnitEnum,
  saveTreatment,
  getTreatmentInfo
} from '@/api/server'
import { wordToPy, wordToWb } from '@/libs/wordtopy'
export default {
  name: 'add-treatment',
  model: {
    prop: 'model_value',
    event: 'child-change'
  },
  props: {
    model_value: Boolean,
    id: {
      type: Number,
      default: 0
    }
  },
  data () {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        callback(new Error())
      } else {
        callback()
      }
    }
    const validatePrice = (rule, value, callback) => {
      value = parseFloat(value)
      if (isNaN(value) || value <= 0) {
        callback(new Error())
      } else {
        callback()
      }
    }
    return {
      submit: false,
      t: null,
      unitList: [],
      form: {
        name: '',
        ident: '',
        price: '',
        unit: '',
        royalty: '',
        royalty_ratio: '',
        wb_code: '',
        py_code: '',
        is_special: '',
        status: ''
      },
      ruleForm: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        ident: [
          { required: true, message: '编号不能为空', trigger: 'blur' }
        ],
        unit: [
          { validator: validateRequire, required: true, message: '单位不能为空', trigger: 'change' }
        ],
        price: [
          { validator: validatePrice, required: true, message: '单价必须大于0', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    royaltyUnit () {
      if (this.form.royalty === 1) return '%'
      else if (this.form.royalty === 2) return '元'
      return ''
    }
  },
  watch: {
    model_value (val) {
      if (val) {
        this.loadData()
      } else {
        this.clearData()
      }
    },
    'form.name': {
      handler () {
        clearTimeout(this.t)
        this.t = setTimeout(() => {
          this.form.py_code = wordToPy(this.form.name)
          this.form.wb_code = wordToWb(this.form.name)
        }, 500)
      }
    }
  },
  methods: {
    clearData () {
      // 清空
      for (let n in this.form) {
        this.form[n] = ''
      }
    },
    cancel () {
      // 取消
      this.$refs['formRef'].resetFields()
      this.$emit('child-change', false)
      this.$emit('on-complete', {})
    },
    save () {
      // 保存
      if (this.submit) return
      this.submit = true
      this.$refs['formRef'].validate((valid) => {
        if (!valid) {
          this.submit = false
          return
        }
        if (this.form.royalty === 1) {
          this.form.royalty_ratio = ~~this.form.royalty_ratio
          if (this.form.royalty_ratio <= 0 || this.form.royalty_ratio > 100) {
            this.submit = false
            return this.$Message.error('请填写正确的提成比例')
          }
        } else if (this.form.royalty === 2) {
          this.form.royalty_ratio = parseFloat(this.form.royalty_ratio)
          this.form.royalty_ratio = isNaN(this.form.royalty_ratio) ? 0 : this.form.royalty_ratio
          if (this.form.royalty_ratio <= 0 || this.form.royalty_ratio > this.form.price) {
            this.submit = false
            return this.$Message.error('提成金额不能大于项目金额')
          }
        }
        this.form.id = this.id
        saveTreatment(this.form).then(res => {
          this.submit = false
          if (this.id) {
            // 编辑成功
            this.cancel()
          } else {
            // 添加成功
            this.$Modal.confirm({
              title: '成功提示',
              content: '<p>操作成功</p><p>是否继续添加？</p>',
              onOk: () => {
                this.clearData()
              },
              onCancel: () => {
                this.cancel()
              }
            })
          }
        }).catch(err => {
          this.submit = false
          this.$Modal.error({
            title: '提示',
            content: err
          })
        })
      })
    },
    loadData () {
      // 加载信息
      if (this.id) {
        this.submit = true
        getTreatmentInfo(this.id).then(res => {
          this.submit = false
          this.form = Object.assign(this.form, res)
        }).catch(err => {
          this.$Message.error(err)
        })
      }
      // 获取项目单位
      if (!this.unitList.length) {
        getTreatmentUnitEnum().then(res => {
          this.unitList = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
    }
  }
}
</script>
