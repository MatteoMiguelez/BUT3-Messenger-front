<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
//import { useRouter } from 'vue-router'
import { twMerge } from 'tailwind-merge'
//import useSocketStore from '@/store/socketStore'
import type { User } from '@/models/user'
import type { Conversation } from '@/models/conversation'
import ConversationView from './ConversationView.vue'
import UserItem from './UserItem.vue'
import ConversationItemView from './ConversationItemView.vue'

//const router = useRouter()

//const socketStore = useSocketStore()

const userList = ref<User[]>([])
const conversationList = ref<Conversation[]>([])
const selectedConversation = ref()
const showConversation = ref(false)

onMounted(async () => {
  //socketStore.watchNewUser((user: User) => console.log('NEW USER', user))
  // fetch users
  axios.get('http://localhost:5000/users/all').then((response) => {
    userList.value = response.data.users
    console.log(response.data)
  })
  // fetch conversations

  axios
    .get('http://localhost:5000/conversations', {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    .then((response) => {
      conversationList.value = response.data.conversations
    })
})

const selectedUsersIds = ref<Array<string>>([])

function selectUser(userId: string) {
  const index = selectedUsersIds.value.findIndex((id) => id === userId)
  if (index !== -1) {
    selectedUsersIds.value.splice(index, 1)
  } else {
    selectedUsersIds.value.push(userId)
  }
  console.log(selectedUsersIds.value)
}

function isUserSelected(userId: string) {
  return selectedUsersIds.value.findIndex((id) => id === userId) !== -1
}

const createConversation = async () => {
  axios
    .post(
      'http://localhost:5000/conversations',
      { concernedUsersIds: selectedUsersIds.value },
      {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      }
    )
    .then((response) => {
      selectedUsersIds.value = []
      conversationList.value.push(response.data.conversation)
    })
    .catch((error) => {
      console.log('ERROR', error)
    })
}

function openConversation(conversation: Conversation) {
  showConversation.value = true
  selectedConversation.value = conversation
}
</script>

<template>
  <main class="h-screen">
    <div class="flex flex-row h-screen">
      <div class="flex-col w-1/3 max-w-[500px]">
        <div class="bg-white p-4 shadow-md rounded-lg h-[100px]">
          <div class="flex items-center">
            <img
              :src="`https://source.unsplash.com/userid/100x100`"
              alt="User Image"
              class="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h2 class="text-2xl font-bold">Nom de l'utilisateur connecté</h2>
              <span class="text-green-500">Online</span>
            </div>
          </div>
        </div>
        <ConversationItemView
          v-for="conversation in conversationList"
          :key="conversation._id"
          :conversation="conversation"
          @openConv="openConversation($event)"
        ></ConversationItemView>
      </div>
      <div class="w-2/3 h-full px-4">
        <template v-if="!selectedConversation">
          <!-- v if pas de conversation selectionnee -->
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
        <!-- vue d'une conversation -->
        <ConversationView
          v-else
          :conversation="selectedConversation"
          :show-conversation="showConversation"
        ></ConversationView>
      </div>
    </div>
  </main>
</template>
