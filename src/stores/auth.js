import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false
  }),
  
  actions: {
    async init() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session?.user ?? null
      
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session
        this.user = session?.user ?? null
      })
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://dailycheck-in.xyz/'
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
