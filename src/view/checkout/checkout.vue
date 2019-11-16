<template>
  <Card shadow>
    <Form inline>
      <FormItem>
        <Input style="width: 150px" v-model="search.print_code" :maxlength="4" type="text" placeholder="会诊号" clearable/>
      </FormItem>
      <FormItem>
        <Input style="width: 150px" v-model="search.patient_name" :maxlength="5" type="text" placeholder="患者姓名" clearable/>
      </FormItem>
      <FormItem>
        <Select style="width: 150px" v-model="search.doctor_id" placeholder="会诊医师" filterable clearable>
          <Option v-for="item in doctors" :value="item.id" :key="item.id">{{ item.nickname }}</Option>
        </Select>
      </FormItem>
      <FormItem>
        <Select style="width: 150px" v-model="search.status" placeholder="状态" clearable>
          <Option value="0">未收费</Option>
          <Option value="1">已收费</Option>
          <Option value="2">部分退费</Option>
          <Option value="3">全退费</Option>
        </Select>
      </FormItem>
      <FormItem>
        <DatePicker style="width: 200px" v-model="search.date_range" type="daterange" :options="dateOption" placeholder="创建时间"></DatePicker>
      </FormItem>
      <FormItem>
        <Button @click="searched" type="primary" icon="ios-search">搜索</Button>
      </FormItem>
    </Form>
    <Table :columns="columns" :data="rows" :loading="loading" border></Table>
    <div style="margin-top: 16px;overflow: hidden;">
      <div style="float: right;">
        <Page :page-size="pageSize" :current.sync="current" :total="totalCount" @on-change="changePage"/>
      </div>
    </div>
    <!-- 编辑 -->
    <CardForm v-model="cardModal" @on-success="cardSaveSuccess" :order_id="selectOrderId"></CardForm>
    <!-- 详情 -->
    <CardDetail v-model="detailModal" :order_id="selectOrderId"></CardDetail>
    <!-- 收费 -->
    <Charge @on-charge-complete="chargeComplete" v-model="chargeModal" :money="chargeParam.money" :order_id="chargeParam.order_id"></Charge>
    <!-- 退费 -->
    <Refund @on-refund-complete="refundComplete" v-model="refundModal" :order_id="chargeParam.order_id"></Refund>
  </Card>
</template>

