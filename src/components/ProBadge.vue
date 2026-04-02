<template>
  <span class="pro-badge">
    <span class="crown">👑</span>
    <span class="text">PRO</span>
  </span>
</template>

<style scoped>
.pro-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, #f6d365 0%, #e8a020 50%, #f6d365 100%);
  background-size: 200% 200%;
  animation: shimmer 2.5s ease infinite;
  color: #7c4a00;
  padding: 3px 10px 3px 6px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-left: 8px;
  box-shadow: 0 2px 8px rgba(230, 160, 32, 0.5);
  vertical-align: middle;
}

.crown {
  font-size: 13px;
  line-height: 1;
}

.text {
  letter-spacing: 1px;
}

@keyframes shimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
