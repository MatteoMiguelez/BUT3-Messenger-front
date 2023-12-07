<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import type { Conversation } from '@/models/conversation'
import ConversationView from './ConversationView.vue'
import ConversationItemView from './ConversationItemView.vue'
import UserListView from './UserListView.vue'
import useUserStore from '@/store/userStore'

//const router = useRouter()

//const socketStore = useSocketStore()

const userStore = useUserStore()

const conversationList = ref<Conversation[]>([])
const selectedConversation = ref()
const showConversation = ref(false)

onMounted(async () => {
  //socketStore.watchNewUser((user: User) => console.log('NEW USER', user))
  // fetch users

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

function addConversationToList(conversation: Conversation) {
  conversationList.value.push(conversation)
}

function openConversation(conversation: Conversation) {
  showConversation.value = true
  selectedConversation.value = conversation
}

function changeView() {
  showConversation.value = false
}

function deleteConversation(conversation: Conversation) {
  if (localStorage.getItem('token')) {
    axios
      .delete('http://localhost:5000/conversations/' + conversation._id, {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      })
      .then((response) => {
        conversationList.value = conversationList.value.filter(
          (conv) => conv._id !== response.data.conversation._id
        )
        showConversation.value = false
        selectedConversation.value = null
      })
      .catch((error) => console.log(error))
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
          v-for="conversation in conversationList"
          :key="conversation._id"
          :conversation="conversation"
          @openConv="openConversation($event)"
        ></ConversationItemView>
      </div>
      <div class="w-2/3 h-full px-4">
        <UserListView v-if="!showConversation" @createConv="addConversationToList"></UserListView>
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
