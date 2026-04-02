/**
 * PayPal JS SDK 集成
 * 动态加载 PayPal SDK，避免污染全局和 SSR 问题
 */

const PAYPAL_CLIENT_ID = 'AbjsEbKGtbyxtSicxbNdeiDPcTCWYjRfAUkfgrxoYlXg32x4O0zIA_H7oVt1ekqV8-nvKVaBc22Xja5o'
const CURRENCY = 'USD'

// 套餐配置
export const PLANS = {
  monthly: {
    label: '月付',
    price: '2.90',
    description: 'Monthly Pro subscription',
    durationDays: 30
  },
  yearly: {
    label: '年付',
    price: '29.00',
    description: 'Yearly Pro subscription',
    durationDays: 365
  },
  lifetime: {
    label: '终身',
    price: '69.00',
    description: 'Lifetime Pro access',
    durationDays: 36500 // ~100 年
  }
}

let sdkLoaded = false
let sdkLoadPromise = null

/**
 * 动态加载 PayPal JS SDK（只加载一次）
 */
export function loadPaypalSdk() {
  if (sdkLoaded && window.paypal) return Promise.resolve(window.paypal)
  if (sdkLoadPromise) return sdkLoadPromise

  sdkLoadPromise = new Promise((resolve, reject) => {
    // 清除已有残留脚本
    const existing = document.getElementById('paypal-sdk')
    if (existing) existing.remove()

    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${CURRENCY}&intent=capture`
    script.onload = () => {
      sdkLoaded = true
      resolve(window.paypal)
    }
    script.onerror = () => {
      sdkLoadPromise = null
      reject(new Error('PayPal SDK 加载失败'))
    }
    document.head.appendChild(script)
  })

  return sdkLoadPromise
}

/**
 * 渲染 PayPal 支付按钮到指定容器
 *
 * @param {string} containerId  - DOM 容器 ID
 * @param {string} planKey      - 'monthly' | 'yearly' | 'lifetime'
 * @param {Function} onSuccess  - 支付成功回调，参数为 { orderId, planKey, expireAt }
 * @param {Function} onError    - 错误回调，参数为 Error
 * @returns {Promise<{ close: Function }>}  返回带 close 方法的对象，用于清理
 */
export async function renderPaypalButton(containerId, planKey, onSuccess, onError) {
  const paypal = await loadPaypalSdk()
  const plan = PLANS[planKey]
  if (!plan) throw new Error(`Unknown plan: ${planKey}`)

  const buttons = paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'pay',
      height: 45
    },

    // 创建订单
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [
          {
            description: plan.description,
            amount: {
              currency_code: CURRENCY,
              value: plan.price
            }
          }
        ],
        application_context: {
          shipping_preference: 'NO_SHIPPING'
        }
      })
    },

    // 支付批准后捕获
    onApprove: async (data, actions) => {
      try {
        const order = await actions.order.capture()
        const orderId = order.id
        const now = new Date()
        const expireAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
        await onSuccess({ orderId, planKey, expireAt: expireAt.toISOString() })
      } catch (err) {
        onError(err)
      }
    },

    onError: (err) => {
      onError(err)
    },

    onCancel: () => {
      // 用户主动取消，不需要特殊处理
    }
  })

  await buttons.render(`#${containerId}`)
  return { close: () => buttons.close() }
}
