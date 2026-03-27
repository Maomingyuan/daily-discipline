<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>自律<span>打卡</span></h1>
      <div v-if="mode === 'login'">
        <input v-model="email" type="email" placeholder="邮箱" />
        <input v-model="password" type="password" placeholder="密码" />
        <button @click="handleLogin" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p>没有账号？<a @click="mode = 'signup'">注册</a></p>
      </div>
      <div v-else>
        <input v-model="email" type="email" placeholder="邮箱" />
        <input v-model="password" type="password" placeholder="密码" />
        <button @click="handleSignup" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <p>已有账号？<a @click="mode = 'login'">登录</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const mode = ref('login')
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const { error } = await authStore.signIn(email.value, password.value)
  loading.value = false
  if (!error) {
    router.push('/')
  } else {
    alert('登录失败: ' + error.message)
  }
}

const handleSignup = async () => {
  loading.value = true
  const { error } = await authStore.signUp(email.value, password.value)
  loading.value = false
  if (!error) {
    alert('注册成功！请查收验证邮件')
  } else {
    alert('注册失败: ' + error.message)
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7f5;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
}

h1 span {
  color: #2563eb;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
}

button {
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

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

p {
  text-align: center;
  margin-top: 16px;
  color: #6b7280;
}

a {
  color: #2563eb;
  cursor: pointer;
  text-decoration: underline;
}
</style>
