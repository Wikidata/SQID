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
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
    },
    {
      path: '/status',
      name: 'status',
      component: () => import(/* webpackChunkName: "status" */ '@/views/Status.vue'),
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

    store.dispatch('loadTranslation', lang)
  }

  if (query && 'oauth_verifier' in query && 'oauth_token' in query) {
    const verifier = query.oauth_verifier.toString()
    const key = query.oauth_token.toString()
    store.dispatch('complete', { verifier, key })
  }

  next()
})

router.afterEach((_to, _from) => NProgress.done())

export default router
