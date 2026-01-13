import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export { api }

export default defineBoot(({ app }) => {
  app.config.globalProperties.$api = api
  app.provide('api', api)
})
