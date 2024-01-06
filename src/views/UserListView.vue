<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { twMerge } from 'tailwind-merge'
import type { User } from '@/models/user'
import UserItem from './UserItem.vue'
import axios, {AxiosResponse} from 'axios'
import type { Conversation } from '@/models/conversation'
import useUserStore from '@/store/userStore'
import useConversationStore from '@/store/conversationStore'

const selectedUsersIds = ref<Array<string>>([])
const userList = ref<User[]>([])

const emit = defineEmits(['createConv', 'existingConv'])

const userStore = useUserStore()
const conversationStore = useConversationStore()

onMounted(async () => {
    await axios
        .get(`http://localhost:${import.meta.env.VITE_PORT}/users/all`)
        .then((response : AxiosResponse) => {
            const result = response.data.users
            if (result) {
                userList.value = result.filter((user) => user._id != userStore.getConnectedUser()?._id)
            }
          })
    }
)

function isUserSelected(userId: string): boolean {
  return selectedUsersIds.value.findIndex((id) => id === userId) !== -1
}

function createdConversation(conversation: Conversation): void {
  emit('existingConv', conversation)
}

function selectUser(userId: string): void {
  const index = selectedUsersIds.value.findIndex((id) => id === userId)
  if (index !== -1) {
    selectedUsersIds.value.splice(index, 1)
  } else {
    selectedUsersIds.value.push(userId)
  }
}

const createConversation = async () => {
  const existingConversation = getExistingConversationByUsers()

  if (existingConversation) {
    createdConversation(existingConversation)
  } else {
    await axios
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
        conversationStore.addConversation(response.data.conversation)
      })
      .catch((error) => {
        return error
      })
  }
}

function getExistingConversationByUsers() : Conversation | undefined {
    const userId = userStore.getConnectedUser()?._id

    let selectedIds: string[] = selectedUsersIds.value.map(String)
    if (userId) {
        selectedIds.push(userId)
    }
    selectedIds = selectedIds.sort()

    return conversationStore.getConversations().find((conversation: Conversation) => {
        if (conversation.participants.length === selectedIds.length) {
            const participants: string[] = conversation.participants.map((conv) => conv._id)
            for (let i = 0; i < participants.length; i++) {
                if (participants[i] !== selectedIds[i]) {
                    return false
                }
            }
            return true
        }
        return false
    })
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
