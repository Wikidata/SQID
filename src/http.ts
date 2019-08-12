import axios from 'axios'
import Progress from './progress'

export const http = axios.create()

http.interceptors.request.use((config) => {
  Progress.start()

  return config
})

http.interceptors.response.use((response) => {
  Progress.done()

  return response
}, (error) => {
  Progress.done()

  return Promise.reject(error)
})

export default http
