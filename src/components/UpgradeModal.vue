<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">✕</button>

      <h2>升级Pro会员</h2>
      <p class="subtitle">解锁完整功能，更好的数据体验</p>

      <!-- 功能对比表 -->
      <div class="comparison-table">
        <div class="comparison-header">
          <div class="feature-col">功能</div>
          <div class="free-col">免费版</div>
          <div class="pro-col">Pro版</div>
        </div>
        <div class="comparison-row" v-for="row in features" :key="row.name">
          <div class="feature-col">{{ row.name }}</div>
          <div class="free-col">{{ row.free }}</div>
          <div class="pro-col">{{ row.pro }}</div>
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
          <div v-if="key === 'yearly'" class="popular-badge">最划算</div>
          <div class="plan-name">{{ plan.label }}</div>
          <div class="plan-price">
            ${{ plan.price }}<span v-if="key === 'monthly'">/月</span><span v-if="key === 'yearly'">/年</span>
          </div>
          <div v-if="key === 'yearly'" class="plan-save">节省$5.8</div>
        </div>
      </div>

      <!-- 支付区域 -->
      <div class="payment-section">
        <!-- 加载中 -->
        <div v-if="sdkLoading" class="sdk-loading">
          <div class="spinner"></div>
          <span>加载支付...</span>
        </div>

        <!-- PayPal 按钮容器，key 变化时强制重新渲染 -->
        <div v-show="!sdkLoading && !paymentSuccess && !paymentError" :id="paypalContainerId" class="paypal-container"></div>

        <!-- 支付成功 -->
        <div v-if="paymentSuccess" class="payment-success">
          <div class="success-icon">🎉</div>
          <h3>升级成功！</h3>
          <p>欢迎加入 Pro 会员</p>
        </div>

        <!-- 支付错误 -->
        <div v-if="paymentError" class="payment-error">
          <p>{{ paymentError }}</p>
          <button class="retry-btn" @click="retryPayment">重试</button>
        </div>
      </div>

      <p class="secure-hint">🔒 支付由 PayPal 安全处理，我们不存储您的支付信息</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { PLANS, renderPaypalButton } from '@/composables/usePaypal'
import { useAuthStore } from '@/stores/auth'

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

const features = [
  { name: '打卡记录', free: '✅', pro: '✅' },
  { name: '历史记录', free: '仅30天', pro: '✅ 无限' },
  { name: '数据分析', free: '❌', pro: '✅' },
  { name: '数据导出', free: '❌', pro: '✅' },
  { name: '多设备同步', free: '❌', pro: '✅' }
]

async function mountPaypalButtons() {
  // 清除旧按钮
  if (currentButtons) {
    currentButtons.close()
    currentButtons = null
  }
  const container = document.getElementById(paypalContainerId)
  if (container) container.innerHTML = ''

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
    paymentError.value = `支付加载失败：${err.message}`
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
    paymentError.value = `支付成功，但状态更新失败：${error.message}。请联系客服。`
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
  paymentError.value = `支付遇到问题：${err.message || '未知错误'}`
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
      await nextTick()
      await mountPaypalButtons()
    } else {
      if (currentButtons) {
        currentButtons.close()
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
