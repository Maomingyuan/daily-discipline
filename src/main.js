import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import i18n from './i18n'

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.$t = i18n.t.bind(i18n)
app.config.globalProperties.$i18n = i18n

app.use(pinia)
app.use(router)

// 初始化认证状态
const authStore = useAuthStore()
authStore.init()

app.mount('#app')
