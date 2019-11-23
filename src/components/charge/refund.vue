<template>
  <Modal :value="model_value" :width="80" :styles="{top:'16px'}" :mask-closable="false" @on-visible-change="modalChange">
    <p slot="header">
      退费
    </p>
    <div style="background-color: #f8f8f9; border-radius: 5px; padding: 16px; border: 1px solid #e8eaec; margin-bottom: 16px;">
      <Row style="margin-bottom: 16px;">
        <Col span="6">
          姓名：{{ form.patient_name }}
        </Col>
        <Col span="6">
          性别：{{ gender }}
        </Col>
        <Col span="6">
          年龄：{{ age }}
        </Col>
        <Col span="6">
          手机：{{ form.patient_tel }}
        </Col>
      </Row>
      <Row>
        <Col span="6">
          本次费用：￥{{ form.pay+form.discount }}
        </Col>
        <Col span="6">
          已收：￥{{ form.pay }}
        </Col>
        <Col span="6">
          优惠：￥{{ form.discount }}
        </Col>
        <Col span="6">
          已退：￥{{ form.refund }}
        </Col>
      </Row>
    </div>
    <Table @on-selection-change="selectItem" :columns="columns" :data="form.notes" border></Table>
    <div style="padding: 16px">
      <Row>
        <Col span="2" style="line-height: 32px">
          退费方式：
        </Col>
        <Col span="8">
          <Select v-model="payway" transfer>
            <Option value="0">原路退还</Option>
            <Option v-for="item in paywayList" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </Col>
        <Col offset="1" span="8" style="line-height: 32px">
          应退：<span style="color:#ed4014; font-size:16px">￥{{ refundPrice }}</span>
        </Col>
      </Row>
      <Row style="margin-top: 16px">
        <Col span="2" style="line-height: 32px">
          退费原因：
        </Col>
        <Col span="22">
          <Input v-model.trim="remark" maxlength="100" show-word-limit></Input>
        </Col>
      </Row>
    </div>
    <div slot="footer">
      <span style="color: #ff9900; margin-right: 5px" v-if="this.form.discount">该笔收费存在优惠金额，不支持单项退费！</span>
      <span style="color: #ff9900; margin-right: 5px" v-else>温馨提示：当前退费为不可逆动作，请谨慎操作！</span>
      <Button type="error" :loading="submit" :disabled="disabled" @click="onRefund">确定退费</Button>
      <Button type="default" style="width: 100px" @click="modalChange(false)">关闭</Button>
    </div>
    <Spin fix v-if="loading"></Spin>
  </Modal>
</template>

