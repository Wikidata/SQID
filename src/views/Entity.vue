<template>
  <entity :entity-id="id" />
</template>

<script lang="ts">
import { Component, Constructor, Prop, Watch, Vue } from 'vue-property-decorator'
import { EntityId } from '@/api/types'
import Entity from '@/components/Entity.vue'

@Component({
  components: { Entity,
  },
})
export default class EntityView extends Vue {
  @Prop(String) protected readonly id!: EntityId
}
</script>
