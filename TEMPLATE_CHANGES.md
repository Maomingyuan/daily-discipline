# DashboardView.vue 模板修改指南

## 修改5：在 header 的 logo 部分添加 ProBadge

找到这行：
```vue
<div class="logo">{{ $t('app.title') }}<span>{{ $t('app.subtitle') }}</span></div>
```

改为：
```vue
<div class="logo">
  {{ $t('app.title') }}<span>{{ $t('app.subtitle') }}</span>
  <ProBadge v-if="authStore.isPro" />
</div>
```

## 修改6：在历史记录卡片中添加升级提示

找到这段：
```vue
<div class="card" v-if="checkinStore.checkins.length > 0">
  <h3 class="card-title">{{ $t('card.title.history') }}</h3>
  <div class="history-list">
```

在 `<h3>` 和 `<div class="history-list">` 之间添加：
```vue
<!-- 免费用户提示 -->
<div v-if="hasHiddenRecords" class="upgrade-hint">
  <p>📦 历史记录仅显示最近30天</p>
  <button @click="showUpgradeModal = true" class="upgrade-btn-small">
    升级Pro查看全部
  </button>
</div>
```

## 修改7：修改历史记录循环

找到：
```vue
v-for="item in checkinStore.checkins.slice(0, 10)"
```

改为：
```vue
v-for="item in visibleCheckins.slice(0, 10)"
```

## 修改8：在模板最后添加升级弹窗

在 `<Toast>` 组件后添加：
```vue
<UpgradeModal 
  :visible="showUpgradeModal"
  @close="showUpgradeModal = false"
  @upgrade="handleUpgrade"
/>
```
