<template>
  <Modal :value="model_value" :width="width" :mask-closable="false" @on-cancel="modalChange">
    <p slot="header">
      付款
    </p>
    <Card v-if="step===1" shadow>
      <p slot="title">应收金额：<span class="real">￥{{ money }}</span></p>
      <Row style="height:36px;line-height:36px;">
        <Col span="9">
          <RadioGroup v-model="discountType" @on-change="changeDiscountType">
            <Radio label="0">无优惠</Radio>
            <Radio label="1">折扣比例</Radio>
            <Radio label="2">优惠金额</Radio>
          </RadioGroup>
        </Col>
        <Col span="8" style="text-align:left">
          <Input v-if="discountUnit" v-model.number="discountVal" :maxlength="5" style="width:100px">
            <span slot="append">{{ discountUnit }}</span>
          </Input>
        </Col>
      </Row>
    </Card>
    <Row v-else-if="step===2" class="bodyer" :gutter="16">
      <Col span="6">
        <Row>
          <Col span="12">应收：</Col>
          <Col span="12" class="real">￥{{ actualAmount }}</Col>
        </Row>
        <Divider orientation="center" class="dashed">收费详情</Divider>
        <Row style="margin-bottom:10px">
          <Col span="12">本次费用：</Col>
          <Col span="12" class="center-text">￥{{ money }}</Col>
        </Row>
        <Row>
          <Col span="12">优惠：</Col>
          <Col span="12" class="center-text">￥{{ discountAmount }}</Col>
        </Row>
      </Col>
      <Col span="18" class="payway">
        <Tabs v-model="paywayModel">
          <TabPane label="单种支付" name="single">
            <RadioGroup style="margin:10px 0 0 10px" v-model="singlePayway" @on-change="changeSinglePayway">
              <Radio style="margin:0 90px 16px 0" v-for="item in paywayList" :key="item.id" :label="item.id">
                <img class="img" :src="paywayImg(item.id)"></img>
                <span>{{ item.name }}</span>
              </Radio>
            </RadioGroup>
            <Divider/>
            <Row v-show="showSingleAmount" style="height:40px;line-height:40px;margin:20px 0 0 16px">
              <Col span="12">
                预收：<Input v-model.number="preSingleAmount" :maxlength="5" placeholder="请输入金额" style="width:100px"/>
              </Col>
              <Col span="12">
                找零：<span class="real">￥{{ _preSingleAmount }}</span>
              </Col>
            </Row>
          </TabPane>
          <TabPane label="多种支付" name="multi">
            <CheckboxGroup style="margin:10px 0 0 10px" v-model="multiPayway" @on-change="changeMultiPayway">
              <Checkbox style="margin:0 90px 16px 0" v-for="item in paywayList" :disabled="item.disabled" :key="item.id" :label="item.id">
                <img class="img" :src="paywayImg(item.id)"></img>
                <span>{{ item.name }}</span>
              </Checkbox>
            </CheckboxGroup>
            <Divider/>
            <Row v-show="showMultiAmount" style="height:40px;line-height:40px;margin:20px 0 0 16px">
              <Col span="12">
                {{ preMultiText }}：<Input v-model.number="preMultiAmount" :maxlength="5" placeholder="请输入金额" style="width:100px"/>
              </Col>
              <Col span="12">
                {{ preMultiNextText }}：<span class="real">￥{{ _preMultiAmount }}</span>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        <Divider/>
        <Row style="height:40px;line-height:40px;margin:0 0 0 16px">
          <Col span="2">
            备注：
          </Col>
          <Col span="8">
            <Input v-model.trim="remark" :maxlength="200"></Input>
          </Col>
        </Row>
      </Col>
    </Row>
    <div slot="footer">
      <template v-if="step===1">
        <Button type="primary" @click="nextStep">下一步</Button>
      </template>
      <template v-else-if="step===2">
        <Button type="primary" @click="step=1">上一步</Button>
        <Button type="error" :loading="loading" @click="onCharge">确定付款</Button>
       </template>
    </div>
  </Modal>
</template>

