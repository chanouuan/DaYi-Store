<template>
  <Card shadow v-show="model_value">
    <p slot="title" style="border-left:2px solid #2d8cf0;padding-left: 10px;">
      新增入库
    </p>
    <Form ref="formRef" :rules="ruleForm" :model="form" :label-width="100">
      <Row>
        <Col span="8">
          <FormItem label="入库日期" prop="stock_date">
            <DatePicker v-model="form.stock_date" type="date"></DatePicker>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="入库方式" prop="stock_way">
            <Select v-model="form.stock_way">
              <Option v-for="item in stockWay" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="供应商">
            <Input :maxlength="30" v-model.trim="form.supplier"/>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="发票号">
            <Input :maxlength="30" v-model.trim="form.invoice"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="备注">
            <Input :maxlength="50" v-model.trim="form.remark"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="购入总金额">
            ￥{{ totalMoney }}
          </FormItem>
        </Col>
      </Row>
      <!-- 药品输入 -->
      <Row class-name="col-th thead">
        <Col span="3" class-name="col-td">药品名称</Col>
        <Col span="3" class-name="col-td">规格</Col>
        <Col span="2" class-name="col-td"><span style="font-family:SimSun;color:#ed4014;margin-right:4px;">*</span>入库数量</Col>
        <Col span="2" class-name="col-td">进货价</Col>
        <Col span="3" class-name="col-td">批号</Col>
        <Col span="3" class-name="col-td">零售价</Col>
        <Col span="3" class-name="col-td">有效期</Col>
        <Col span="3" class-name="col-td">生产商</Col>
        <Col span="2" class-name="col-td">操作</Col>
      </Row>
      <Row class-name="col-th" v-for="(item, index) in form.details" :key="index">
        <Col span="3" class-name="col-td">{{ item.name }}</Col>
        <Col span="3" class-name="col-td">{{ item.package_spec }}</Col>
        <Col span="2" class-name="col-td">
          <Input :maxlength="5" v-model.number="item.amount" :placeholder="item.dispense_unit"/>
        </Col>
        <Col span="2" class-name="col-td">
          <Input :maxlength="5" v-model.number="item.purchase_price" placeholder="元"/>
        </Col>
        <Col span="3" class-name="col-td">
          <Input :maxlength="30" v-model.trim="item.batch_number" placeholder="批号"/>
        </Col>
        <Col span="3" class-name="col-td">
          {{ item.retail_price }}元 / {{ item.dispense_unit}}
        </Col>
        <Col span="3" class-name="col-td">
          <DatePicker transfer v-model="item.valid_time" type="date" placeholder="请选择日期"></DatePicker>
        </Col>
        <Col span="3" class-name="col-td">
          <Input :maxlength="30" v-model.trim="item.manufactor_name" placeholder="名称"/>
        </Col>
        <Col span="2" class-name="col-td">
          <Button @click="removeItem(index)" size="small" style="color:#2d8cf0;border-color:#2d8cf0">删除</Button>
        </Col>
      </Row>
      <Row style="margin: 16px 0;">
        <Col span="8">
          <element-auto-complete v-model="drugName" _icon="ios-search" @on-select="selectDrug" _placeholder="名称/条码/五笔码/拼音码" _apiname="searchDrug"></element-auto-complete>
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
  getStockWayEnum,
  addStock
} from '@/api/server'
import ElementAutoComplete from '_c/diagnose/element-auto-complete'
export default {
  name: 'add-pull',
  components: {
    ElementAutoComplete
  },
  model: {
    prop: 'model_value',
    event: 'child-change'
  },
  props: {
    model_value: Boolean
  },
  data () {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        callback(new Error())
      } else {
        callback()
      }
    }
    return {
      submit: false,
      drugName: '',
      stockWay: [],
      form: {
        stock_date: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate(),
        stock_way: '',
        supplier: '',
        invoice: '',
        remark: '',
        details: []
      },
      ruleForm: {
        stock_date: [
          { validator: validateRequire, required: true, message: '入库日期不能为空', trigger: 'blur' }
        ],
        stock_way: [
          { validator: validateRequire, required: true, message: '入库方式不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    totalMoney () {
      // 计算购入总金额
      let total = 0
      this.form.details.forEach(n => {
        if (~~n.amount > 0) {
          let price = parseFloat(n.purchase_price)
          price = (isNaN(price) || price < 0) ? 0 : price
          total += n.amount * price
        }
      })
      return total
    }
  },
  watch: {
    model_value (val) {
      if (val) {
        this.loadData()
      } else {
        this.clearData()
      }
    }
  },
  methods: {
    selectDrug (row) {
      // 搜索药品
      let data = {}
      data.drug_id = row.id
      data.name = row.name
      data.package_spec = row.package_spec
      data.amount = ''
      data.dispense_unit = row.dispense_unit
      data.purchase_price = ''
      data.batch_number = ''
      data.retail_price = row.price
      data.valid_time = ''
      data.manufactor_name = row.manufactor_name
      this.form.details.push(data)
      this.drugName = ''
    },
    removeItem (index) {
      // 删除药品
      this.form.details.splice(index, 1)
    },
    clearData () {
      // 清空
      for (let n in this.form) {
        this.form[n] = ''
      }
      this.form.stock_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
      this.form.details = []
    },
    cancel (res) {
      // 取消
      this.$refs['formRef'].resetFields()
      this.$emit('child-change', false)
      this.$emit('on-complete', res || {})
    },
    save () {
      // 保存
      if (this.submit) return
      this.submit = true
      this.$refs['formRef'].validate(valid => {
        if (!valid) {
          this.submit = false
          return
        }
        if (!this.form.details.length) {
          this.submit = false
          return this.$Message.error('请先填写药品')
        }
        for (let n in this.form.details) {
          // 效验药品
          if (!this.form.details[n].drug_id) {
            this.submit = false
            return this.$Message.error('药品不能为空')
          }
          this.form.details[n].amount = ~~this.form.details[n].amount || ''
          if (!this.form.details[n].amount || this.form.details[n].amount <= 0) {
            this.submit = false
            return this.$Message.error('入库数量必须大于0')
          }
        }
        let data = Object.assign({}, this.form)
        let details = []
        data.details.forEach(n => {
          details.push({
            drug_id: n.drug_id,
            amount: n.amount,
            purchase_price: n.purchase_price,
            batch_number: n.batch_number,
            valid_time: n.valid_time,
            manufactor_name: n.manufactor_name
          })
        })
        data.details = JSON.stringify(details)
        data.stock_type = 1 // 入库
        addStock(data).then(res => {
          this.submit = false
          this.cancel({ msg_code: 'ok' })
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
      // 加载入库方式
      if (!this.stockWay.length) {
        getStockWayEnum().then(res => {
          this.stockWay = res[1] || []
        }).catch(err => {
          this.$Message.error(err)
        })
      }
    }
  }
}
</script>

<style scoped>
.thead{
  background-color: #f8f8f9;
  border-top: 1px solid #e8eaec;
}
.col-th{
  line-height: 42px;
  border-bottom: 1px solid #e8eaec;
  border-left: 1px solid #e8eaec;
  text-align: center;
}
.col-td{
  border-right: 1px solid #e8eaec;
  padding: 0 5px;
}
</style>
