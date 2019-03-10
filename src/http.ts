import axios from 'axios'
import NProgress from 'nprogress'

export const http = axios.create()

http.interceptors.request.use((config) => {
  NProgress.start()

  return config
})

http.interceptors.response.use((response) => {
  NProgress.done()

  return response
})

export default http
