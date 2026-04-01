<template>
  <div class="container">
    <header>
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>个人中心</h1>
    </header>

    <!-- 用户信息卡片 -->
    <div class="card user-card">
      <div class="user-avatar">
        <img v-if="authStore.user?.user_metadata?.avatar_url" 
             :src="authStore.user.user_metadata.avatar_url" 
             class="avatar" />
        <div v-else class="avatar-placeholder">{{ userInitial }}</div>
      </div>
      <div class="user-info">
        <h2>{{ authStore.user?.user_metadata?.full_name || authStore.user?.email }}</h2>
        <p class="user-email">{{ authStore.user?.email }}</p>
      </div>
      <ProBadge v-if="authStore.isPro" />
    </div>

    <!-- Pro会员卡片 -->
    <div class="card pro-card" v-if="!authStore.isPro">
      <div class="pro-header">
        <h3>升级Pro会员</h3>
        <p>解锁完整功能，更好的数据体验</p>
      </div>
      <div class="pro-features">
        <div class="feature">✅ 无限历史记录</div>
        <div class="feature">✅ 数据趋势分析</div>
        <div class="feature">✅ 导出数据</div>
        <div class="feature">✅ 多设备同步</div>
      </div>
      <div class="pro-price">仅需 $2.9/月</div>
      <button @click="showUpgradeModal = true" class="upgrade-btn">
        立即升级
      </button>
    </div>

    <!-- Pro会员信息 -->
    <div class="card pro-info" v-else>
      <h3>Pro会员</h3>
      <p>到期时间：{{ formatExpireDate }}</p>
    </div>

    <!-- 历史记录 -->
    <div class="card" v-if="checkinStore.checkins.length > 0">
      <h3 class="card-title">打卡历史</h3>
      
      <div v-if="hasHiddenRecords" class="upgrade-hint">
        <p>📦 历史记录仅显示最近30天</p>
        <button @click="showUpgradeModal = true" class="upgrade-btn-small">
          升级Pro查看全部
        </button>
      </div>
      
      <div class="history-list">
        <div 
          v-for="item in visibleCheckins" 
          :key="item.id"
          class="history-item"
        >
          <div class="history-date">
            {{ formatDate(item.date) }}
            <span :class="item.status === 'yes' ? 'status-yes' : 'status-no'">
              {{ item.status === 'yes' ? '✅' : '❌' }}
            </span>
          </div>
          <div class="history-note" v-if="item.note">{{ item.note }}</div>
        </div>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="card">
      <button @click="handleLogout" class="logout-btn-full">退出登录</button>
    </div>

    <UpgradeModal 
      :visible="showUpgradeModal"
      @close="showUpgradeModal = false"
      @upgrade="handleUpgrade"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCheckinStore } from '@/stores/checkin'
import { format } from 'date-fns'
import ProBadge from '@/components/ProBadge.vue'
import UpgradeModal from '@/components/UpgradeModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const checkinStore = useCheckinStore()
const showUpgradeModal = ref(false)

const userInitial = computed(() => {
  const name = authStore.user?.user_metadata?.full_name || authStore.user?.email
  return name ? name.charAt(0).toUpperCase() : 'U'
})

const formatExpireDate = computed(() => {
  if (!authStore.proExpireAt) return ''
  return format(new Date(authStore.proExpireAt), 'yyyy年MM月dd日')
})

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

const formatDate = (dateStr) => {
  return format(new Date(dateStr), 'yyyy年MM月dd日')
}

const goBack = () => {
  router.push('/')
}

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/auth')
}

const handleUpgrade = (plan) => {
  alert(`选择了 ${plan} 套餐，支付功能开发中...`)
  showUpgradeModal.value = false
}

onMounted(async () => {
  await authStore.init()
  
  if (authStore.user) {
    await checkinStore.fetchCheckins()
  }
})
</script>

<style scoped>
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
}

header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

h1 {
  font-size: 24px;
  margin: 0;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
}

.user-email {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.pro-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pro-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.pro-header p {
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.pro-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.feature {
  font-size: 14px;
}

.pro-price {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.upgrade-btn {
  width: 100%;
  padding: 14px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.pro-info h3 {
  margin: 0 0 8px 0;
}

.pro-info p {
  margin: 0;
  color: #6b7280;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.upgrade-hint {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.upgrade-hint p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.upgrade-btn-small {
  padding: 8px 20px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.history-date {
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.status-yes {
  color: #16a34a;
}

.status-no {
  color: #dc2626;
}

.history-note {
  font-size: 14px;
  color: #6b7280;
}

.logout-btn-full {
  width: 100%;
  padding: 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 600;
}
</style>
