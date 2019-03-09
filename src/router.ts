import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import NProgress from 'nprogress'

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
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
})

router.beforeResolve((_to, _from, next) => {
  NProgress.start()
  next()
})

router.afterEach((_to, _from) => NProgress.done())

export default router
