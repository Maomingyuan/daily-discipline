<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">✕</button>

      <h2>{{ $t('profile.upgradeModal.title') }}</h2>
      <p class="subtitle">{{ $t('profile.upgradeModal.subtitle') }}</p>

      <!-- 功能对比表 -->
      <div class="comparison-table">
        <div class="comparison-header">
          <div class="feature-col">{{ $t('profile.upgradeModal.tableFeature') }}</div>
          <div class="free-col">{{ $t('profile.upgradeModal.tableFree') }}</div>
          <div class="pro-col">{{ $t('profile.upgradeModal.tablePro') }}</div>
        </div>
        <div class="comparison-row" v-for="row in features" :key="row.key">
          <div class="feature-col">{{ $t(`profile.upgradeModal.features.${row.key}`) }}</div>
          <div class="free-col">{{ row.freeKey ? $t(`profile.upgradeModal.${row.freeKey}`) : row.free }}</div>
          <div class="pro-col">{{ row.proKey ? $t(`profile.upgradeModal.${row.proKey}`) : row.pro }}</div>
        </div>
      </div>

      <!-- 套餐选择 -->
      <div class="plans">
        <div
          v-for="(plan, key) in PLANS"
          :key="key"
          class="plan-card"
          :class="{ active: selectedPlan === key, popular: key === 'yearly' }"
          @click="selectPlan(key)"
        >
          <div v-if="key === 'yearly'" class="popular-badge">{{ $t('profile.upgradeModal.plans.popularBadge') }}</div>
          <div class="plan-name">{{ $t(`profile.upgradeModal.plans.${key}`) }}</div>
          <div class="plan-price">
            ${{ plan.price }}
            <span v-if="key === 'monthly'">{{ $t('profile.upgradeModal.plans.perMonth') }}</span>
            <span v-if="key === 'yearly'">{{ $t('profile.upgradeModal.plans.perYear') }}</span>
          </div>
          <div v-if="key === 'yearly'" class="plan-save">{{ $t('profile.upgradeModal.plans.saveAmount') }}</div>
        </div>
      </div>

      <!-- 支付区域 -->
      <div class="payment-section">
        <!-- 加载中 -->
        <div v-if="sdkLoading" class="sdk-loading">
          <div class="spinner"></div>
          <span>{{ $t('profile.upgradeModal.loading') }}</span>
        </div>

        <!-- PayPal 按钮容器：始终保持在 DOM 中，用 visibility 控制显隐 -->
        <div
          :id="paypalContainerId"
          class="paypal-container"
          :style="{ visibility: (!sdkLoading && !paymentSuccess && !paymentError) ? 'visible' : 'hidden', minHeight: '50px' }"
        ></div>

        <!-- 支付成功 -->
        <div v-if="paymentSuccess" class="payment-success">
          <div class="success-icon">{{ $t('profile.upgradeModal.successIcon') }}</div>
          <h3>{{ $t('profile.upgradeModal.successTitle') }}</h3>
          <p>{{ $t('profile.upgradeModal.successMsg') }}</p>
        </div>

        <!-- 支付错误 -->
        <div v-if="paymentError" class="payment-error">
          <p>{{ paymentError }}</p>
          <button class="retry-btn" @click="retryPayment">{{ $t('profile.upgradeModal.retryBtn') }}</button>
        </div>
      </div>

      <p class="secure-hint">{{ $t('profile.upgradeModal.secureHint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { getCurrentInstance } from 'vue'
import { PLANS, renderPaypalButton } from '@/composables/usePaypal'
import { useAuthStore } from '@/stores/auth'
import i18n from '@/i18n'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close', 'upgraded'])

const authStore = useAuthStore()
const selectedPlan = ref('yearly')
const sdkLoading = ref(false)
const paymentSuccess = ref(false)
const paymentError = ref('')
const paypalContainerId = 'paypal-buttons-container'

let currentButtons = null

// key 对应 i18n features.xxx，free/pro 用 freeKey/proKey 指向 i18n 或直接传 emoji
const features = [
  { key: 'checkin',   free: '✅', pro: '✅' },
  { key: 'history',   freeKey: 'freeHistory', proKey: 'proUnlimited' },
  { key: 'analytics', free: '❌', pro: '✅' },
  { key: 'export',    free: '❌', pro: '✅' },
  { key: 'sync',      free: '❌', pro: '✅' }
]

async function mountPaypalButtons() {
  // 先销毁旧按钮
  if (currentButtons) {
    try { currentButtons.close() } catch (_) {}
    currentButtons = null
  }

  // 等待 DOM 更新，确保容器可见
  await nextTick()
  await nextTick() // 双 tick 确保 visibility 已更新

  const container = document.getElementById(paypalContainerId)
  if (!container) return
  container.innerHTML = '' // 清空旧内容

  sdkLoading.value = true
  paymentError.value = ''

  try {
    currentButtons = await renderPaypalButton(
      paypalContainerId,
      selectedPlan.value,
      handlePaymentSuccess,
      handlePaymentError
    )
  } catch (err) {
    paymentError.value = `${i18n.t('profile.upgradeModal.loadErrorPrefix')}${err.message}`
  } finally {
    sdkLoading.value = false
  }
}

async function selectPlan(key) {
  if (selectedPlan.value === key) return
  selectedPlan.value = key
  await nextTick()
  await mountPaypalButtons()
}

async function handlePaymentSuccess({ orderId, planKey, expireAt }) {
  const { error } = await authStore.upgradeToPro(expireAt)
  if (error) {
    paymentError.value = `${i18n.t('profile.upgradeModal.updateErrorPrefix')}${error.message}。请联系客服。`
    return
  }
  paymentSuccess.value = true
  // 2 秒后关闭弹窗
  setTimeout(() => {
    emit('upgraded')
    emit('close')
    paymentSuccess.value = false
  }, 2000)
}

function handlePaymentError(err) {
  paymentError.value = `${i18n.t('profile.upgradeModal.errorPrefix')}${err.message || '未知错误'}`
}

async function retryPayment() {
  paymentError.value = ''
  await mountPaypalButtons()
}

// 弹窗打开时加载按钮
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      paymentSuccess.value = false
      paymentError.value = ''
      // 等弹窗 DOM 完全渲染（包括 transition）
      await nextTick()
      await new Promise(r => setTimeout(r, 50))
      await mountPaypalButtons()
    } else {
      if (currentButtons) {
        try { currentButtons.close() } catch (_) {}
        currentButtons = null
      }
    }
  }
)

