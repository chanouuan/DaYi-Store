<template>
  <AutoComplete
          v-model="inputValue"
          :icon="_icon"
          :placeholder="_placeholder"
          :style="_style"
          transfer
          @on-search="handleSearch"
          @on-select="handleSelect"
          >
    <div v-if="rows.length" ref="optionDiv" class="auto-complete-item" :style="'min-width:'+(150*columns.length)+'px'">
      <Row class-name="col-th thead">
        <Col class-name="col-td" :span="24/columns.length" v-for="column in columns" :key="column.key">{{ column.value }}</Col>
      </Row>
      <Option v-for="(row, index) in rows" :index="index" :value="optionValue(row)" :key="row.id">
        <Row class-name="col-th">
          <Col class-name="col-td" :span="24/columns.length" v-for="column in columns" :key="row.id+'-'+column.key" :title="row[column.key]">{{ row[column.key] ? row[column.key] : '&nbsp;' }}</Col>
        </Row>
      </Option>
    </div>
  </AutoComplete>
</template>

<script>
import {
  searchPatient,
  searchDrug,
  searchDrugDict,
  searchTreatmentSheet
} from '@/api/server'
export default {
  name: 'element-auto-complete',
  model: {
    prop: 'parent_value',
    event: 'child-change'
  },
  props: {
    parent_value: String,
    _icon: String,
    _placeholder: {
      type: String,
      default: '请输入'
    },
    _style: String,
    _apiname: String,
    optionValue: {
      type: Function,
      default: (row) => {
        return row.name
      }
    }
  },
  data () {
    return {
      t: null,
      inputValue: '',
      columns: [],
      rows: []
    }
  },
  watch: {
    parent_value (val) {
      this.inputValue = val
    },
    inputValue (val) {
      if (!val) {
        this.columns = []
        this.rows = []
      }
      this.$emit('child-change', val) // 通知父组件值改变
    }
  },
  methods: {
    handleSearch (value) {
      if (!value) {
        this.columns = []
        this.rows = []
        return
      }
      clearTimeout(this.t)
      this.t = setTimeout(() => {
        this.searched(value).then(res => {
          this.columns = res.columns || []
          this.rows = res.rows || []
        }).catch(err => {
          this.$Message.error(err)
        })
      }, 300)
    },
    handleSelect (value) {
      setTimeout(() => {
        let selector = this.$refs['optionDiv'].querySelector('li.ivu-select-item-focus')
        if (selector) {
          let optionIndex = selector.getAttribute('index')
          if (this.rows[optionIndex]) {
            this.$emit('on-select', this.rows[optionIndex])
          }
        }
      })
    },
    searched (value) {
      if (this._apiname === 'searchPatient') {
        return searchPatient(value)
      }
      if (this._apiname === 'searchWestDrug') {
        return searchDrug(this.$store.state.user.clinicInfo.id, 1, value, 0)
      }
      if (this._apiname === 'searchChineseDrug') {
        return searchDrug(this.$store.state.user.clinicInfo.id, 3, value, 0)
      }
      if (this._apiname === 'searchMaterial') {
        return searchDrug(this.$store.state.user.clinicInfo.id, 4, value, 0)
      }
      if (this._apiname === 'searchDrug') {
        return searchDrug(this.$store.state.user.clinicInfo.id, 0, value, 0)
      }
      if (this._apiname === 'searchProcureDrug') {
        return searchDrug(this.$store.state.user.clinicInfo.id, 0, value, 1)
      }
      if (this._apiname === 'searchTreatmentSheet') {
        return searchTreatmentSheet(this.$store.state.user.clinicInfo.id, value)
      }
      if (this._apiname === 'searchWestDrugDict') {
        return searchDrugDict(1, value)
      }
      if (this._apiname === 'searchChineseDrugDict') {
        return searchDrugDict(3, value)
      }
      return new Promise(function (resolve, reject) {
        let columns = [
          {
            key: 'name',
            value: '姓名'
          },
          {
            key: 'age',
            value: '年龄'
          },
          {
            key: 'address',
            value: '地址'
          },
          {
            key: 'date',
            value: '时间'
          }
        ]
        let rows = []
        for (let i = 0; i < 5; i++) {
          rows.push({
            id: i,
            name: Math.random(),
            age: 18,
            address: '贵阳市',
            date: (new Date()).getTime()
          })
        }
        resolve({ columns, rows })
      })
    }
  }
}
</script>

<style scoped>
.auto-complete-item{
  box-sizing: content-box;
  overflow: hidden;
  padding: 0 4px;
  text-align: left;
  color: #515a6e;
}
.auto-complete-item li {
  margin: 0;
  padding: 0;
}
.thead{
  background-color: #f8f8f9;
  font-weight: 700;
  border-top: 1px solid #e8eaec;
}
.col-th{
  font-size: 14px;
  height: 36px;
  line-height: 36px;
  border-bottom: 1px solid #e8eaec;
  border-left: 1px solid #e8eaec;
}
.col-td{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-right: 1px solid #e8eaec;
  padding: 0 10px;
}
</style>
