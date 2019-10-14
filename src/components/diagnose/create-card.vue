<template>
  <Card shadow>
    <p slot="title">
      {{ storeInfo.name }}
    </p>
    <div style="text-align:center">
      <Button @click="voice" style="width: 150px; height: 150px;font-size: 80px" shape="circle" icon="ios-add"></Button>
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
