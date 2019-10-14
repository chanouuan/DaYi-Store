<template>
<Form :label-width="42">
  <Tabs>
    <TabPane :label="labelCategory1" icon="ios-medkit">
      <!-- 开西药 -->
      <Row>
        <Col span="4">
          <FormItem label="药品" prop="name">
            <Input :maxlength="20" v-model="note[1].name" placeholder="药品名称"/>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="用法" prop="usage">
            <Select transfer v-model="note[1].usage" placeholder="用法">
              <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="单量" prop="single_amount">
            <Input type="number" :maxlength="5" v-model="note[1].single_amount" placeholder="单量">
              <span slot="append"></span>
            </Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="频率" prop="frequency">
            <Select transfer v-model="note[1].frequency" placeholder="频率">
              <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="3">
          <FormItem label="天数" prop="drug_days">
            <Input type="number" :maxlength="5" v-model="note[1].drug_days" placeholder="天数"/>
          </FormItem>
        </Col>
        <Col span="3">
          <FormItem label="总量" prop="total_amount">
            <Input type="number" :maxlength="5" v-model="note[1].total_amount" placeholder="总量"/>
          </FormItem>
        </Col>
        <Col span="2" style="text-align: right">
          <Button @click="addNote(1)" type="primary">添加</Button>
        </Col>
      </Row>
    </TabPane>
    <TabPane :label="labelCategory2" icon="ios-leaf">
      <!-- 开草药 -->
      <Row>
        <Col span="12">
          <FormItem label="药品">
            <Input :maxlength="20" v-model="note[2].name" placeholder="药品名称"/>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="用量">
            <Input type="number" :maxlength="5" v-model="note[2].total_amount" placeholder="用量">
              <span slot="append">g</span>
            </Input>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="用法">
            <Select transfer v-model="note[2].usage" placeholder="用法">
              <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="2" style="text-align: right">
          <Button @click="addNote(2)" type="primary">添加</Button>
        </Col>
      </Row>
    </TabPane>
    <TabPane :label="labelCategory3" icon="ios-list-box">
      <!-- 开治疗单 -->
      <Row>
        <Col span="6">
          <FormItem label="项目">
            <Input :maxlength="20" v-model="note[3].name" placeholder="项目名称"/>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="数量">
            <Input type="number" :maxlength="5" v-model="note[3].total_amount" placeholder="数量">
              <span slot="append">次</span>
            </Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="备注">
            <Input :maxlength="200" v-model="note[3].remark" placeholder="备注"/>
          </FormItem>
        </Col>
        <Col span="2" style="text-align: right">
          <Button @click="addNote(3)" type="primary">添加</Button>
        </Col>
      </Row>
    </TabPane>
  </Tabs>
 </Form>
</template>

<script>
export default {
  name: 'note-form',
  props: {
    //
  },
  data () {
    return {
      submit: false,
      note: {
        1: {
          name: '',
          category: 1,
          relation_id: 0,
          single_amount: '',
          total_amount: '',
          usage: 0,
          frequency: 0,
          drug_days: '',
          count: 0
        },
        2: {
          name: '',
          category: 2,
          relation_id: 0,
          total_amount: '',
          usage: 0,
          count: 0
        },
        3: {
          name: '',
          category: 3,
          relation_id: 0,
          total_amount: '',
          remark: '',
          count: 0
        }
      },
      labelCategory1: (h) => {
        return h('span', [
          h('span', '开西药'),
          h('Badge', {
            props: {
              count: this.note[1].count
            }
          })
        ])
      },
      labelCategory2: (h) => {
        return h('span', [
          h('span', '开草药'),
          h('Badge', {
            props: {
              count: this.note[2].count
            }
          })
        ])
      },
      labelCategory3: (h) => {
        return h('span', [
          h('span', '开治疗单'),
          h('Badge', {
            props: {
              count: this.note[3].count
            }
          })
        ])
      },
      cityList: [
        {
          value: 'New York',
          label: 'New York'
        },
        {
          value: 'London',
          label: 'London'
        },
        {
          value: 'Sydney',
          label: 'Sydney'
        },
        {
          value: 'Ottawa',
          label: 'Ottawa'
        },
        {
          value: 'Paris',
          label: 'Paris'
        },
        {
          value: 'Canberra',
          label: 'Canberra'
        }
      ]
    }
  },
  computed: {
    //
  },
  methods: {
    addNote (category) {
      // 添加处方
      this.note[category].relation_id = Math.random(1, 10000)
      if (!this.note[category].relation_id) {
        return this.$Message.error(category === 3 ? '请先添加治疗项目' : '请先添加药品')
      }
      if (this.note[category].count >= 5) {
        return this.$Message.error('此药方最多添加 5 项')
      }
      this.note[category].count++
      const note = JSON.parse(JSON.stringify(this.note[category])) // 解除双向绑定
      this.clearNote(category)
      this.$emit('on-note', note)
    },
    clearNote (category) {
      // 初始化值
      const init = {
        1: {
          name: '',
          category: 1,
          relation_id: 0,
          single_amount: '',
          total_amount: '',
          usage: 0,
          frequency: 0,
          drug_days: ''
        },
        2: {
          name: '',
          category: 2,
          relation_id: 0,
          total_amount: '',
          usage: 0
        },
        3: {
          name: '',
          category: 3,
          relation_id: 0,
          total_amount: '',
          remark: ''
        }
      }
      this.note[category] = init[category]
    }
  }
}
</script>
