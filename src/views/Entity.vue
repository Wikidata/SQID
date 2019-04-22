<template>
  <entity :entity-id="id" />
</template>

<script lang="ts">
import { NavigationGuard } from 'vue-router'
import { Component, Constructor, Prop, Vue } from 'vue-property-decorator'
import { EntityId } from '@/api/types'
import { parseEntityId } from '@/api/wikidata'
import Entity from '@/components/Entity.vue'

@Component({
  components: { Entity,
  },
})
export default class EntityView extends Vue {
  @Prop(String) protected readonly id!: EntityId

  public beforeRouteEnter: NavigationGuard<Vue> = (to, _from, next) => {
    try {
      parseEntityId(to.params.id)
    } catch (err) {
      next(err)
    }

    next()
  }
}
</script>
