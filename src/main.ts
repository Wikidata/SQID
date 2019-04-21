import '@babel/polyfill'
import Vue from 'vue'
import '@/plugins/bootstrap-vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store/index'
import '@/registerServiceWorker'
import i18n from '@/i18n'
import BootstrapVue from 'bootstrap-vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faSearch)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false
Vue.use(BootstrapVue)

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app')
