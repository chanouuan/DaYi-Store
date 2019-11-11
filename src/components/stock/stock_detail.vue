<template>
  <Modal :value="model_value" :width="90" :styles="{top:'16px'}" :mask-closable="false" @on-visible-change="modalChange">
    <p slot="header">
      查看信息
    </p>
    <div v-if="form.stock_type===1">
      <!-- 入库 -->
      <Form :label-width="100" label-colon>
        <Row>
          <Col span="8">
            <FormItem label="入库日期">
              {{ form.stock_date }}
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="入库方式">
              {{ form.stock_way }}
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="供应商">
              {{ form.supplier }}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="8">
            <FormItem label="发票号">
              <template v-if="editInvoice">
                <Input @on-blur="editInvoiceAction" :maxlength="30" v-model.trim="form.invoice" placeholder="请输入发票号"/>
              </template>
              <template v-else>
                {{ form.invoice }} <Icon @click="editInvoice=!editInvoice" size="20" color="#2d8cf0" type="md-create"/>
              </template>
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="备注">
              {{ form.remark }}
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="购入总金额">
              ￥{{ form.purchase_price }}
            </FormItem>
          </Col>
        </Row>
      </Form>
      <Table ref="table" :columns="columns" :data="form.details" border></Table>
    </div>
    <div slot="footer">
      <Button v-if="form.status===0" style="width:150px" type="primary" :loading="submit" @click="confirm">确认入库</Button>
      <Button style="width:150px" type="default" :loading="submit" @click="exportCsv">导出</Button>
      <Button style="width:150px" type="default" :loading="submit" @click="modalChange(false)">关闭</Button>
    </div>
    <Spin fix v-if="loading"></Spin>
  </Modal>
</template>

<script>
import {
  stockDetail,
  confirmStock,
  editStock
} from '@/api/server'
export default {
  name: 'stock-detail',
  model: {
    prop: 'model_value',
    event: 'child-change'
  },
  props: {
    model_value: Boolean,
    stock_id: Number
  },
  data () {
    return {
      loading: false,
      submit: false,
      editInvoice: false,
      invoice: '',
      form: {
        stock_type: '',
        stock_date: '',
        stock_way: '',
        supplier: '',
        invoice: '',
        remark: '',
        purchase_price: '',
        details: []
      },
      columns: [
        {
          title: '类型',
          key: 'drug_type'
        },
        {
          title: '药品名称',
          tooltip: true,
          key: 'name'
        },
        {
          title: '规格',
          tooltip: true,
          key: 'package_spec'
        },
        {
          title: '入库数量',
          key: 'amount'
        },
        {
          title: '单位',
          key: 'dispense_unit'
        },
        {
          title: '进货价',
          key: 'purchase_price'
        },
        {
          title: '批号',
          key: 'batch_number'
        },
        {
          title: '零售价',
          key: 'retail_price'
        },
        {
          title: '有效期',
          tooltip: true,
          key: 'valid_time'
        },
        {
          title: '生产商',
          tooltip: true,
          key: 'manufactor_name'
        }
      ]
    }
  },
  methods: {
    modalChange (val) {
      // 关闭
      this.$emit('child-change', val)
      if (val) {
        this.editInvoice = false
        this.detail()
      }
    },
    editInvoiceAction () {
      // 编辑发票号
      if (this.form.invoice === this.invoice) {
        this.editInvoice = false
        return
      }
      this.invoice = this.form.invoice
      this.submit = true
      editStock({ stock_id: this.stock_id, invoice: this.form.invoice }).then(res => {
        this.submit = false
        this.editInvoice = false
      }).catch(err => {
        this.submit = false
        this.$Message.error(err)
      })
    },
    exportCsv () {
      // 导出
      this.$refs.table.exportCsv({
        filename: '入库单' + this.stock_id,
        columns: this.columns,
        data: this.rows
      })
    },
    confirm () {
      // 确认
      this.submit = true
      confirmStock(this.stock_id).then(res => {
        this.submit = false
        this.modalChange(false)
        this.$emit('on-complete', { msg_code: 'ok' })
      }).catch(err => {
        this.submit = false
        this.$Message.error(err)
      })
    },
    detail () {
      // 获取详情
      this.loading = true
      stockDetail(this.stock_id).then(res => {
        this.loading = false
        this.form = Object.assign({}, res)
        this.invoice = this.form.invoice
      }).catch(err => {
        this.loading = false
        this.$Message.error(err)
      })
    }
  }
}
</script>
