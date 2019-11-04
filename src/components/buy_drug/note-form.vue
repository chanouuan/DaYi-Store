<template>
<Form :label-width="60">
  <Tabs>
    <TabPane :label="labelCategory1" icon="ios-medkit">
      <!-- 中/西药 -->
      <Row>
        <Col span="8">
          <FormItem label="药品">
            <element-auto-complete v-model="note[1].name" @on-select="selectWestBrugName" _placeholder="药品名称" _apiname="searchWestDrug"></element-auto-complete>
          </FormItem>
        </Col>
        <Col span="5">
          <FormItem label="规格">
            {{ note[1].package_spec || '-' }}
          </FormItem>
        </Col>
        <Col span="5">
          <FormItem label="单价">
            {{ note[1].relation_id ? (note[1].price + '元/' + note[1].dispense_unit) : '-' }}
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="数量">
            <Input :maxlength="5" v-model.number="note[1].total_amount" placeholder="数量"/>
          </FormItem>
        </Col>
        <Col span="2" style="text-align: right">
          <Button @click="addNote(1)" type="primary">添加</Button>
        </Col>
      </Row>
    </TabPane>
    <TabPane :label="labelCategory2" icon="ios-leaf">
      <!-- 草药 -->
      <Row>
        <Col span="8">
          <FormItem label="药品">
            <element-auto-complete v-model="note[2].name" @on-select="selectChineseBrugName" _placeholder="药品名称" _apiname="searchChineseDrug"></element-auto-complete>
          </FormItem>
        </Col>
        <Col span="5">
          <FormItem label="规格">
            {{ note[2].package_spec || '-' }}
          </FormItem>
        </Col>
        <Col span="5">
          <FormItem label="单价">
            {{ note[2].relation_id ? (note[2].price + '元/' + note[2].dispense_unit) : '-' }}
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="数量">
            <Input :maxlength="5" v-model.number="note[2].total_amount" placeholder="数量"/>
          </FormItem>
        </Col>
        <Col span="2" style="text-align: right">
          <Button @click="addNote(2)" type="primary">添加</Button>
        </Col>
      </Row>
    </TabPane>
    <TabPane :label="labelCategory3" icon="ios-cut">
      <!-- 材料 -->
      <Row>
        <Col span="8">
          <FormItem label="材料">
            <element-auto-complete v-model="note[4].name" @on-select="selectMaterial" _placeholder="材料名称" _apiname="searchMaterial"></element-auto-complete>
          </FormItem>
        </Col>
        <Col span="5">
          <FormItem label="规格">
            {{ note[4].package_spec || '-' }}
          </FormItem>
        </Col>
        <Col span="5">
          <FormItem label="单价">
            {{ note[4].relation_id ? (note[4].price + '元/' + note[4].dispense_unit) : '-' }}
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem label="数量">
            <Input :maxlength="5" v-model.number="note[4].total_amount" placeholder="数量"/>
          </FormItem>
        </Col>
        <Col span="2" style="text-align: right">
          <Button @click="addNote(4)" type="primary">添加</Button>
        </Col>
      </Row>
    </TabPane>
  </Tabs>
 </Form>
</template>

<script>
import ElementAutoComplete from '_c/diagnose/element-auto-complete'
export default {
  name: 'note-form',
  components: {
    ElementAutoComplete
  },
  props: {
    clinicInfo: Object
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
          package_spec: '',
          total_amount: '',
          dispense_unit: '',
          price: 0,
          amount: 0,
          count: 0
        },
        2: {
          name: '',
          category: 2,
          relation_id: 0,
          package_spec: '',
          total_amount: '',
          dispense_unit: '',
          price: 0,
          amount: 0,
          count: 0
        },
        4: {
          name: '',
          category: 4,
          relation_id: 0,
          package_spec: '',
          total_amount: '',
          dispense_unit: '',
          price: 0,
          amount: 0,
          count: 0
        }
      },
      labelCategory1: (h) => {
        return h('span', [
          h('span', '中/西药'),
          h('Badge', {
            props: {
              count: this.note[1].count
            }
          })
        ])
      },
      labelCategory2: (h) => {
        return h('span', [
          h('span', '草药'),
          h('Badge', {
            props: {
              count: this.note[2].count
            }
          })
        ])
      },
      labelCategory3: (h) => {
        return h('span', [
          h('span', '材料'),
          h('Badge', {
            props: {
              count: this.note[4].count
            }
          })
        ])
      }
    }
  },
  methods: {
    selectWestBrugName (row) {
      // 搜索西药
      this.note[1].name = row.name
      this.note[1].relation_id = row.id
      this.note[1].total_amount = 1
      this.note[1].package_spec = row.package_spec
      this.note[1].dispense_unit = row.dispense_unit
      this.note[1].price = row.price
      this.note[1].amount = row.amount
    },
    selectChineseBrugName (row) {
      // 搜索中药
      this.note[2].name = row.name
      this.note[2].relation_id = row.id
      this.note[2].total_amount = 1
      this.note[2].package_spec = row.package_spec
      this.note[2].dispense_unit = row.dispense_unit
      this.note[2].price = row.price
      this.note[2].amount = row.amount
    },
    selectMaterial (row) {
      // 搜索材料
      this.note[4].name = row.name
      this.note[4].relation_id = row.id
      this.note[4].total_amount = 1
      this.note[4].package_spec = row.package_spec
      this.note[4].dispense_unit = row.dispense_unit
      this.note[4].price = row.price
      this.note[4].amount = row.amount
    },
    addNote (category) {
      // 添加处方
      let note = this.note[category]
      if (!note.relation_id) {
        return this.$Message.error(category === 4 ? '请先添加材料' : '请先添加药品')
      }
      if (note.count >= 20) {
        return this.$Message.error('此分类项最多添加 20 项')
      }
      note.total_amount = ~~note.total_amount
      if (note.total_amount <= 0) {
        return this.$Message.error('请填写数量')
      }
      if (note.total_amount > note.amount) {
        return this.$Message.error('库存不足')
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
  }
}
</script>
