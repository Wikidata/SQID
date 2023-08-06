import './assets/main.css'
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

const app = createApp(App)
  .use(createPinia())
  .use(router)
  .use(i18n)
  .component('font-awesome-icon', FontAwesomeIcon)
  .mount('#app')
