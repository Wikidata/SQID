<template>
  <span>
    <font-awesome-icon icon="arrow-left" v-if="reverse" />
    <snak-value :snak="snak" :class="{ deprecated }" :short="short" />
    <font-awesome-icon :title="$t('entity.deprecatedStatement')" icon="ban" v-if="deprecated" />
    <font-awesome-icon :title="$t('entity.preferredStatement')" icon="star" v-if="preferred" />
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Rank, Snak as SnakData } from '@/api/types'
import SnakValue from '@/components/SnakValue.vue'

@Component({
  components: {
    'snak-value': SnakValue,
  }})
export default class Snak extends Vue {
  @Prop({ required: true }) private snak!: SnakData
  @Prop({ default: 'normal' }) private rank!: Rank
  @Prop({ default: false, type: Boolean }) private reverse!: boolean
  @Prop({ default: false, type: Boolean }) private short!: boolean

  private get deprecated() {
    return this.rank === 'deprecated'
  }

  private get preferred() {
    return this.rank === 'preferred'
  }
}
</script>

<style lang="less" scoped>
svg {
  margin-left: 1em;
  margin-right: 1em;
}
</style>
