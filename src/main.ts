import 'nprogress/nprogress.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBan,
  faStar,
  faSearch,
  faInfoCircle,
  faArrowLeft,
  faAngleDown,
  faAngleRight,
  faCircleHalfStroke,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'

library.add(faBan)
library.add(faStar)
library.add(faSearch)
library.add(faArrowLeft)
library.add(faAngleDown)
library.add(faInfoCircle)
library.add(faAngleRight)
library.add(faCircleHalfStroke)
library.add(faMoon)
library.add(faSun)

const app = createApp(App)
  .use(createPinia())
  .use(i18n)
  .use(router)
  .component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
