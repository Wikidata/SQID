import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { acceptHMRUpdate, defineStore } from 'pinia'

import { wikidataUrl } from '@/api/wikidata'
import type { EntityId } from '@/api/types'
import { LOCALES, loadMessages, updateCurrentTranslation } from '@/i18n'

type Store = ReturnType<typeof useI18nStore>

export const useI18nStore = defineStore('i18n', () => {
  const i18n = useI18n()
  const language = ref('en')
  const setManually = ref(false)

  function $reset(this: Store) {
    this.$patch({
      language: 'en',
      setManually: false,
    })
  }

  async function preferLanguages(this: Store, languages: readonly string[]) {
    for (const language of languages) {
      if (this.haveTranslation(language)) {
        await this.setLanguage(language)
        return
      }
    }
  }

  async function setLanguage(this: Store, lang: string) {
    if (this.language === lang) {
      return
    }

    if (this.haveTranslation(lang)) {
      await this.loadLanguage(lang)
    }

    await updateCurrentTranslation(lang)
    this.$patch({
      language: lang,
      setManually: true,
    })
  }

  async function loadLanguage(this: Store, lang: string) {
    if (!i18n.availableLocales.includes(lang)) {
      await loadMessages(lang)
    }
  }

  const languages = computed(() => {
    return LOCALES
  })

  function haveTranslation(this: Store, lang: string) {
    return Object.keys(this.languages).includes(lang)
  }

  const entityUrl = computed(
    () => (entityId: EntityId) =>
      wikidataUrl(entityId, setManually.value ? language.value : undefined),
  )

  return {
    language,
    setManually,

    entityUrl,
    languages,
    haveTranslation,

    preferLanguages,
    setLanguage,
    loadLanguage,

    $reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useI18nStore, import.meta.hot))
}
