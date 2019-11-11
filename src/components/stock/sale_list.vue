<template>
  <Modal footer-hide :value="model_value" :width="90" :styles="{top:'16px'}" :mask-closable="false" @on-visible-change="modalChange">
    <p slot="header">
      进销存详情
    </p>
    <div>
      <Form inline>
        <FormItem>
          <DatePicker style="width: 200px" v-model="search.date_range" type="daterange" :options="dateOption" placeholder="出入库日期"></DatePicker>
        </FormItem>
        <FormItem>
          <Select style="width: 200px" v-model="search.stock_way" placeholder="出入库方式" filterable clearable>
            <Option v-for="item in stockWay" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
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
    </div>
  </Modal>
</template>

<script>
import {
  getStockWayEnum,
  getStockSale
} from '@/api/server'
export default {
  name: 'sale-list',
  model: {
    prop: 'model_value',
    event: 'child-change'
  },
  props: {
    model_value: Boolean,
    drug_id: Number
  },
  data () {
    return {
      loading: false,
      totalCount: 0,
      pageSize: 5,
      current: 1,
      stockWay: [],
      search: {
        date_range: [],
        stock_way: ''
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
          title: '出入库方式',
          key: 'stock_way'
        },
        {
          title: '日期',
          key: 'stock_date'
        },
        {
          title: '数量',
          key: 'amount',
          render: (h, params) => {
            return h('span', params.row.amount + params.row.dispense_unit)
          }
        },
        {
          title: '零售价',
          key: 'retail_price'
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
          title: '有效期',
          key: 'valid_time'
        },
        {
          title: '供应商',
          key: 'supplier'
        }
      ],
      rows: []
    }
  },
  methods: {
    modalChange (val) {
      // 关闭
      this.$emit('child-change', val)
      if (val) {
        this.loadList()
        this.loadData()
      } else {
        this.search.date_range = []
        this.search.stock_way = ''
      }
    },
    searched () {
      // 搜索
      this.loadList()
    },
    changePage (page) {
      // 换页
      this.loadList({ page })
    },
    loadData () {
      // 加载出入库方式
      if (!this.stockWay.length) {
        getStockWayEnum().then(res => {
          for (let n in res) {
            res[n].forEach(nn => {
              this.stockWay.push(nn)
            })
          }
        }).catch(err => {
          this.$Message.error(err)
        })
      }
    },
    loadList (data) {
      // 获取进销存列表
      if (this.loading) return
      this.loading = true
      data = data || {}
      data.drug_id = this.drug_id
      data.stock_way = this.search.stock_way
      if (this.search.date_range && this.search.date_range.length && this.search.date_range[0] && this.search.date_range[1]) {
        data.start_time = this.search.date_range[0]
        data.end_time = this.search.date_range[1]
        data.start_time = data.start_time.getFullYear() + '-' + (data.start_time.getMonth() + 1) + '-' + data.start_time.getDate()
        data.end_time = data.end_time.getFullYear() + '-' + (data.end_time.getMonth() + 1) + '-' + data.end_time.getDate() + ' 23:59:59'
      }
      if (!data.page) this.current = 1
      getStockSale(data).then(res => {
        this.loading = false
        this.totalCount = res.total_count
        this.pageSize = res.page_size
        this.rows = res.list
      }).catch(err => {
        this.loading = false
        this.$Message.error(err)
      })
    }
  }
}
</script>
