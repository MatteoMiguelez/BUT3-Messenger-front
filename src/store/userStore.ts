import type { User } from '@/models/user'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

const useUserStore = defineStore('userStore', () => {
  const state = reactive<{
    connectedUser: User | null
  }>({
    connectedUser: null
  })

  function setConnectedUser(user: User): void {
    state.connectedUser = user
  }

  function getConnectedUser(): User | null {
    return state.connectedUser
  }

  return { setConnectedUser, getConnectedUser }
})

export default useUserStore
