<template>
  <div>
  <!-- 列表 -->
  <Card shadow v-show="!addModal">
    <Row>
      <Col span="3">
        <Button @click="add" type="primary" icon="ios-add">新增出库</Button>
      </Col>
      <Col span="21">
        <Form inline>
          <FormItem>
            <DatePicker style="width: 200px" v-model="search.date_range" type="daterange" :options="dateOption" placeholder="出库日期"></DatePicker>
          </FormItem>
          <FormItem>
            <Select style="width: 200px" v-model="search.stock_way" placeholder="出库类型" clearable>
              <Option v-for="item in stockWay" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
          <FormItem>
            <Button @click="searched" type="primary" icon="ios-search">搜索</Button>
          </FormItem>
        </Form>
      </Col>
    </Row>
    <Table ref="table" :columns="columns" :data="rows" :loading="loading" border></Table>
    <div style="margin-top: 16px;overflow: hidden;">
      <div style="float: right;">
        <Page :page-size="pageSize" :current.sync="current" :total="totalCount" @on-change="changePage"/>
      </div>
    </div>
  </Card>
  <!-- 新增出库 -->
  <add-push v-model="addModal" @on-complete="addComplete"></add-push>
  <!-- 出入库详情 -->
  <stock-detail v-model="viewModal" :stock_id="selectId" @on-complete="confirmComplete"></stock-detail>
  </div>
</template>

<script>
import {
  getStockWayEnum,
  getStockPullOrPush,
  delStock
} from '@/api/server'
import AddPush from '_c/stock/add_push'
import StockDetail from '_c/stock/stock_detail'
export default {
  components: {
    AddPush,
    StockDetail
  },
  data () {
    return {
      loading: false,
      addModal: false,
      viewModal: false,
      selectId: 0,
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
          title: '出库日期',
          key: 'stock_date'
        },
        {
          title: '出库方式',
          key: 'stock_way'
        },
        {
          title: '领用人员',
          key: 'employee_name'
        },
        {
          title: '制单人',
          key: 'create_admin_name'
        },
        {
          title: '确认人',
          key: 'confirm_admin_name'
        },
        {
          title: '状态',
          key: 'status',
          render: (h, params) => {
            if (params.row.status === 0) {
              return h('span', { style: { color: '#ed4014' } }, '未确认')
            } else if (params.row.status === 1) {
              return h('span', { style: { color: '#19be6b' } }, '已确认')
            }
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 150,
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
                color: '#2d8cf0',
                borderColor: '#2d8cf0'
              },
              on: {
                click: () => {
                  this.detail(params.index)
                }
              }
            }, params.row.status === 0 ? '确认' : '详情'))
            if (params.row.status === 0) {
              action.push(h('Poptip', {
                props: {
                  transfer: true,
                  confirm: true,
                  title: '你确定要删除吗?'
                },
                on: {
                  'on-ok': () => {
                    this.del(params.index)
                  }
                }
              }, [
                h('Button', {
                  props: {
                    type: 'default',
                    size: 'small'
                  },
                  style: {
                    color: '#ed4014',
                    borderColor: '#ed4014'
                  }
                }, '删除')
              ]))
            }
            return h('div', action)
          }
        }
      ],
      rows: []
    }
  },
  methods: {
    loadList (data) {
      // 获取列表
      if (this.loading) return
      this.loading = true
      data = data || {}
      data.stock_type = 2
      data.stock_way = this.search.stock_way
      if (this.search.date_range && this.search.date_range.length && this.search.date_range[0] && this.search.date_range[1]) {
        data.start_time = this.search.date_range[0]
        data.end_time = this.search.date_range[1]
        data.start_time = data.start_time.getFullYear() + '-' + (data.start_time.getMonth() + 1) + '-' + data.start_time.getDate()
        data.end_time = data.end_time.getFullYear() + '-' + (data.end_time.getMonth() + 1) + '-' + data.end_time.getDate() + ' 23:59:59'
      }
      if (!data.page) this.current = 1
      getStockPullOrPush(data).then(res => {
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
      this.loadList()
    },
    changePage (page) {
      // 换页
      this.loadList({ page })
    },
    add () {
      // 新增
      this.addModal = true
    },
    detail (index) {
      // 查看详情
      this.selectId = this.rows[index].id
      this.viewModal = true
    },
    del (index) {
      // 删除
      if (this.rows[index].status === 0) {
        delStock(this.rows[index].id).then(res => {
          // 移除
          this.rows.splice(index, 1)
        }).catch(err => {
          this.$Message.error(err)
        })
      }
    },
    addComplete (res) {
      // 添加完成回调
      if (res.msg_code === 'ok') this.loadList()
    },
    confirmComplete (res) {
      // 确认完成回调
      if (res.msg_code === 'ok') this.loadList()
    }
  },
  created () {
    this.loadList()
    // 加载出库方式
    if (!this.stockWay.length) {
      getStockWayEnum(true).then(res => {
        this.stockWay = res[2] || []
      }).catch(err => {
        this.$Message.error(err)
      })
    }
  }
}
</script>
