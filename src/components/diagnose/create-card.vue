<template>
  <Card shadow>
    <p slot="title">
      {{ storeInfo.name }}
    </p>
    <div style="text-align:center">
      <i-circle
        :size="150"
        :percent="33"
        stroke-linecap="square"
        stroke-color="#43a3fb"
        style="cursor:pointer;"
        @click.native="voice">
        <div style="font-size:16px;">
          开始会诊
        </div>
      </i-circle>
    </div>
  </Card>
</template>

<script>
export default {
  name: 'create-card',
  props: {
    storeInfo: Object
  },
  data () {
    return {
      //
    }
  },
  methods: {
    voice () {
      this.$emit('on-voice')
    }
  }
}
</script>

<style scoped>

</style>
