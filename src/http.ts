import axios from 'axios'
import NProgress from 'nprogress'

const http = axios.create()

http.interceptors.request.use((config) => {
  NProgress.start()
  return config
})

http.interceptors.response.use((response) => {
  NProgress.done()
})

export default http
