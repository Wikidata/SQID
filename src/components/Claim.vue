<template>
<li>
  {{ claim }}
</li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { Claim as ClaimData } from '@/api/types'
import { EntityId } from '@/store/entity/claims/types'

@Component
export default class Claim extends Vue {
  @Prop() private entityId!: EntityId
  @Prop() private propertyId!: EntityId
  @Prop() private claim!: ClaimData
}
</script>
