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
        <div class="divider">或</div>
        <button @click="handleGoogleLogin" :disabled="loading" class="google-btn">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          使用 Google 登录
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

const handleGoogleLogin = async () => {
  loading.value = true
  const { error } = await authStore.signInWithGoogle()
  loading.value = false
  if (error) {
    alert('Google 登录失败: ' + error.message)
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

.divider {
  text-align: center;
  margin: 20px 0;
  color: #9ca3af;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #e5e7eb;
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.google-btn {
  background: white;
  color: #3c4043;
  border: 1px solid #dadce0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.google-btn:hover {
  background: #f8f9fa;
}
</style>
