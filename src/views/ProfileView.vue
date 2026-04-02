<template>
  <div class="container">
    <header>
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>个人中心</h1>
    </header>

    <!-- 用户信息卡片 -->
    <div class="card user-card" :class="{ 'user-card-pro': authStore.isPro }">
      <div class="user-avatar">
        <img v-if="authStore.user?.user_metadata?.avatar_url"
             :src="authStore.user.user_metadata.avatar_url"
             class="avatar" :class="{ 'avatar-pro': authStore.isPro }" />
        <div v-else class="avatar-placeholder" :class="{ 'avatar-placeholder-pro': authStore.isPro }">{{ userInitial }}</div>
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
    <div class="card pro-member-card" v-else>
      <div class="pro-member-bg"></div>
      <div class="pro-member-inner">
        <div class="pro-member-top">
          <div class="pro-crown">👑</div>
          <div class="pro-member-title">
            <span class="pro-label">PRO 会员</span>
            <span class="pro-slogan">尊享全部特权</span>
          </div>
        </div>

        <div class="pro-perks">
          <div class="perk-item">✦ 无限历史记录</div>
          <div class="perk-item">✦ 数据趋势分析</div>
          <div class="perk-item">✦ 导出数据</div>
          <div class="perk-item">✦ 多设备同步</div>
        </div>

        <div class="pro-expire" v-if="authStore.proExpireAt">
          <span class="expire-label">有效期至</span>
          <span class="expire-date">{{ formatExpireDate }}</span>
        </div>
        <div class="pro-expire" v-else>
          <span class="expire-label">会员类型</span>
          <span class="expire-date">终身会员 · 永久有效</span>
        </div>
      </div>
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
      @upgraded="handleUpgraded"
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

const handleUpgraded = () => {
  showUpgradeModal.value = false
  // Pro 状态已由 auth store 更新，页面响应式自动刷新
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

/* ===== Pro 用户信息卡片 ===== */
.user-card-pro {
  border: 1.5px solid #f6d365;
  box-shadow: 0 0 0 3px rgba(246, 211, 101, 0.15), 0 1px 3px rgba(0,0,0,0.08);
}

.avatar-pro,
.avatar-placeholder-pro {
  box-shadow: 0 0 0 3px #f6d365, 0 0 12px rgba(246, 211, 101, 0.5);
}

/* ===== Pro 会员卡片 ===== */
.pro-member-card {
  position: relative;
  overflow: hidden;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: 0 4px 24px rgba(200, 130, 20, 0.25);
}

.pro-member-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1b00 40%, #1a1a2e 100%);
  z-index: 0;
}

/* 金色光晕装饰 */
.pro-member-bg::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(246,211,101,0.25) 0%, transparent 70%);
  border-radius: 50%;
}

.pro-member-bg::after {
  content: '';
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(232,160,32,0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.pro-member-inner {
  position: relative;
  z-index: 1;
  padding: 24px 20px;
}

.pro-member-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.pro-crown {
  font-size: 40px;
  line-height: 1;
  filter: drop-shadow(0 2px 8px rgba(246,211,101,0.8));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}

.pro-member-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pro-label {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #f6d365 0%, #ffd700 50%, #e8a020 100%);
  background-size: 200% 200%;
  animation: gold-shimmer 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pro-slogan {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  letter-spacing: 1px;
}

@keyframes gold-shimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.pro-perks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.perk-item {
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(246,211,101,0.2);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pro-expire {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(246,211,101,0.1);
  border: 1px solid rgba(246,211,101,0.3);
  border-radius: 10px;
  padding: 10px 16px;
}

.expire-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.expire-date {
  font-size: 14px;
  font-weight: 600;
  color: #f6d365;
}
</style>
