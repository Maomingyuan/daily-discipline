# DashboardView.vue 修改指南

## 修改1：在 <script setup> 顶部添加导入

```javascript
import UpgradeModal from '@/components/UpgradeModal.vue'
import ProBadge from '@/components/ProBadge.vue'
```

## 修改2：在变量声明区域添加

```javascript
const showUpgradeModal = ref(false)
```

## 修改3：在 stats 计算属性后添加

```javascript
// 过滤历史记录（免费用户30天限制）
const visibleCheckins = computed(() => {
  if (authStore.isPro) {
    return checkinStore.checkins
  }
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  return checkinStore.checkins.filter(c => new Date(c.date) >= thirtyDaysAgo)
})

const hasHiddenRecords = computed(() => {
  return !authStore.isPro && checkinStore.checkins.length > visibleCheckins.value.length
})
```

## 修改4：添加升级处理函数

```javascript
const handleUpgrade = (plan) => {
  alert(`选择了 ${plan} 套餐`)
  showUpgradeModal.value = false
}
```
