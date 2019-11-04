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
            <Select style="width: 150px" v-model="search.title" placeholder="职位" clearable>
              <Option v-for="(item, index) in titleList" :value="item" :key="index">{{ item }}</Option>
            </Select>
          </FormItem>
          <FormItem>
            <Input style="width: 150px" v-model="search.name" :maxlength="20" type="text" placeholder="账号/手机" clearable/>
          </FormItem>
          <FormItem>
            <Select style="width: 150px" v-model="search.status" placeholder="用户状态" clearable>
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
  <add-employee v-model="addPage" :id="selectId" @on-complete="addComplete"></add-employee>
  </div>
</template>

<script>
import {
  getEmployeeList,
  getEmployeeTitle
} from '@/api/server'
import AddEmployee from '_c/clinic/add_employee'
export default {
  components: {
    AddEmployee
  },
  data () {
    return {
      loading: false,
      addPage: false,
      selectId: 0,
      totalCount: 0,
      pageSize: 5,
      current: 1,
      titleList: [],
      search: {
        title: '',
        name: '',
        status: ''
      },
      columns: [
        {
          title: '账号',
          key: 'user_name'
        },
        {
          title: '手机号',
          key: 'telephone'
        },
        {
          title: '姓名',
          key: 'full_name',
          render: (h, params) => {
            if (!params.row.full_name) {
              return h('span', '')
            }
            if (!params.row.gender) {
              return h('span', params.row.full_name)
            }
            return h('div', [
              h('Icon', {
                props: {
                  type: 'md-female',
                  color: params.row.gender === 1 ? 'blue' : 'pink'
                }
              }),
              h('span', params.row.full_name)
            ])
          }
        },
        {
          title: '职位',
          key: 'title'
        },
        {
          title: '角色',
          key: 'roles'
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
      getEmployeeList(data).then(res => {
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
    // 加载职位
    if (!this.titleList.length) {
      getEmployeeTitle().then(res => {
        this.titleList = res
      }).catch(err => {
        this.$Message.error(err)
      })
    }
  }
}
</script>
