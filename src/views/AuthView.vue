<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>{{ $t('app.title') }}<span>{{ $t('app.subtitle') }}</span></h1>
        <LanguageSwitcher />
      </div>
      <div v-if="mode === 'login'">
        <input v-model="email" type="email" :placeholder="$t('auth.email')" />
        <input v-model="password" type="password" :placeholder="$t('auth.password')" />
        <button @click="handleLogin" :disabled="loading">
          {{ loading ? $t('auth.loggingIn') : $t('auth.loginButton') }}
        </button>
        <p>{{ $t('auth.noAccount') }}<a @click="mode = 'signup'">{{ $t('auth.signupButton') }}</a></p>
      </div>
      <div v-else>
        <input v-model="email" type="email" :placeholder="$t('auth.email')" />
        <input v-model="password" type="password" :placeholder="$t('auth.password')" />
        <button @click="handleSignup" :disabled="loading">
          {{ loading ? $t('auth.signingUp') : $t('auth.signupButton') }}
        </button>
        <p>{{ $t('auth.hasAccount') }}<a @click="mode = 'login'">{{ $t('auth.loginButton') }}</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import i18n from '@/i18n'

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
    alert(i18n.t('auth.loginFailed') + error.message)
  }
}

const handleSignup = async () => {
  loading.value = true
  const { error } = await authStore.signUp(email.value, password.value)
  loading.value = false
  if (!error) {
    alert(i18n.t('auth.signupSuccess'))
  } else {
    alert(i18n.t('auth.signupFailed') + error.message)
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

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  font-size: 28px;
  margin: 0;
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
