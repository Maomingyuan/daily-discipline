import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/auth',
    component: () => import('@/views/AuthView.vue')
  },
  {
    path: '/',
    component: () => import('@/views/DashboardView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 等待认证状态初始化
  if (!authStore.session && !authStore.user) {
    await authStore.init()
  }
  
  if (to.meta.requiresAuth && !authStore.user) {
    next('/auth')
  } else if (to.path === '/auth' && authStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router
