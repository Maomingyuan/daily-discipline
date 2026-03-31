<template>
  <div class="container">
    <header>
      <div class="logo">{{ $t('app.title') }}<span>{{ $t('app.subtitle') }}</span></div>
      <div class="header-actions">
        <div v-if="authStore.user" class="user-info">
          <img v-if="authStore.user.user_metadata?.avatar_url" :src="authStore.user.user_metadata.avatar_url" class="avatar" />
          <span class="user-name">{{ authStore.user.user_metadata?.full_name || authStore.user.email }}</span>
        </div>
        <LanguageSwitcher />
        <button v-if="authStore.user" @click="handleLogout" class="logout-btn">{{ $t('button.logout') }}</button>
        <button v-else @click="goToLogin" class="logout-btn">{{ $t('button.login') }}</button>
      </div>
    </header>
    
    <div class="card">
      <h3 class="card-title">{{ isEditing ? $t('card.title.edit') : $t('card.title.record') }}</h3>
      <div class="date-picker">
        <label>{{ $t('label.selectDate') }}</label>
        <input type="date" v-model="selectedDate" @change="loadSelectedDate" />
      </div>
      <div class="status-row">
        <button 
          class="status-btn"
          :class="{ 'active-yes': todayStatus === 'yes' }"
          @click="todayStatus = 'yes'"
        >
          {{ $t('button.completed') }}
        </button>
        <button 
          class="status-btn"
          :class="{ 'active-no': todayStatus === 'no' }"
          @click="todayStatus = 'no'"
        >
          {{ $t('button.notCompleted') }}
        </button>
      </div>
      <textarea 
        v-model="todayNote" 
        :placeholder="$t('placeholder.note')"
        rows="4"
      ></textarea>
      <button @click="saveToday" class="save-btn" :disabled="!todayStatus">
        {{ isEditing ? $t('button.update') : $t('button.save') }}
      </button>
    </div>
    
    <div class="card">
      <h3 class="card-title">{{ $t('card.title.stats') }}</h3>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">{{ $t('stats.total') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">{{ $t('stats.completed') }}</div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">{{ $t('card.title.calendar') }}</h3>
      <CalendarView :checkins="checkinStore.checkins" :selectedDate="selectedDate" @select-date="onDateSelect" />
    </div>
    
    <div class="card" v-if="checkinStore.checkins.length > 0">
      <h3 class="card-title">{{ $t('card.title.history') }}</h3>
      <div class="history-list">
        <div 
          v-for="item in checkinStore.checkins.slice(0, 10)" 
          :key="item.id"
          class="history-item"
        >
          <div class="history-date">
            {{ formatDate(item.date) }}
            <div>
              <span :class="item.status === 'yes' ? 'status-yes' : 'status-no'">
                {{ item.status === 'yes' ? '✅' : '❌' }}
              </span>
              <button @click="editRecord(item)" class="edit-btn">{{ $t('button.edit') }}</button>
            </div>
          </div>
          <div class="history-note" v-if="item.note">{{ item.note }}</div>
        </div>
      </div>
    </div>
    
    <Toast :message="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCheckinStore } from '@/stores/checkin'
import { format } from 'date-fns'
import CalendarView from '@/components/CalendarView.vue'
import Toast from '@/components/Toast.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import i18n from '@/i18n'

const authStore = useAuthStore()
const checkinStore = useCheckinStore()

const todayStatus = ref(null)
const todayNote = ref('')
const toastMessage = ref('')
const toastType = ref('success')
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'))
const isEditing = ref(false)

const stats = computed(() => {
  const total = checkinStore.checkins.length
  const completed = checkinStore.checkins.filter(c => c.status === 'yes').length
  return { total, completed }
})

const saveToday = async () => {
  if (!todayStatus.value) return
  
  // 未登录时提示并跳转到登录页
  if (!authStore.user) {
    toastMessage.value = i18n.t('toast.loginRequired')
    toastType.value = 'error'
    setTimeout(() => {
      window.location.href = '/auth'
    }, 1500)
    return
  }
  
  const { error } = await checkinStore.saveCheckin(
    selectedDate.value, 
    todayStatus.value, 
    todayNote.value
  )
  
  if (!error) {
    toastMessage.value = isEditing.value ? i18n.t('toast.updateSuccess') : i18n.t('toast.saveSuccess')
    toastType.value = 'success'
    isEditing.value = false
  } else {
    toastMessage.value = i18n.t('toast.saveFailed') + error.message
    toastType.value = 'error'
  }
}

const loadSelectedDate = () => {
  const checkin = checkinStore.checkins.find(c => c.date === selectedDate.value)
  if (checkin) {
    todayStatus.value = checkin.status
    todayNote.value = checkin.note || ''
    isEditing.value = true
  } else {
    todayStatus.value = null
    todayNote.value = ''
    isEditing.value = false
  }
}

const editRecord = (item) => {
  selectedDate.value = item.date
  todayStatus.value = item.status
  todayNote.value = item.note || ''
  isEditing.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onDateSelect = (date) => {
  selectedDate.value = date
  loadSelectedDate()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToLogin = () => {
  window.location.href = '/auth'
}

const handleLogout = async () => {
  await authStore.signOut()
  window.location.href = '/auth'
}

const formatDate = (dateStr) => {
  return format(new Date(dateStr), 'yyyy年MM月dd日')
}

onMounted(async () => {
  await authStore.init()
  
  if (authStore.user) {
    await checkinStore.fetchCheckins()
    
    // 检查今天是否已打卡
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayCheckin = checkinStore.checkins.find(c => c.date === today)
    if (todayCheckin) {
      todayStatus.value = todayCheckin.status
      todayNote.value = todayCheckin.note || ''
    }
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 20px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logo {
  font-size: 22px;
  font-weight: 700;
}

.logo span {
  color: #2563eb;
}

.logout-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.date-picker label {
  font-size: 14px;
  font-weight: 500;
}

.date-picker input {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.status-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.status-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background: transparent;
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
}

.status-btn.active-yes {
  background: #f0fdf4;
  border-color: #16a34a;
  color: #16a34a;
}

.status-btn.active-no {
  background: #fef2f2;
  border-color: #dc2626;
  color: #dc2626;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 14px;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 600;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2563eb;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
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
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-date div {
  display: flex;
  gap: 8px;
  align-items: center;
}

.edit-btn {
  padding: 4px 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.edit-btn:hover {
  background: #1d4ed8;
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
</style>
