<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { twMerge } from 'tailwind-merge'
import type { User } from '@/models/user'
import UserItem from './UserItem.vue'
import axios from 'axios'
import type { Conversation } from '@/models/conversation'
import useUserStore from '@/store/userStore'
import useConversationStore from '@/store/conversationStore'

const selectedUsersIds = ref<Array<string>>([])
const userList = ref<User[]>([])

const emit = defineEmits(['createConv'])

const userStore = useUserStore()
const conversationStore = useConversationStore()

onMounted(async () => {
  axios.get(`http://localhost:${import.meta.env.VITE_PORT}/users/all`).then((response) => {
    userList.value = response.data.users
    userList.value = userList.value.filter((user) => user._id != userStore.getConnectedUser()?._id)
  })
})

function isUserSelected(userId: string) {
  return selectedUsersIds.value.findIndex((id) => id === userId) !== -1
}

function createdConversation(conversation: Conversation) {
  emit('createConv', conversation)
}

function selectUser(userId: string) {
  const index = selectedUsersIds.value.findIndex((id) => id === userId)
  if (index !== -1) {
    selectedUsersIds.value.splice(index, 1)
  } else {
    selectedUsersIds.value.push(userId)
  }
}

const createConversation = async () => {
  // Ne crée pas de conversation si celle-ci "existe" déjà
  const conversations = conversationStore.getConversations()

  console.log('val', conversations)
  console.log('selected', selectedUsersIds.value)

  const list = conversations.filter((conversation: Conversation) => {
    const userId = userStore.getConnectedUser()?._id
    if (userId) {
      const userInConvIds: string[] = selectedUsersIds.value
      userInConvIds.push(userId)
      console.log('userInconv', userInConvIds)

      if (conversation.participants.length === userInConvIds.length) {
        return userInConvIds.every((userId) =>
          conversation.participants.some((participant) => participant._id === userId)
        )
      }
      return false
    }
  })

  /*
  axios
    .post(
      `http://localhost:${import.meta.env.VITE_PORT}/conversations`,
      { concernedUsersIds: selectedUsersIds.value },
      {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      }
    )
    .then((response) => {
      selectedUsersIds.value = []
      createdConversation(response.data.conversation)
    })
    .catch((error) => {
      console.log('ERROR', error)
    })*/
}
</script>
<template>
  <h2 class="font-bold text-3xl p-2">Users</h2>
  <button
    :disabled="!selectedUsersIds.length"
    @click="createConversation"
    :class="
      twMerge(
        'py-2 px-4 my-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded',
        !selectedUsersIds.length && 'bg-blue-400 cursor-not-allowed hover:bg-blue-400'
      )
    "
  >
    Create conversation
  </button>
  <div class="flex flew-row flex-wrap gap-2">
    <!-- liste des utilisateurs -->
    <UserItem
      v-for="user in userList"
      :key="user._id"
      :selected="isUserSelected(user._id)"
      :user="user"
      @select="selectUser($event)"
    >
    </UserItem>
  </div>
</template>
