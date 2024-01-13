import type { User } from '@/models/user'
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import axios from 'axios'

const useUserStore = defineStore('userStore', () => {
  const state = reactive<{
    connectedUser: User | null
  }>({
    connectedUser: null
  })

  const users = ref<User[]>([])
  const connectedUsers = ref<User[]>([])


  function getConnectedUsers(): User[] {
    return connectedUsers.value
  }
function getUsers(): User[] {
    return users.value
  }

  async function fetchUsers(): Promise<void> {
    await axios
      .get(`http://localhost:${import.meta.env.VITE_PORT}/users/all`)
      .then((response: any) => {
        const result = response.data.users
        if (result) {
          users.value = result.filter((user: User) => user._id != getConnectedUser()?._id)
        }
      })
  }

  async function fetchConnectedUsers(): Promise<void> {
    await axios
      .get(`http://localhost:${import.meta.env.VITE_PORT}/users/online`)
      .then((response: any) => {
        const result = response.data.users
        if (result) {
          connectedUsers.value = result
        }
      })
  }
  function isConnected(userId: string): boolean {
    return connectedUsers.value.some((user: User) => user._id === userId)
  }
  function setConnectedUser(user: User): void {
    state.connectedUser = user
  }

  function setConnectedUsers(users: User[]): void {
    connectedUsers.value = users
  }

  function addConnectedUser(user: User): void {
    connectedUsers.value.push(user)
  }
  function getConnectedUser(): User | null {
    return state.connectedUser
  }

  return { setConnectedUser, getConnectedUser, fetchUsers, getUsers, getConnectedUsers, setConnectedUsers, addConnectedUser, isConnected, fetchConnectedUsers }
})

export default useUserStore
