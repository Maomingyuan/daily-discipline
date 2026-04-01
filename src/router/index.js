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
  },
  {
    path: '/profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
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
  
  // OAuth 回调处理：如果 URL 有 access_token，等待 Supabase 处理后跳转
  if (to.hash.includes('access_token')) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await authStore.init()
    if (authStore.user) {
      next('/')
      return
    }
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
