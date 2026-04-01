// 在 DashboardView.vue 的 <script setup> 中添加以下内容

// 1. 添加导入
import UpgradeModal from '@/components/UpgradeModal.vue'
import ProBadge from '@/components/ProBadge.vue'

// 2. 添加变量
const showUpgradeModal = ref(false)

// 3. 添加计算属性 - 过滤历史记录（30天限制）
const visibleCheckins = computed(() => {
  if (authStore.isPro) {
    return checkinStore.checkins
  }
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return checkinStore.checkins.filter(c => {
    return new Date(c.date) >= thirtyDaysAgo
  })
})

// 4. 检查是否有隐藏记录
const hasHiddenRecords = computed(() => {
  return !authStore.isPro && 
         checkinStore.checkins.length > visibleCheckins.value.length
})

// 5. 添加升级处理函数
const handleUpgrade = (plan) => {
  // 临时方案：显示提示
  alert(`选择了 ${plan} 套餐，支付功能开发中...`)
  showUpgradeModal.value = false
}
