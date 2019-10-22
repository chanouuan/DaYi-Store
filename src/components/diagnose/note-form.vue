<template>
<Form :label-width="42">
  <Tabs>
    <TabPane :label="labelCategory1" icon="ios-medkit">
      <!-- 开西药 -->
      <Row>
        <Col span="4">
          <FormItem label="药品" prop="name">
            <element-auto-complete v-model="note[1].name" @on-select="selectWestBrugName" _placeholder="药品名称" _apiname="searchWestDrug"></element-auto-complete>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="用法" prop="usages">
            <Select transfer v-model="note[1].usages" placeholder="用法">
              <Option v-for="item in usageList[1]" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="单量" prop="single_amount">
            <Input :maxlength="5" v-model.number="note[1].single_amount" placeholder="单量">
              <span slot="append">{{ note[1].dosage_unit || '-' }}</span>
            </Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="频率" prop="frequency">
            <Select @on-change="frequencyChange" transfer v-model="note[1].frequency" placeholder="频率">
              <Option v-for="item in frequencyList" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="3">
          <FormItem label="天数" prop="drug_days">
            <Input :maxlength="5" v-model.number="note[1].drug_days" placeholder="天数"/>
          </FormItem>
        </Col>
        <Col span="3">
          <FormItem label="总量" prop="total_amount">
            <Input :maxlength="5" v-model.number="note[1].total_amount" placeholder="总量">
              <span slot="append">{{ note[1].dispense_unit || '-' }}</span>
            </Input>
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
            <element-auto-complete v-model="note[2].name" @on-select="selectChineseBrugName" _placeholder="药品名称" _apiname="searchChineseDrug"></element-auto-complete>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="用量">
            <Input type="number" :maxlength="5" v-model="note[2].total_amount" placeholder="用量">
              <span slot="append">{{ note[2].dispense_unit || '-' }}</span>
            </Input>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem label="用法">
            <Select transfer v-model="note[2].usages" placeholder="用法">
              <Option v-for="item in usageList[2]" :value="item.id" :key="item.id">{{ item.name }}</Option>
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
            <element-auto-complete v-model="note[3].name" @on-select="selectTreatmentName" _placeholder="项目名称" _apiname="searchTreatmentSheet"></element-auto-complete>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="数量">
            <Input type="number" :maxlength="5" v-model="note[3].total_amount" placeholder="数量">
              <span slot="append">{{ note[3].dispense_unit || '-' }}</span>
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
import {
  getUsageEnum,
  getNoteFrequencyEnum
} from '@/api/server'
import ElementAutoComplete from '_c/diagnose/element-auto-complete'
export default {
  name: 'note-form',
  components: {
    ElementAutoComplete
  },
  props: {
    //
  },
  data () {
    return {
      submit: false,
      usageList: [],
      frequencyList: [],
      note: {
        1: {
          name: '',
          category: 1,
          relation_id: 0,
          single_amount: '',
          total_amount: '',
          usages: 0,
          frequency: 0,
          drug_days: '',
          package_spec: '',
          dispense_unit: '',
          dosage_unit: '',
          price: 0,
          amount: 0,
          count: 0
        },
        2: {
          name: '',
          category: 2,
          relation_id: 0,
          total_amount: '',
          usages: 0,
          dispense_unit: '',
          price: 0,
          amount: 0,
          count: 0
        },
        3: {
          name: '',
          category: 3,
          relation_id: 0,
          total_amount: '',
          remark: '',
          dispense_unit: '',
          price: 0,
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
      }
    }
  },
  methods: {
    frequencyChange (value) {
      // 选择频率
      let data = null
      this.frequencyList.forEach(element => {
        if (element.id === value) data = element
      })
      if (!data) return
      this.note[1].drug_days = data.daily_count
      this.note[1].total_amount = data.daily_count
    },
    selectWestBrugName (row) {
      // 搜索西药
      this.note[1].name = row.name
      this.note[1].relation_id = row.id
      this.note[1].single_amount = row.dosage_amount
      this.note[1].total_amount = 1
      this.note[1].usages = 0
      this.note[1].frequency = 0
      this.note[1].drug_days = 1
      this.note[1].package_spec = row.package_spec
      this.note[1].dispense_unit = row.dispense_unit
      this.note[1].dosage_unit = row.dosage_unit
      this.note[1].price = row.price
      this.note[1].amount = row.amount
    },
    selectChineseBrugName (row) {
      // 搜索中药
      this.note[2].name = row.name
      this.note[2].relation_id = row.id
      this.note[2].total_amount = 1
      this.note[2].usages = 0
      this.note[2].dispense_unit = row.dispense_unit
      this.note[2].price = row.price
      this.note[2].amount = row.amount
    },
    selectTreatmentName (row) {
      // 搜索项目
      this.note[3].name = row.name
      this.note[3].relation_id = row.id
      this.note[3].total_amount = 1
      this.note[3].dispense_unit = row.unit
      this.note[3].price = row.price
    },
    addNote (category) {
      // 添加处方
      let note = this.note[category]
      if (!note.relation_id) {
        return this.$Message.error(category === 3 ? '请先添加治疗项目' : '请先添加药品')
      }
      if (note.count >= 5) {
        return this.$Message.error('此药方最多添加 5 项')
      }
      if (category === 1 || category === 2) {
        if (!note.usages) {
          return this.$Message.error('请选择用法')
        }
        this.usageList[category].forEach(element => {
          if (element.id === note.usages) note['usages_name'] = element.name
        })
      }
      if (category === 1) {
        if (!note.frequency) {
          return this.$Message.error('请选择频率')
        }
        this.frequencyList.forEach(element => {
          if (element.id === note.frequency) note['frequency_name'] = element.name
        })
        note.drug_days = ~~note.drug_days
        if (note.drug_days <= 0) {
          return this.$Message.error('请填写天数')
        }
        note.single_amount = ~~note.single_amount
        if (note.single_amount <= 0) {
          return this.$Message.error('请填写单量')
        }
      }
      note.total_amount = ~~note.total_amount
      if (note.total_amount <= 0) {
        return this.$Message.error('请填写总量')
      }
      if (category !== 3) {
        if (note.total_amount > note.amount) {
          return this.$Message.error('库存不足')
        }
      }
      this.note[category].count++
      this.$emit('on-note', Object.assign({}, note))
      this.clearNote(category)
    },
    clearNote (category) {
      // 初始化值
      for (let n in this.note[category]) {
        if (n !== 'category' && n !== 'count') {
          this.note[category][n] = ''
        }
      }
    }
  },
  mounted () {
    // 加载药品使用方式
    if (!this.usageList.length) {
      getUsageEnum().then(res => {
        this.usageList = res
      }).catch(err => {
        this.$Message.error(err)
      })
    }
    // 加载药品使用频率
    if (!this.frequencyList.length) {
      getNoteFrequencyEnum().then(res => {
        this.frequencyList = res
      }).catch(err => {
        this.$Message.error(err)
      })
    }
  }
}
</script>
