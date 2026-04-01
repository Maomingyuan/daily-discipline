<template>
  <div v-if="visible" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
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
        <div class="comparison-row">
          <div class="feature-col">打卡记录</div>
          <div class="free-col">✅</div>
          <div class="pro-col">✅</div>
        </div>
        <div class="comparison-row">
          <div class="feature-col">历史记录</div>
          <div class="free-col">仅30天</div>
          <div class="pro-col">✅ 无限</div>
        </div>
        <div class="comparison-row">
          <div class="feature-col">数据分析</div>
          <div class="free-col">❌</div>
          <div class="pro-col">✅</div>
        </div>
        <div class="comparison-row">
          <div class="feature-col">数据导出</div>
          <div class="free-col">❌</div>
          <div class="pro-col">✅</div>
        </div>
        <div class="comparison-row">
          <div class="feature-col">多设备同步</div>
          <div class="free-col">❌</div>
          <div class="pro-col">✅</div>
        </div>
      </div>
      
      <div class="plans">
        <div 
          class="plan-card"
          :class="{ active: selectedPlan === 'monthly' }"
          @click="selectedPlan = 'monthly'"
        >
          <div class="plan-name">月付</div>
          <div class="plan-price">$2.9<span>/月</span></div>
        </div>
        
        <div 
          class="plan-card popular"
          :class="{ active: selectedPlan === 'yearly' }"
          @click="selectedPlan = 'yearly'"
        >
          <div class="popular-badge">最划算</div>
          <div class="plan-name">年付</div>
          <div class="plan-price">$29<span>/年</span></div>
          <div class="plan-save">节省$6</div>
        </div>
        
        <div 
          class="plan-card"
          :class="{ active: selectedPlan === 'lifetime' }"
          @click="selectedPlan = 'lifetime'"
        >
          <div class="plan-name">终身</div>
          <div class="plan-price">$69</div>
        </div>
      </div>
      
      <button @click="handleUpgrade" class="upgrade-btn">
        立即升级
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'upgrade'])
const selectedPlan = ref('yearly')

const handleUpgrade = () => {
  emit('upgrade', selectedPlan.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.subtitle {
  color: #6b7280;
  margin: 0 0 24px 0;
}

.comparison-table {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
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

.comparison-row:last-child {
  border-bottom: none;
}

.feature-col, .free-col, .pro-col {
  padding: 12px;
  text-align: center;
}

.feature-col {
  text-align: left;
  font-weight: 500;
}

.pro-col {
  color: #667eea;
  font-weight: 600;
}

.plans {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.plan-card {
  flex: 1;
  padding: 20px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  position: relative;
  transition: all 0.2s;
}

.plan-card:hover {
  border-color: #667eea;
}

.plan-card.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.popular {
  transform: scale(1.05);
}

.popular-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.plan-name {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.plan-price {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.plan-price span {
  font-size: 14px;
  color: #6b7280;
}

.plan-save {
  font-size: 12px;
  color: #16a34a;
  margin-top: 4px;
}

.upgrade-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.upgrade-btn:hover {
  transform: translateY(-2px);
}
</style>
