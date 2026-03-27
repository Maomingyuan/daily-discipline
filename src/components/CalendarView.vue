<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="prevMonth">←</button>
      <span>{{ currentMonth }}</span>
      <button @click="nextMonth">→</button>
    </div>
    <div class="calendar-grid">
      <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
      <div 
        v-for="day in calendarDays" 
        :key="day.date"
        class="calendar-day"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': day.date === selectedDate,
          'has-checkin': day.checkin,
          'status-yes': day.checkin?.status === 'yes',
          'status-no': day.checkin?.status === 'no'
        }"
        @click="selectDate(day.date)"
      >
        {{ day.day }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

const props = defineProps({
  checkins: {
    type: Array,
    default: () => []
  },
  selectedDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select-date'])

const currentDate = ref(new Date())

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const currentMonth = computed(() => {
  return format(currentDate.value, 'yyyy年MM月')
})

const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentDate.value))
  const end = endOfWeek(endOfMonth(currentDate.value))
  const days = eachDayOfInterval({ start, end })
  
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const checkin = props.checkins.find(c => c.date === dateStr)
    
    return {
      date: dateStr,
      day: format(day, 'd'),
      isCurrentMonth: isSameMonth(day, currentDate.value),
      isToday: isToday(day),
      checkin
    }
  })
})

const prevMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1)
}

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1)
}

const selectDate = (date) => {
  emit('select-date', date)
}
</script>

<style scoped>
.calendar {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-header button {
  padding: 8px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.calendar-header span {
  font-weight: 600;
  font-size: 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.weekday {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day.other-month {
  color: #d1d5db;
}

.calendar-day.today {
  border: 2px solid #2563eb;
  font-weight: 600;
}

.calendar-day.selected {
  background: #dbeafe;
  border: 2px solid #3b82f6;
  font-weight: 600;
}

.calendar-day.has-checkin {
  font-weight: 600;
}

.calendar-day.status-yes {
  background: #f0fdf4;
  color: #16a34a;
}

.calendar-day.status-no {
  background: #fef2f2;
  color: #dc2626;
}

.calendar-day:hover {
  background: #f9fafb;
}
</style>