<script>
import {
  localCharge
} from '@/api/server'
export default {
  name: 'charge',
  model: {
    prop: 'model_value',
    event: 'child-change'
  },
  props: {
    model_value: Boolean,
    money: Number,
    order_id: Number,
    width: {
      type: String,
      default: '60'
    }
  },
  data () {
    return {
      step: 1,
      discountType: '0',
      discountVal: '',
      discountUnit: '',
      discountAmount: 0,
      actualAmount: 0,
      loading: false,
      paywayModel: 'single',
      paywayList: [],
      showSingleAmount: true,
      showMultiAmount: false,
      singlePayway: 'cash',
      multiPayway: [],
      preSingleAmount: 0,
      preMultiAmount: '',
      preMultiText: '',
      preMultiNextText: '',
      remark: ''
    }
  },
  computed: {
    _preSingleAmount () {
      let amount = parseFloat(this.preSingleAmount)
      amount = (isNaN(amount) || amount < 0) ? 0 : amount
      return parseFloat(amount - this.actualAmount).toFixed(2)
    },
    _preMultiAmount () {
      let amount = parseFloat(this.preMultiAmount)
      amount = (isNaN(amount) || amount < 0) ? 0 : amount
      return amount ? parseFloat(this.actualAmount - amount).toFixed(2) : '0.00'
    }
  },
  methods: {
    nextStep () {
      // 下一步
      if (this.discountType === '1') {
        this.discountVal = ~~this.discountVal
        if (this.discountVal <= 0 || this.discountVal > 100) {
          return this.$Message.error('请填写正确的折扣比例')
        }
        this.discountAmount = parseFloat(this.money * (1 - this.discountVal / 100)).toFixed(2)
      } else if (this.discountType === '2') {
        this.discountVal = parseFloat(this.discountVal)
        this.discountVal = isNaN(this.discountVal) ? 0 : this.discountVal
        if (this.discountVal <= 0 || this.discountVal > this.money) {
          return this.$Message.error('优惠金额不能大于应收金额')
        }
        this.discountAmount = parseFloat(this.discountVal).toFixed(2)
      } else {
        this.discountAmount = 0
      }
      this.actualAmount = parseFloat(this.money - this.discountAmount).toFixed(2)
      this.preSingleAmount = this.actualAmount
      this.step = 2
    },
    changeDiscountType (val) {
      // 选择优惠
      if (this.discountType === '1') this.discountUnit = '%'
      else if (this.discountType === '2') this.discountUnit = '元'
      else this.discountUnit = ''
      this.discountVal = ''
    },
    changeSinglePayway (val) {
      // 单种支付
      this.showSingleAmount = val === 'cash'
    },
    changeMultiPayway (val) {
      // 多种支付
      if (val.length >= 2) {
        this.showMultiAmount = true
        for (let i = 0; i < this.paywayList.length; i++) {
          this.paywayList[i].disabled = true
        }
        for (let i = 0; i < this.paywayList.length; i++) {
          for (let j = 0; j < val.length; j++) {
            if (this.paywayList[i].id === val[j]) {
              if (j === 0) this.preMultiText = this.paywayList[i].name
              if (j === 1) this.preMultiNextText = this.paywayList[i].name
              this.paywayList[i].disabled = false
            }
          }
        }
      } else {
        this.showMultiAmount = false
        for (let i = 0; i < this.paywayList.length; i++) {
          this.paywayList[i].disabled = false
        }
      }
    },
    paywayImg (id) {
      // 支付方式图标地址
      return require('../../assets/images/charge_' + id + '.png')
    },
    modalChange () {
      // 关闭
      this.step = 1
      this.$emit('child-change', false)
      // 取消收费
      this.$emit('on-charge-complete', {
        order_id: this.order_id,
        msg_code: 'cancel'
      })
    },
    onCharge () {
      // 确定收费
      let data = {
        order_id: this.order_id,
        discount_type: this.discountType,
        discount_val: this.discountVal,
        remark: this.remark
      }
      if (this.paywayModel === 'single') {
        // 单种支付
        if (!this.singlePayway) {
          return this.$Message.error('请选择支付方式')
        }
        if (this.preSingleAmount < this.actualAmount) {
          return this.$Message.error('预付金额不能小于应付金额')
        }
        data.payway = this.singlePayway
        data.money = this.actualAmount
      } else {
        // 多种支付
        if (this.multiPayway.length !== 2) {
          return this.$Message.error('请选择支付方式')
        }
        if (this.preMultiAmount <= 0 || this.preMultiAmount > this.actualAmount) {
          return this.$Message.error('请输入付款金额')
        }
        data.payway = this.multiPayway[0]
        data.money = this.preMultiAmount
        data.second_payway = this.multiPayway[1]
        data.second_money = this.actualAmount - this.preMultiAmount
      }
      this.loading = true
      localCharge(data).then(res => {
        this.step = 1
        this.loading = false
        this.$emit('child-change', false)
        this.$emit('on-charge-complete', {
          order_id: this.order_id,
          msg_code: 'ok'
        })
      }).catch(err => {
        this.loading = false
        this.$Message.error(err)
      })
    }
  },
  mounted () {
    // 获取支付方式
    this.$store.dispatch('getLocalPayWay').then(res => {
      this.paywayList = res
    }).catch(err => {
      this.$Message.error(err)
    })
  }
}
</script>

<style scoped>
.bodyer {
    font-size: 14px;
    min-height: 300px;
}
.center-text {
    text-align: right;
}
.real {
    color:#ed4014;
    font-size: 18px;
    text-align: right;
}
.dashed {
    font-size: 14px;
    color: #999;
}
.payway {
    border:1px solid #ddd;
    padding: 18px 0;
}
.img {
    vertical-align: middle;
    margin: 0 5px;
}
</style>
