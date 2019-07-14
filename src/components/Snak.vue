<template>
  <snak-value :snak="snak" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Snak as SnakData } from '@/api/types'
import SnakValue from '@/components/SnakValue.vue'

@Component({
  components: {
    'snak-value': SnakValue,
  }})
export default class Snak extends Vue {
  @Prop() private snak!: SnakData
}
</script>
