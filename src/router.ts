import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import NProgress from 'nprogress'
import store from '@/store/index'

Vue.use(Router)

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
    },
  ],
})

router.beforeResolve((_to, _from, next) => {
  NProgress.start()
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

router.afterEach((_to, _from) => NProgress.done())

export default router
