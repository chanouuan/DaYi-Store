<template>
  <div>
  <!-- 列表 -->
  <Card shadow>
    <Row>
      <Col span="3">
        <Button @click="exportCsv" type="primary" icon="ios-download-outline">导出</Button>
      </Col>
      <Col span="21">
        <Form inline>
          <FormItem>
            <Input style="width: 150px" v-model="search.name" :maxlength="20" type="text" placeholder="名称/编码/拼音码" clearable/>
          </FormItem>
          <FormItem>
            <Select style="width: 150px" v-model="search.drug_type" placeholder="药品类型" clearable>
              <Option value="1">西药</Option>
              <Option value="2">中成药</Option>
              <Option value="3">草药</Option>
              <Option value="4">材料</Option>
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
  <!-- 进销存详情 -->
  <SaleList v-model="saleModal" :drug_id="selectId"></SaleList>
  <!-- 批次详情 -->
  <BatchList v-model="batchModal" :drug_id="selectId"></BatchList>
  </div>
</template>

<script>
import {
  getStockList
} from '@/api/server'
import SaleList from '_c/stock/sale_list'
import BatchList from '_c/stock/batch_list'
export default {
  components: {
    SaleList,
    BatchList
  },
  data () {
    return {
      loading: false,
      saleModal: false,
      batchModal: false,
      selectId: 0,
      totalCount: 0,
      pageSize: 5,
      current: 1,
      search: {
        name: '',
        drug_type: ''
      },
      columns: [
        {
          title: '名称',
          tooltip: true,
          key: 'name'
        },
        {
          title: '类型',
          key: 'type_name'
        },
        {
          title: '规格',
          key: 'package_spec'
        },
        {
          title: '厂家',
          tooltip: true,
          key: 'manufactor_name'
        },
        {
          title: '零售价',
          key: 'retail_price'
        },
        {
          title: '进货价',
          key: 'retail_price'
        },
        {
          title: '库存',
          key: 'amount',
          render: (h, params) => {
            return h('span', params.row.amount + params.row.dispense_unit)
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
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
                    this.showSale(params.index)
                  }
                }
              }, '进销存详情'),
              h('Button', {
                props: {
                  type: 'default',
                  size: 'small'
                },
                style: {
                  color: '#2d8cf0',
                  borderColor: '#2d8cf0'
                },
                on: {
                  click: () => {
                    this.showBatch(params.index)
                  }
                }
              }, '批次详情')
            ])
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
      data = Object.assign(data, this.search)
      if (!data.page) this.current = 1
      getStockList(data).then(res => {
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
    exportCsv () {
      // 导出
      this.$refs.table.exportCsv({
        filename: '库存列表',
        columns: this.columns.filter((col, index) => col.key !== 'action'),
        data: this.rows
      })
    },
    showSale (index) {
      // 进销存详情
      this.selectId = this.rows[index].id
      this.saleModal = true
    },
    showBatch (index) {
      // 批次详情
      this.selectId = this.rows[index].id
      this.batchModal = true
    }
  },
  created () {
    this.loadList()
  }
}
</script>
