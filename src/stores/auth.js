import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
    isPro: false,
    proExpireAt: null
  }),
  
  actions: {
    async init() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session?.user ?? null
      
      // 检查Pro状态
      if (this.user) {
        await this.checkProStatus()
      }
      
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session
        this.user = session?.user ?? null
        if (this.user) {
          this.checkProStatus()
        }
      })
    },
    
    async checkProStatus() {
      // 从user_metadata获取Pro状态
      this.isPro = this.user?.user_metadata?.is_pro || false
      this.proExpireAt = this.user?.user_metadata?.pro_expire_at
      
      // 检查是否过期
      if (this.isPro && this.proExpireAt) {
        const expireDate = new Date(this.proExpireAt)
        if (expireDate < new Date()) {
          this.isPro = false
        }
      }
    },
    
    async signUp(email, password) {
      this.loading = true
      const { data, error } = await supabase.auth.signUp({ email, password })
      this.loading = false
      return { data, error }
    },
    
    async signIn(email, password) {
      this.loading = true
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      this.loading = false
      return { data, error }
    },
    
    async signInWithGoogle() {
      this.loading = true
      const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/`
        }
      })
      this.loading = false
      return { data, error }
    },
    
    async signOut() {
      await supabase.auth.signOut()
    }
  }
})
