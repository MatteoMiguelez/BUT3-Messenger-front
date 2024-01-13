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

  function setUsers(userList: User[]): void {
    users.value = userList
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

  function addUser(user: User): void {
    if (users.value.includes(user)) return
    users.value.push(user)
  }

  function getUserNameById(id: string): string | null {
    const connectedUser: User | null = getConnectedUser()
    if (connectedUser && connectedUser._id === id) {
      return connectedUser.username
    }
    const user = users.value.filter((user: User) => user._id === id)[0]
    if (user) {
      return user.username
    }
    return null
  }

  function getUserProfilPicIdById(id: string): string | null {
    const user = users.value.find((user) => user._id === id)
    if (user) {
      return user.profilePicId
    }
    return null
  }

  return {
    setConnectedUser,
    getConnectedUser,
    fetchUsers,
    setUsers,
    getUsers,
    getUserNameById,
    getUserProfilPicIdById,
    getConnectedUsers,
    setConnectedUsers,
    addConnectedUser,
    addUser,
    isConnected,
    fetchConnectedUsers
  }
})

export default useUserStore
