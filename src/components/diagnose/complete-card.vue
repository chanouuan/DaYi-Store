<template>
  <Card shadow>
    <p slot="title">
      {{ storeInfo.name }}
    </p>
    <div style="text-align:center">
      <Button @click="complete" style="width: 150px; height: 150px;font-size: 80px" type="success" shape="circle" icon="ios-add"></Button>
    </div>
  </Card>
</template>

<script>
export default {
  name: 'complete-card',
  props: {
    storeInfo: Object
  },
  data () {
    return {
      //
    }
  },
  methods: {
    complete () {
      this.$emit('on-complete')
    }
  }
}
</script>

<style scoped>

</style>
