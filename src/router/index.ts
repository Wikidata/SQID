import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useI18nStore } from '@/stores/i18n'

// todo(mx): implement navigation guards

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/status',
      name: 'status',
      component: () => import('@/views/StatusView.vue'),
      meta: { title: 'SQID – Status' },
    },
    {
      // todo(mx): fix this
      path: '/entity/:id',
      name: 'entity',
      //component: () => import('@/views/EntityView.vue'),
      component: () => import('@/views/UnderConstructionView.vue'),
      props: true,
      //      beforeEnter: ensureEntityIsValid,
    },
    {
      path: '/classes/',
      name: 'classes',
      component: () => import('@/views/UnderConstructionView.vue'),
    },
    {
      path: '/properties/',
      name: 'properties',
      component: () => import('@/views/UnderConstructionView.vue'),
    },
    {
      path: '/rules/',
      name: 'rules',
      component: () => import('@/views/UnderConstructionView.vue'),
    },
    {
      path: '/lexemes/',
      name: 'lexemes',
      component: () => import('@/views/UnderConstructionView.vue'),
    },
    {
      path: '/invalid/:id',
      name: 'invalid-entity',
      component: () => import('@/views/InvalidEntityView.vue'),
      props: true,
      //beforeEnter: ensureEntityIsInvalid,
    },
    {
      path: '/404/:id?',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      props: true,
      //beforeEnter: ensureEntityIsInvalid,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'catchall',
      redirect: { name: 'not-found' },
    },
  ],
})

router.beforeEach(async (to, _from) => {
  const i18nStore = useI18nStore()

  if (!('lang' in to.query)) {
    return
  }

  const lang = to.query.lang

  if (typeof lang != 'string') {
    return
  }

  i18nStore.setLanguage(lang)
})

export default router
