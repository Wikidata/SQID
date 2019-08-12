import Vue from 'vue'
import Router, { NavigationGuard } from 'vue-router'
import Home from '@/views/Home.vue'
import Progress from './progress'
import store from '@/store/index'

import { EntityMissingError, MalformedEntityIdError } from '@/api/types'
import { getEntityInfo } from '@/api/wikidata'

Vue.use(Router)

const ensureEntityIsValid: NavigationGuard<Vue> = async (to, _from, next) => {
  const entityId = to.params.id

  if (entityId === undefined) {
    return next({ name: 'not-found' })
  }

  try {
    await getEntityInfo(entityId)
  } catch (err) {
    if (err instanceof MalformedEntityIdError) {
      return next({ name: 'invalid-entity',
                    params: { id: err.entityId },
                  })
    }

    if (err instanceof EntityMissingError) {
      return next({ name: 'not-found',
                    params: { id: err.entityId },
                  })
    }

    return next(err)
  }

  return next()
}

const ensureEntityIsInvalid: NavigationGuard<Vue> = async (to, _from, next) => {
  const entityId = to.params.id

  if (entityId === undefined) {
    return next()
  }

  try {
    await getEntityInfo(entityId)
  } catch (err) {
    if (err instanceof MalformedEntityIdError ||
        err instanceof EntityMissingError) {
      return next()
    }

    return next(err)
  }

  // actually a valid entity, redirect
  return next({ name: 'entity',
                params: { id: entityId },
              })
}


const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'SQID – Wikidata Explorer' },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
      meta: { title: 'SQID – About' },
    },
    {
      path: '/status',
      name: 'status',
      component: () => import(/* webpackChunkName: "status" */ '@/views/Status.vue'),
      meta: { title: 'SQID – Status' },
    },
    {
      path: '/entity/:id',
      name: 'entity',
      component: () => import(/* webpackChunkName: "entity" */ '@/views/Entity.vue'),
      props: true,
      beforeEnter: ensureEntityIsValid,
    },
    {
      path: '/classes/',
      name: 'classes',
      component: () => import(/* webpackChunkName: "construction" */ '@/views/Construction.vue'),
    },
    {
      path: '/properties/',
      name: 'properties',
      component: () => import(/* webpackChunkName: "construction" */ '@/views/Construction.vue'),
    },
    {
      path: '/rules/',
      name: 'rules',
      component: () => import(/* webpackChunkName: "construction" */ '@/views/Construction.vue'),
    },
    {
      path: '/lexemes/',
      name: 'lexemes',
      component: () => import(/* webpackChunkName: "construction" */ '@/views/Construction.vue'),
    },
    {
      path: '/invalid/:id',
      name: 'invalid-entity',
      component: () => import(/* webpackChunkName: "invalidEntity" */ '@/views/InvalidEntity.vue'),
      props: true,
      beforeEnter: ensureEntityIsInvalid,
    },
    {
      path: '/404/:id?',
      name: 'not-found',
      component: () => import(/* webpackChunkName: "notFound" */ '@/views/NotFound.vue'),
      props: true,
      beforeEnter: ensureEntityIsInvalid,
    },
    {
      path: '*',
      redirect: { name: 'not-found' },
    },
  ],
})

router.beforeResolve((_to, _from, next) => {
  Progress.start()
  next()
})

router.beforeEach(async (to, _from, next) => {
  const query = to.query

  if (query && 'lang' in query) {
    const lang = query.lang.toString()

    store.commit('setTranslationFromUri')
    store.dispatch('loadTranslation', lang)
  }

  next()
})

router.beforeEach(async (to, _from, next) => {
  const query = to.query

  if (query && 'oauth_verifier' in query && 'oauth_token' in query) {
    const verifier = query.oauth_verifier.toString()
    const key = query.oauth_token.toString()
    store.dispatch('complete', { verifier, key })
  }

  next()
})

router.beforeEach((to, _from, next) => {
  const segments = to.matched.slice().reverse()
  const title = segments.find((segment) => segment.meta && segment.meta.title)

  if (title) {
    document.title = title.meta.title
  }

  next()
})

router.afterEach((_to, _from) => Progress.done())

export default router
