<template>
  <div :id="claimId">
    <template v-if="isReverseClaim">
      <sqid-snak :snak="mainsnak" :rank :use-short-value is-reverse-claim />
    </template>
    <template v-else>
      <sqid-collapse-button :id="claimId">
        <sqid-snak :snak="mainsnak" :rank :use-short-value />
      </sqid-collapse-button>
      <div v-for="(property, pid) in qualifierOrder" :key="pid" class="qualifiers">
        <div v-for="(qualifier, pqid) in qualifiers(property)" :key="pqid">
          <i18n-t keypath="entity.qualifierValue">
            <template #qualifier> <entity-link :entity-id="property" /></template>
            <template #value>
              <sqid-snak-value :snak="qualifier" />
            </template>
          </i18n-t>
        </div>
      </div>
      <b-collapse :id="`collapse-${claimId}`">
        <span v-if="!references.length">{{ t('entity.noReferences') }}</span>
        <reference v-for="(reference, referenceId) in references" :key="referenceId" :reference />
      </b-collapse>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Claim as ClaimData, EntityId, Snak } from '@/api/types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  claim: ClaimData
  entityId: EntityId
  propertyId: EntityId
  isReverseClaim?: boolean
  useShortValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isReverseClaim: false,
  useShortValue: false,
})

const claimId = computed(() => props.claim.id)
const mainsnak = computed(() => props.claim.mainsnak)
const rank = computed(() => props.claim.rank)
const references = computed(() => props.claim.references || [])
const qualifierOrder = (): EntityId[] => {
  let order: EntityId[] = []

  if (!('qualifiers' in props.claim) || props.claim.qualifiers === undefined) {
    return order
  }

  if ('qualifiers-order' in props.claim) {
    order = props.claim['qualifiers-order'] || []
  } else if ('qualifiers' in props.claim) {
    order = Object.keys(props.claim.qualifiers)
  }

  return order
}
const qualifiers = (propertyId: EntityId): Snak[] => {
  if (
    !('qualifiers' in props.claim) ||
    props.claim.qualifiers === undefined ||
    !(propertyId in props.claim.qualifiers)
  ) {
    return []
  }

  return props.claim.qualifiers[propertyId]
}
</script>

<style scoped>
div.qualifiers {
  font-size: 0.8em;
  padding-left: 1pt;
}
</style>
