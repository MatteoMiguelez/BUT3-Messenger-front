import type { User } from '@/models/user'
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

const useUserStore = defineStore('userStore', () => {
  const state = reactive<{
    connectedUser: User | null
  }>({
    connectedUser: null
  })

  const users = ref<User[]>([])
  function setConnectedUser(user: User): void {
    state.connectedUser = user
  }

  function getConnectedUser(): User | null {
    return state.connectedUser
  }

  function setUsers(userList: User[]): void {
    users.value = userList
  }

  function getUsers(): User[] {
    return users.value.filter((user) => user._id !== state.connectedUser?._id)
  }

  function addUser(user: User): void {
    if (users.value.includes(user)) return
    users.value.push(user)
  }

  function getUserNameById(id: string): string | null{
    const connectedUser: User | null = getConnectedUser();
    if (connectedUser && connectedUser._id === id){
      return connectedUser.username
    }
    const user = users.value.filter((user: User) => user._id === id)[0]
    if (user){
      return user._id
    }
    return null
  }

  return { setConnectedUser, getConnectedUser, setUsers, getUsers, addUser, getUserNameById }
})

export default useUserStore
