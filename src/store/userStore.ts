import type { User } from '@/models/user'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

const useUserStore = defineStore('userStore', () => {
  const state = reactive<{
    connectedUser: User | null
  }>({
    connectedUser: null
  })

  return {}
})

export default useUserStore
