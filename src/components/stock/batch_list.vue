<template>
  <Modal footer-hide :value="model_value" :width="90" :styles="{top:'16px'}" :mask-closable="false" @on-visible-change="modalChange">
    <p slot="header">
      批次详情
    </p>
    <div>
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
  batchDetail
} from '@/api/server'
export default {
  name: 'batch-list',
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
      columns: [
        {
          title: '药品名称',
          key: 'name'
        },
        {
          title: '药品规格',
          key: 'package_spec'
        },
        {
          title: '数量',
          key: 'amount',
          render: (h, params) => {
            return h('span', params.row.amount + params.row.dispense_unit)
          }
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
          title: '生产商',
          tooltip: true,
          key: 'manufactor_name'
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
      }
    },
    changePage (page) {
      // 换页
      this.loadList({ page })
    },
    loadList (data) {
      // 获取批次列表
      if (this.loading) return
      this.loading = true
      data = data || {}
      data.drug_id = this.drug_id
      if (!data.page) this.current = 1
      batchDetail(data).then(res => {
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