<script>
import {
  getDoctorOrderDetail,
  localRefund
} from '@/api/server'
export default {
  name: 'refund',
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
      disabled: true,
      paywayList: [],
      payway: '0',
      remark: '',
      refundPrice: 0,
      form: {
        notes: []
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '项目名称',
          tooltip: true,
          key: 'name'
        },
        {
          title: '规格',
          tooltip: true,
          key: 'package_spec'
        },
        {
          title: '总量',
          key: 'total_amount',
          render: (h, params) => {
            return h('span', params.row.total_amount + params.row.dispense_unit)
          }
        },
        {
          title: '已退数量',
          key: 'back_amount',
          render: (h, params) => {
            return h('span', params.row.back_amount + params.row.dispense_unit)
          }
        },
        {
          title: '单价',
          key: 'unit_price'
        },
        {
          title: '金额',
          key: 'price',
          render: (h, params) => {
            return h('span', params.row.unit_price * params.row.total_amount)
          }
        },
        {
          title: '退费数量',
          key: '_back_amount',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: params.row._back_amount,
                disabled: params.row._input
              },
              on: {
                input: (val) => {
                  this.inputAmount(params.index, val)
                }
              }
            })
          }
        }
      ]
    }
  },
  computed: {
    gender () {
      // 性别
      if (!this.form.patient_name) return ''
      if (this.form.patient_gender === 1) return '男'
      if (this.form.patient_gender === 2) return '女'
      return '保密'
    },
    age () {
      // 年龄
      let year = this.form.patient_age ? parseInt(this.form.patient_age) : ''
      let month = this.form.patient_age ? Math.round((parseFloat(this.form.patient_age) - parseInt(this.form.patient_age)) * 100) : ''
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
    inputAmount (index, val) {
      // 输入退费数量
      val = ~~val
      val = val < 0 ? 0 : val
      this.form.notes[index]._back_amount = val
      // 计算应退金额
      this.computedRefundPrice()
    },
    computedRefundPrice () {
      // 应退金额
      let total = 0
      this.form.notes.forEach(n => {
        if (n.checked) total += (n.total_amount >= n._back_amount ? n._back_amount : 0) * n.unit_price
      })
      this.refundPrice = total
      this.disabled = !total
    },
    selectItem (selection) {
      // 选择多选项
      this.form.notes.forEach(n => {
        n.checked = 0
      })
      selection.forEach(n => {
        this.form.notes.forEach(nn => {
          if (n.id === nn.id) nn.checked = 1
        })
      })
      // 计算应退金额
      this.computedRefundPrice()
    },
    onRefund () {
      // 确定退费
      // 退费数量效验
      if (!this.form.notes.length) {
        return this.$Message.error('无退费项目')
      }
      this.form.notes.forEach(n => {
        if (!n._disabled && n.checked) {
          if (n._back_amount <= 0 || n._back_amount > (n.total_amount - n.back_amount)) {
            return this.$Message.error('请正确填写「' + n.name + '」退费数量')
          }
        }
      })
      // 部分退费不支持原路退还方式
      if (this.payway === '0') {
        // 判断是否部分退款
        let full = true
        this.form.notes.forEach(n => {
          if (!n._disabled) {
            if (!n.checked) {
              full = false
            } else {
              if (n._back_amount !== (n.total_amount - n.back_amount)) {
                full = false
              }
            }
          }
        })
        if (!full) {
          return this.$Message.error('部分退费不支持原路退还，请选择其他退费方式！')
        }
      }
      let data = {
        order_id: this.order_id,
        payway: this.payway,
        remark: this.remark,
        notes: []
      }
      this.form.notes.forEach(n => {
        if (!n._disabled && n.checked) {
          data.notes.push({
            id: n.id,
            back_amount: n._back_amount
          })
        }
      })
      data.notes = JSON.stringify(data.notes)
      this.submit = true
      localRefund(data).then(res => {
        this.submit = false
        this.complete()
      }).catch(err => {
        this.submit = false
        this.$Message.error(err)
      })
    },
    complete () {
      // 完成退费
      this.$emit('child-change', false)
      this.$emit('on-refund-complete', {
        order_id: this.order_id,
        msg_code: 'ok'
      })
    },
    detail () {
      // 获取详情
      this.loading = true
      this.submit = false
      this.disabled = true
      this.form.notes = [] // 清空表格
      getDoctorOrderDetail({ order_id: this.order_id }).then(res => {
        this.loading = false
        // 订单状态判断
        if (res.status !== 1 && res.status !== 2) {
          return this.complete()
        }
        this.form = Object.assign({}, res)
        this.form.notes.forEach(n => {
          // 初始化选择状态
          n.checked = this.form.discount > 0 ? 1 : 0
          // 初始化退费数量
          n._back_amount = n.total_amount > n.back_amount ? n.total_amount - n.back_amount : 0
          // 是否禁用 Table 多选
          if (n.total_amount <= n.back_amount) n._disabled = true
          // 退费数量输入框是否禁用
          n._input = !n._back_amount || this.form.discount > 0
        })
        // 有优惠的订单，不支持单项退费
        if (this.form.discount > 0) {
          if (this.columns[0].type === 'selection') {
            this.columns.splice(0, 1)
          }
        } else {
          if (this.columns[0].type !== 'selection') {
            this.columns.splice(0, 0, {
              type: 'selection',
              width: 60,
              align: 'center'
            })
          }
        }
        // 计算应退金额
        this.computedRefundPrice()
      }).catch(err => {
        this.loading = false
        this.$Message.error(err)
      })
      // 获取支付方式
      if (!this.paywayList.length) {
        this.$store.dispatch('getLocalPayWay').then(res => {
          this.paywayList = res
        }).catch(err => {
          this.$Message.error(err)
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
