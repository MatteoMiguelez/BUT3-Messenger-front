<script setup lang="ts">
import axios, {AxiosResponse} from 'axios'
import { onMounted, ref } from 'vue'
import type { Conversation } from '@/models/conversation'
import ConversationView from './ConversationView.vue'
import ConversationItemView from './ConversationItemView.vue'
import UserListView from './UserListView.vue'
import useUserStore from '@/store/userStore'
import useConversationStore from '@/store/conversationStore'
import router from '@/router'

//const router = useRouter()

//const socketStore = useSocketStore()

const userStore = useUserStore()
const conversationStore = useConversationStore()

const selectedConversation = ref()
const showConversation = ref(false)

onMounted(async () => {
  //socketStore.watchNewUser((user: User) => console.log('NEW USER', user))

    if (!userStore.getConnectedUser()) {
    const user = localStorage.getItem('user')
    if (user) {
      userStore.setConnectedUser(JSON.parse(user))
    } else {
      await router.push({ path: '/login' })
    }
  }
  await axios
    .get(`http://localhost:${import.meta.env.VITE_PORT}/conversations`, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    .then((response : AxiosResponse) => {
      conversationStore.setConversations(response.data.conversations)
    })
})

function addConversationToList(conversation: Conversation) {
  openConversation(conversation)
}

function openConversation(conversation: Conversation) {
  showConversation.value = true
  selectedConversation.value = conversation
}

function changeView() {
  showConversation.value = false
}

async function deleteConversation(conversation: Conversation) {
  if (localStorage.getItem('token')) {
    await axios
      .delete(`http://localhost:${import.meta.env.VITE_PORT}/conversations/` + conversation._id, {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      })
      .then((response) => {
        conversationStore.deleteConversation(response.data.conversation._id)
        showConversation.value = false
        selectedConversation.value = null
      })
      .catch((error) => {
        return error
      })
  } else {
      await router.push('/login')
  }
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
              <h2 class="text-2xl font-bold">{{ userStore.getConnectedUser()?.username }}</h2>
              <span class="text-green-500">Online</span>
            </div>
          </div>
        </div>
        <ConversationItemView
          v-for="conversation in conversationStore.getConversations()"
          :key="conversation._id"
          :conversation="conversation"
          @openConv="openConversation($event)"
        ></ConversationItemView>
      </div>
      <div class="w-2/3 h-full px-4">
        <UserListView
          v-if="!showConversation"
          @createConv="addConversationToList"
          @existingConv="openConversation"
        ></UserListView>
        <ConversationView
          v-else
          :conversation="selectedConversation"
          @changeView="changeView"
          @deleteConv="deleteConversation"
        ></ConversationView>
      </div>
    </div>
  </main>
</template>