onUnmounted(() => {
  if (currentButtons) {
    currentButtons.close()
    currentButtons = null
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
}

h2 {
  margin: 0 0 6px;
  font-size: 22px;
}

.subtitle {
  color: #6b7280;
  margin: 0 0 20px;
  font-size: 14px;
}

/* ---- 功能对比表 ---- */
.comparison-table {
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
}

.comparison-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: #f9fafb;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  border-bottom: 1px solid #e5e7eb;
}
.comparison-row:last-child { border-bottom: none; }

.feature-col, .free-col, .pro-col {
  padding: 10px 12px;
  text-align: center;
}
.feature-col { text-align: left; font-weight: 500; }
.pro-col { color: #667eea; font-weight: 600; }

/* ---- 套餐 ---- */
.plans {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.plan-card {
  flex: 1;
  padding: 16px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  position: relative;
  transition: all 0.2s;
  user-select: none;
}
.plan-card:hover { border-color: #667eea; }
.plan-card.active { border-color: #667eea; background: #f0f4ff; }
.plan-card.popular { transform: scale(1.04); }

.popular-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.plan-name { font-size: 13px; color: #6b7280; margin-bottom: 6px; }

.plan-price {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}
.plan-price span { font-size: 12px; color: #6b7280; }

.plan-save { font-size: 11px; color: #16a34a; margin-top: 4px; }

/* ---- 支付区域 ---- */
.payment-section {
  min-height: 60px;
  margin-bottom: 12px;
}

.paypal-container { min-height: 50px; }

.sdk-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.payment-success {
  text-align: center;
  padding: 24px 0;
}
.success-icon { font-size: 48px; margin-bottom: 8px; }
.payment-success h3 { margin: 0 0 4px; color: #16a34a; font-size: 20px; }
.payment-success p { margin: 0; color: #6b7280; }

.payment-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #dc2626;
}

.retry-btn {
  margin-top: 10px;
  padding: 6px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.secure-hint {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}
</style>
