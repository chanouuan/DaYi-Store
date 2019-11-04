<template>
  <Card shadow>
    <p slot="title">
      {{ clinicInfo.name }}
    </p>
    <div style="text-align:center">
      <Alert type="success" show-icon>
        已完成
        <span slot="desc" style="font-size:14px;">本次会诊已结束，<span style="color:#ed4014">{{ countdown }}</span> 秒后自动跳转到<span @click="complete" style="color:#2d8cf0;cursor:pointer;">待就诊</span>。</span>
      </Alert>
    </div>
  </Card>
</template>

<script>
export default {
  name: 'complete-card',
  props: {
    clinicInfo: Object
  },
  data () {
    return {
      countdown: 3,
      t: null
    }
  },
  methods: {
    complete () {
      clearTimeout(this.t)
      this.countdown = 3
      this.$emit('on-complete')
    },
    timeCount () {
      // 倒计时
      this.t = setTimeout(() => {
        if (this.countdown <= 0) {
          this.complete()
        } else {
          this.countdown--
          this.timeCount()
        }
      }, 1000)
    }
  },
  mounted () {
    this.timeCount()
  }
}
</script>

<style scoped>

</style>