<script>
import {
  getDoctorList,
  getDoctorOrderList,
  printTemplete
} from '@/api/server'
import CardForm from '_c/checkout/card-form'
import CardDetail from '_c/checkout/card-detail'
import Charge from '_c/charge/charge'
import Refund from '_c/charge/refund'
export default {
  components: {
    CardForm,
    CardDetail,
    Charge,
    Refund
  },
  data () {
    return {
      loading: false,
      cardModal: false,
      chargeModal: false,
      refundModal: false,
      detailModal: false,
      printState: false,
      chargeParam: {
        money: 0,
        order_id: 0
      },
      selectOrderId: 0,
      totalCount: 0,
      pageSize: 5,
      current: 1,
      doctors: [],
      search: {
        print_code: '',
        patient_name: '',
        doctor_id: 0,
        status: '',
        date_range: []
      },
      dateOption: {
        shortcuts: [
          {
            text: '今日',
            value () {
              return [new Date(), new Date()]
            }
          },
          {
            text: '本周',
            value () {
              const now = new Date()
              return [new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1), now]
            }
          },
          {
            text: '本月',
            value () {
              const now = new Date()
              return [new Date(now.getFullYear(), now.getMonth(), 1), now]
            }
          },
          {
            text: '上月',
            value () {
              const now = new Date()
              return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 1)]
            }
          }
        ]
      },
      columns: [
        {
          title: '来源',
          key: 'source'
        },
        {
          title: '患者姓名',
          key: 'patient_name',
          render: (h, params) => {
            if (!params.row.patient_name) {
              return h('span', params.row.enum_source === 1 ? '待录入' : '无')
            }
            return h('div', [
              h('Icon', {
                props: {
                  type: 'md-female',
                  color: params.row.patient_gender === 1 ? 'blue' : 'pink'
                }
              }),
              h('span', params.row.patient_name)
            ])
          }
        },
        {
          title: '年龄',
          key: 'patient_age'
        },
        {
          title: '会诊医师',
          key: 'doctor_name'
        },
        {
          title: '总费用',
          key: 'pay',
          render: (h, params) => {
            return h('span', params.row.pay ? ((params.row.pay + params.row.discount) / 100) : '')
          }
        },
        {
          title: '付款方式',
          key: 'payway'
        },
        {
          title: '状态',
          key: 'status',
          render: (h, params) => {
            if (params.row.status === 0) {
              return h('span', { style: { color: '#ed4014' } }, '未收费')
            } else if (params.row.status === 1) {
              return h('span', { style: { color: '#19be6b' } }, '已收费')
            } else if (params.row.status === 2) {
              return h('span', { style: { color: '#c5c8ce' } }, '部分退费')
            } else if (params.row.status === 3) {
              return h('span', { style: { color: '#c5c8ce' } }, '全退费')
            }
          }
        },
        {
          title: '时间',
          tooltip: true,
          key: 'create_time'
        },
        {
          title: '操作',
          key: 'action',
          width: 130,
          align: 'center',
          render: (h, params) => {
            let action = []
            action.push(h('Button', {
              props: {
                type: 'default',
                size: 'small'
              },
              style: {
                marginRight: '5px',
                color: params.row.status === 0 ? '#2d8cf0' : '',
                borderColor: params.row.status === 0 ? '#2d8cf0' : ''
              },
              on: {
                click: () => {
                  this.detail(params.index)
                }
              }
            }, (params.row.status === 0 && params.row.enum_source === 1) ? '编辑' : '查看'))
            if (params.row.status === 0 && params.row.pay) {
              action.push(h('Button', {
                props: {
                  type: 'default',
                  size: 'small'
                },
                style: {
                  color: '#ed4014',
                  borderColor: '#ed4014'
                },
                on: {
                  click: () => {
                    this.charge(params.index)
                  }
                }
              }, '收费'))
            }
            if (params.row.status === 1 || params.row.status === 2) {
              action.push(h('Button', {
                props: {
                  type: 'default',
                  size: 'small'
                },
                style: {
                  color: '#ff9900',
                  borderColor: '#ff9900'
                },
                on: {
                  click: () => {
                    this.refund(params.index)
                  }
                }
              }, '退费'))
            }
            return h('div', action)
          }
        }
      ],
      rows: []
    }
  },
  methods: {
    loadDoctorOrderList (data) {
      // 获取列表
      if (this.loading) return
      this.loading = true
      data = data || {}
      data.print_code = this.search.print_code
      data.patient_name = this.search.patient_name
      data.doctor_id = this.search.doctor_id
      data.status = this.search.status
      if (this.search.date_range && this.search.date_range.length && this.search.date_range[0] && this.search.date_range[1]) {
        data.start_time = this.search.date_range[0]
        data.end_time = this.search.date_range[1]
        data.start_time = data.start_time.getFullYear() + '-' + (data.start_time.getMonth() + 1) + '-' + data.start_time.getDate()
        data.end_time = data.end_time.getFullYear() + '-' + (data.end_time.getMonth() + 1) + '-' + data.end_time.getDate() + ' 23:59:59'
      }
      if (!data.page) this.current = 1
      getDoctorOrderList(data).then(res => {
        this.loading = false
        this.totalCount = res.total_count
        this.pageSize = res.page_size
        this.rows = res.list
      }).catch(err => {
        this.loading = false
        this.$Message.error(err)
      })
    },
    searched () {
      // 搜索
      this.loadDoctorOrderList()
    },
    changePage (page) {
      // 换页
      this.loadDoctorOrderList({ page })
    },
    detail (index) {
      // 详情
      this.selectOrderId = this.rows[index].id
      if (this.rows[index].status === 0) {
        this.cardModal = true
      } else {
        this.detailModal = true
      }
    },
    charge (index) {
      // 收费
      if (this.rows[index].status === 0) {
        this.chargeParam.money = this.rows[index].pay / 100
        this.chargeParam.order_id = this.rows[index].id
        this.chargeModal = true
      }
    },
    refund (index) {
      // 退费
      if (this.rows[index].status === 1 || this.rows[index].status === 2) {
        this.chargeParam.money = this.rows[index].pay / 100
        this.chargeParam.order_id = this.rows[index].id
        this.refundModal = true
      }
    },
    print () {
      // 打印收费单
      if (!this.printState || !this.chargeParam.order_id) return
      let text = {
        type: 1, // 1直接打印 2预览打印
        print_size: 'D57', // A4 B5 D57
        content: ''
      }
      printTemplete({ order_id: this.chargeParam.order_id, type: 3 }).then(res => {
        text.content = res.content
        this.$store.dispatch('sendPrintCmd', text)
      }).catch(err => {
        this.$Message.error(err)
      })
    },
    cardSaveSuccess (res) {
      // 编辑成功
      if (res.type === 2) {
        // 收费
        this.chargeParam.money = res.money
        this.chargeParam.order_id = res.order_id
        this.printState = res.printState
        this.chargeModal = true
      }
      this.loadDoctorOrderList({ page: this.current })
    },
    chargeComplete (res) {
      // 收费完成
      if (res.msg_code === 'ok') {
        this.loadDoctorOrderList({ page: this.current })
        // 打印收费单
        this.print()
      }
    },
    refundComplete (res) {
      // 退费完成
      if (res.msg_code === 'ok') {
        this.loadDoctorOrderList({ page: this.current })
      }
    }
  },
  created () {
    // 获取医生
    if (!this.doctors.length) {
      getDoctorList(true).then(res => {
        this.doctors = res
      }).catch(err => {
        this.$Message.error(err)
      })
    }
    this.loadDoctorOrderList()
  }
}
</script>

<style scoped>

</style>
