<template>
  <Card shadow v-show="model_value">
    <Tabs type="card" :value="selectTabName" @on-click="selectTab" :animated="false">
      <TabPane label="西药/中成药" :disabled="id&&selectTabName!=='west'?true:false" name="west">
        <!-- 添加西药表单 -->
        <Form ref="addWestForm" :rules="ruleWestForm" :model="westForm" :label-width="100">
          <Card shadow>
            <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
              药品信息
            </p>
            <Row v-show="!id">
              <Col span="8">
                <FormItem label="药品查询">
                  <element-auto-complete _icon="ios-search" @on-select="selectWestDrugName" _placeholder="国药准字/药品名称/拼音码/五笔码/条形码" _apiname="searchWestDrugDict"></element-auto-complete>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <FormItem label="药品名称" prop="name">
                  <Input :maxlength="20" v-model.trim="westForm.name"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="规格" prop="package_spec">
                  <Input :maxlength="50" v-model.trim="westForm.package_spec"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="药品类型" prop="drug_type">
                  <Select v-model="westForm.drug_type">
                    <Option value="1">西药</Option>
                    <Option value="2">中成药</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <FormItem label="国药准字">
                  <Input :maxlength="30" v-model.trim="westForm.approval_num"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="厂家">
                  <Input :maxlength="50" v-model.trim="westForm.manufactor_name"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="剂型" prop="dosage_type">
                  <Select v-model="westForm.dosage_type" transfer filterable>
                    <Option v-for="item in dosages" :value="item.id" :key="item.id">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <FormItem label="条形码">
                  <Input :maxlength="20" v-model.trim="westForm.barcode"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="商品名">
                  <Input :maxlength="50" v-model.trim="westForm.goods_name"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="本位码">
                  <Input :maxlength="20" v-model.trim="westForm.standard_code"/>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <FormItem label="拼音码" style="margin-bottom: 0">
                  <Input :maxlength="20" v-model.trim="westForm.py_code"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="五笔码" style="margin-bottom: 0">
                  <Input :maxlength="20" v-model.trim="westForm.wb_code"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="药品编码" style="margin-bottom: 0">
                  <Input :maxlength="32" v-model.trim="westForm.drug_code"/>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card shadow>
            <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
              处方信息
            </p>
            <Row>
              <Col span="4">
                <FormItem label="编辑规格" prop="unit">
                  <Input :maxlength="5" v-model.trim="westForm.dosage_amount" placeholder="剂量"></Input>
                </FormItem>
              </Col>
              <Col span="2">
                <FormItem label="" :label-width="3">
                  <Select v-model="westForm.dosage_unit" placeholder="剂量单位" transfer filterable>
                    <Option v-for="(item, index) in unitList[1]" :value="item" :key="index">{{ item }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="3">
                <FormItem label="*" :label-width="30">
                  <Input :maxlength="5" v-model.number="westForm.basic_amount" placeholder="制剂数量"></Input>
                </FormItem>
              </Col>
              <Col span="2">
                <FormItem label="" :label-width="3">
                  <Select v-model="westForm.basic_unit" placeholder="制剂单位" transfer filterable>
                    <Option v-for="(item, index) in unitList[2]" :value="item" :key="index">{{ item }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="3">
                <FormItem label="/" :label-width="30">
                  <Select v-model="westForm.dispense_unit" placeholder="库存单位" transfer filterable>
                    <Option v-for="(item, index) in unitList[3]" :value="item" :key="index">{{ item }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="2">
                <FormItem label="" :label-width="16">
                  <Tooltip placement="top" theme="light" :max-width="350">
                    <Button type="primary" shape="circle" icon="md-help" size="small"></Button>
                    <div slot="content">
                      <img src="~@/assets/images/drug-help.png"/>
                    </div>
                  </Tooltip>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="5">
                <FormItem label="零售价" style="margin-bottom: 2px" prop="retail_price">
                  <Input :maxlength="5" placeholder="零售价（元）" v-model.number="westForm.retail_price"></Input>
                </FormItem>
              </Col>
              <Col span="7" offset="1">
                <FormItem label="是否抗菌药物" style="margin-bottom: 2px">
                  <RadioGroup v-model="westForm.is_antibiotic">
                    <Radio label="" border>否</Radio>
                    <Radio label="1" border>是</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card shadow>
            <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
              使用信息
            </p>
            <Row>
              <Col span="5">
                <FormItem label="默认用法">
                  <Select transfer v-model="westForm.usages" filterable>
                    <Option v-for="item in usageList[1]" :value="item.id" :key="item.id">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="5" offset="3">
                <FormItem label="默认频率">
                  <Select transfer v-model="westForm.frequency" filterable>
                    <Option v-for="item in frequencyList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="7" offset="3" v-show="id">
                <FormItem label="启用状态">
                  <RadioGroup v-model="westForm.status">
                    <Radio label="" border>停用</Radio>
                    <Radio label="1" border>启用</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <div style="text-align: center;margin: 16px 0;">
            <Button style="width: 150px" type="default" :loading="submit" @click="cancel('addWestForm')">取消</Button>
            <Button type="primary" style="width: 150px;margin-left: 16px" :loading="submit" @click="save('addWestForm')">保存</Button>
          </div>
        </Form>
      </TabPane>
      <TabPane label="中药" :disabled="id&&selectTabName!=='chinese'?true:false" name="chinese">
        <!-- 添加中药表单 -->
        <Form ref="addChineseForm" :rules="ruleWestForm" :model="westForm" :label-width="100">
          <Card shadow>
            <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
              药品信息
            </p>
            <Row v-show="!id">
              <Col span="8">
                <FormItem label="药品查询">
                  <element-auto-complete _icon="ios-search" @on-select="selectWestDrugName" _placeholder="药品名称/拼音码/五笔码" _apiname="searchChineseDrugDict"></element-auto-complete>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <FormItem label="药品名称" prop="name">
                  <Input :maxlength="20" v-model.trim="westForm.name"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="规格" prop="package_spec">
                  <Input :maxlength="50" v-model.trim="westForm.package_spec"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="药品类型" prop="drug_type">
                  <Select v-model="westForm.drug_type">
                    <Option value="3">草药</Option>
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <FormItem label="厂商">
                  <Input :maxlength="50" v-model.trim="westForm.manufactor_name"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="拼音码">
                  <Input :maxlength="20" v-model.trim="westForm.py_code"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="五笔码">
                  <Input :maxlength="20" v-model.trim="westForm.wb_code"/>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <FormItem label="本位码" style="margin-bottom: 0">
                  <Input :maxlength="20" v-model.trim="westForm.standard_code"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="药品编码" style="margin-bottom: 0">
                  <Input :maxlength="32" v-model.trim="westForm.drug_code"/>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card shadow>
            <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
              处方信息
            </p>
            <Row>
              <Col span="5">
                <FormItem label="零售单位" prop="dispense_unit" style="margin-bottom: 2px">
                  <Select v-model="westForm.dispense_unit" placeholder="零售单位" transfer filterable>
                    <Option v-for="(item, index) in unitList[4]" :value="item" :key="index">{{ item }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem label="零售价" prop="retail_price" style="margin-bottom: 2px">
                  <Input :maxlength="5" placeholder="零售价（元）" v-model.number="westForm.retail_price"></Input>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card shadow>
            <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
              使用信息
            </p>
            <Row>
              <Col span="5">
                <FormItem label="默认用法">
                  <Select transfer v-model="westForm.usages" filterable>
                    <Option v-for="item in usageList[2]" :value="item.id" :key="item.id">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="7" offset="3" v-show="id">
                <FormItem label="启用状态">
                  <RadioGroup v-model="westForm.status">
                    <Radio label="" border>停用</Radio>
                    <Radio label="1" border>启用</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <div style="text-align: center;margin: 16px 0;">
            <Button style="width: 150px" type="default" :loading="submit" @click="cancel('addChineseForm')">取消</Button>
            <Button type="primary" style="width: 150px;margin-left: 16px" :loading="submit" @click="save('addChineseForm')">保存</Button>
          </div>
        </Form>
      </TabPane>
      <TabPane label="材料" :disabled="id&&selectTabName!=='material'?true:false" name="material">
        <!-- 添加材料表单 -->
        <Form ref="addMaterialForm" :rules="ruleWestForm" :model="westForm" :label-width="100">
          <Card shadow>
            <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
              基本属性
            </p>
            <Row>
              <Col span="8">
                <FormItem label="材料名称" prop="name">
                  <Input :maxlength="20" v-model.trim="westForm.name"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="规格" prop="package_spec">
                  <Input :maxlength="50" v-model.trim="westForm.package_spec"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="厂商">
                  <Input :maxlength="50" v-model.trim="westForm.manufactor_name"/>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
                <FormItem label="拼音码">
                  <Input :maxlength="20" v-model.trim="westForm.py_code"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="五笔码">
                  <Input :maxlength="20" v-model.trim="westForm.wb_code"/>
                </FormItem>
              </Col>
              <Col span="8">
                <FormItem label="材料编码" style="margin-bottom: 0">
                  <Input :maxlength="32" v-model.trim="westForm.drug_code"/>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Card shadow>
            <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
              使用信息
            </p>
            <Row>
              <Col span="5">
                <FormItem label="零售单位" prop="dispense_unit" style="margin-bottom: 2px">
                  <Select v-model="westForm.dispense_unit" placeholder="零售单位" transfer filterable>
                    <Option v-for="(item, index) in unitList[4]" :value="item" :key="index">{{ item }}</Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span="5">
                <FormItem label="零售价" prop="retail_price" style="margin-bottom: 2px">
                  <Input :maxlength="5" placeholder="零售价（元）" v-model.number="westForm.retail_price"></Input>
                </FormItem>
              </Col>
              <Col span="7" v-show="id">
                <FormItem label="启用状态">
                  <RadioGroup v-model="westForm.status">
                    <Radio label="" border>停用</Radio>
                    <Radio label="1" border>启用</Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
          </Card>
          <div style="text-align: center;margin: 16px 0;">
            <Button style="width: 150px" type="default" :loading="submit" @click="cancel('addMaterialForm')">取消</Button>
            <Button type="primary" style="width: 150px;margin-left: 16px" :loading="submit" @click="save('addMaterialForm')">保存</Button>
          </div>
        </Form>
      </TabPane>
    </Tabs>
    <Spin fix v-if="loading"></Spin>
  </Card>
</template>

<script>
import {
  getDosageEnum,
  getDrugUnitEnum,
  saveDrug,
  getDrugInfo
} from '@/api/server'
import { wordToPy, wordToWb } from '@/libs/wordtopy'
import ElementAutoComplete from '_c/diagnose/element-auto-complete'
export default {
  name: 'add-drug',
  components: {
    ElementAutoComplete
  },
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
    const validateUnit = (rule, value, callback) => {
      if (!this.westForm.dosage_amount || !this.westForm.dosage_unit || !this.westForm.basic_amount || !this.westForm.basic_unit || !this.westForm.dispense_unit) {
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
      loading: false,
      submit: false,
      t: null,
      dosageList: {},
      unitList: {},
      usageList: {},
      frequencyList: [],
      selectTabName: 'west',
      westForm: {
        name: '',
        package_spec: '',
        dosage_type: '',
        drug_type: '',
        approval_num: '',
        manufactor_name: '',
        barcode: '',
        goods_name: '',
        standard_code: '',
        py_code: '',
        wb_code: '',
        drug_code: '',
        dosage_amount: '',
        dosage_unit: '',
        basic_amount: '',
        basic_unit: '',
        dispense_unit: '',
        retail_price: '',
        is_antibiotic: '',
        usages: '',
        frequency: '',
        status: ''
      },
      ruleWestForm: {
        name: [
          { required: true, message: '药品名称不能为空', trigger: 'blur' }
        ],
        package_spec: [
          { required: true, message: '规格不能为空', trigger: 'blur' }
        ],
        drug_type: [
          { required: true, message: '药品类型不能为空', trigger: 'change' }
        ],
        dosage_type: [
          { validator: validateRequire, required: true, message: '剂型不能为空', trigger: 'change' }
        ],
        unit: [
          { validator: validateUnit, required: true, message: '请填写规格', trigger: 'blur' }
        ],
        dispense_unit: [
          { validator: validateRequire, required: true, message: '单位不能为空', trigger: 'change' }
        ],
        retail_price: [
          { validator: validatePrice, required: true, message: '零售价必须大于0', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dosages () {
      // 剂量
      return this.dosageList[this.westForm.drug_type] || []
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
    'westForm.name': {
      handler () {
        clearTimeout(this.t)
        this.t = setTimeout(() => {
          this.westForm.py_code = wordToPy(this.westForm.name)
          this.westForm.wb_code = wordToWb(this.westForm.name)
        }, 500)
      }
    }
  },
  methods: {
    selectTab (name) {
      // 点击 tab
      if (this.selectTabName !== name) {
        this.selectTabName = name
        this.clearData()
      }
    },
    clearData () {
      // 清空
      for (let n in this.westForm) {
        this.westForm[n] = ''
      }
    },
    selectWestDrugName (row) {
      // 查询西药
      this.westForm = Object.assign(this.westForm, row)
    },
    cancel (formRef) {
      // 取消
      if (formRef) this.$refs[formRef].resetFields()
      this.$emit('child-change', false)
      this.$emit('on-complete', {})
    },
    save (formRef) {
      // 保存
      if (this.submit) return
      this.submit = true
      this.$refs[formRef].validate((valid) => {
        if (!valid) {
          this.submit = false
          return
        }
        if (formRef === 'addMaterialForm') {
          this.westForm.drug_type = 4
        }
        this.westForm.id = this.id
        saveDrug(this.westForm).then(res => {
          this.submit = false
          if (this.id) {
            // 编辑成功
            this.cancel(formRef)
          } else {
            // 添加成功
            this.$Modal.confirm({
              title: '成功提示',
              content: '<p>操作成功</p><p>是否继续添加？</p>',
              onOk: () => {
                this.clearData()
              },
              onCancel: () => {
                this.cancel(formRef)
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
      // 加载药品信息
      if (this.id) {
        this.loading = true
        getDrugInfo(this.id).then(res => {
          this.loading = false
          this.westForm = Object.assign(this.westForm, res)
          if (res.drug_type === '4') this.selectTabName = 'material'
          else if (res.drug_type === '3') this.selectTabName = 'chinese'
          else this.selectTabName = 'west'
        }).catch(err => {
          this.$Message.error(err)
        })
      }
      // 获取药品剂型
      if (!this.dosageList[1]) {
        getDosageEnum().then(res => {
          this.dosageList = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
      // 获取药品单位
      if (!this.unitList[1]) {
        getDrugUnitEnum().then(res => {
          this.unitList = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
      // 加载药品使用方式
      if (!this.usageList[1]) {
        this.$store.dispatch('getUsageList').then(res => {
          this.usageList = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
      // 加载药品使用频率
      if (!this.frequencyList.length) {
        this.$store.dispatch('getFrequencyList').then(res => {
          this.frequencyList = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
    }
  }
}
</script>
