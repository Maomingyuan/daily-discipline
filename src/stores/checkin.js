import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { format } from 'date-fns'

export const useCheckinStore = defineStore('checkin', {
  state: () => ({
    checkins: [],
    loading: false
  }),
  
  actions: {
    async fetchCheckins() {
      this.loading = true
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .order('date', { ascending: false })
      
      if (!error) this.checkins = data || []
      this.loading = false
      return { data, error }
    },
    
    async saveCheckin(date, status, note) {
      const user = (await supabase.auth.getUser()).data.user
      const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from('checkins')
        .upsert({
          date: dateStr,
          status,
          note: note || '',
          user_id: user.id
        }, {
          onConflict: 'user_id,date'
        })
      
      if (!error) await this.fetchCheckins()
      return { data, error }
    },
    
    async deleteCheckin(id) {
      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('id', id)
      
      if (!error) await this.fetchCheckins()
      return { error }
    }
  }
})
