<template>
  <div>
  <!-- 列表 -->
  <Card shadow v-show="!addPage">
    <Row>
      <Col span="3">
        <Button @click="add" type="primary" icon="ios-add">添加</Button>
      </Col>
      <Col span="21">
        <Form inline>
          <FormItem>
            <Input style="width: 150px" v-model="search.name" :maxlength="20" type="text" placeholder="编号/名称/简码" clearable/>
          </FormItem>
          <FormItem>
            <Select style="width: 150px" v-model="search.status" placeholder="药品状态" clearable>
              <Option value="0">停用</Option>
              <Option value="1">启用</Option>
            </Select>
          </FormItem>
          <FormItem>
            <Button @click="searched" type="primary" icon="ios-search">搜索</Button>
          </FormItem>
        </Form>
      </Col>
    </Row>
    <Table :columns="columns" :data="rows" :loading="loading" border></Table>
    <div style="margin-top: 16px;overflow: hidden;">
      <div style="float: right;">
        <Page :page-size="pageSize" :current.sync="current" :total="totalCount" @on-change="changePage"/>
      </div>
    </div>
  </Card>
  <!-- 新增 -->
  <add-treatment v-model="addPage" :id="selectId" @on-complete="addComplete"></add-treatment>
  </div>
</template>

<script>
import {
  getTreatmentList
} from '@/api/server'
import AddTreatment from '_c/clinic/add_treatment'
export default {
  components: {
    AddTreatment
  },
  data () {
    return {
      loading: false,
      addPage: false,
      selectId: 0,
      totalCount: 0,
      pageSize: 5,
      current: 1,
      search: {
        name: '',
        status: ''
      },
      columns: [
        {
          title: '编号',
          key: 'ident'
        },
        {
          title: '项目名称',
          key: 'name'
        },
        {
          title: '单位',
          key: 'unit'
        },
        {
          title: '单价(元)',
          key: 'price'
        },
        {
          title: '提成',
          key: 'royalty'
        },
        {
          title: '状态',
          key: 'status',
          render: (h, params) => {
            if (params.row.status === 0) {
              return h('span', { style: { color: '#ed4014' } }, '停用')
            } else if (params.row.status === 1) {
              return h('span', { style: { color: '#19be6b' } }, '启用')
            }
          }
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
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
                  this.edit(params.index)
                }
              }
            }, '编辑')
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
      getTreatmentList(data).then(res => {
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
      this.selectId = 0
      this.addPage = true
    },
    edit (index) {
      // 编辑
      this.selectId = this.rows[index].id
      this.addPage = true
    },
    addComplete () {
      // 添加完成回调
      this.loadList()
    }
  },
  created () {
    this.loadList()
  }
}
</script>

<style scoped>

</style>
