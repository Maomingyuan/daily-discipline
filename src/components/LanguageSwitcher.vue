<template>
  <select v-model="currentLocale" @change="changeLocale" class="lang-select">
    <option value="en">English</option>
    <option value="zh">中文</option>
  </select>
</template>

<script setup>
import { ref } from 'vue'
import i18n from '../i18n'

const currentLocale = ref(i18n.locale)

const changeLocale = () => {
  i18n.setLocale(currentLocale.value)
}
</script>

<style scoped>
.lang-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
