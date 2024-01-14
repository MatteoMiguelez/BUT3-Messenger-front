<script setup lang="ts">
import { onMounted } from 'vue'
import type { Conversation } from '@/models/conversation'
import ConversationView from './ConversationView.vue'
import ConversationItemView from './ConversationItemView.vue'
import UserListView from './UserListView.vue'
import useUserStore from '@/store/userStore'
import useConversationStore from '@/store/conversationStore'
import router from '@/router'
import useSocketStore from '@/store/socketStore'
import type { Message } from '@/models/message'

const userStore = useUserStore()
const socketStore = useSocketStore()
const conversationStore = useConversationStore()

onMounted(async () => {
  await handleConnectedUser()
  await conversationStore.fetchConversations()
  socketStore.watchNewConversation(handleNewConversationSocket)
  socketStore.watchConversationDeleted(handleConversationDeletedSocket)
  socketStore.watchNewMessage(handleNewMessageSocket)
  socketStore.watchMessageDeleted(handleMessageDeleted)
  socketStore.watchMessageEdited(handleMessageEdited)
  socketStore.watchNewReact(handleNewReact)
})



function handleNewMessageSocket(convId: string, message: Message) {
  conversationStore.addMessageToConversation(convId,message)
}

function handleNewReact(conversationId: string, message: Message) {
  conversationStore.addReactionToMessage(conversationId, message)
}
function handleMessageDeleted(messId: string, message: Message) {
  conversationStore.deleteMessageInConv(messId)
}
function handleMessageEdited(messId: string, message: Message) {
  conversationStore.editMessage(messId, message)
}

function getSelectedConversation(): Conversation {
  return conversationStore.getSelectedConversation()
}

function handleConversationDeletedSocket(convId: string) {
  conversationStore.deleteConversation(convId)
}
function handleNewConversationSocket(convId: string, conversation: Conversation) {
  conversationStore.addConversation(conversation)
}

function showConversationView(): boolean {
  return conversationStore.showConversation
}
async function handleConnectedUser() {
  if (!userStore.getConnectedUser()) {
    const user = localStorage.getItem('user')
    if (user) {
      userStore.setConnectedUser(JSON.parse(user))
    } else {
      await router.push({ path: '/login' })
    }
  }
}
</script>

<template>
  <main class="h-screen">
    <div class="flex flex-row h-screen">
      <div class="flex-col w-1/3 max-w-[500px]">
        <div class="bg-white p-4 shadow-md rounded-lg">
          <div class="flex items-center">
            <img
              :src="`https://source.unsplash.com/${ userStore.getConnectedUser()?._id }/100x100`"
              alt="User Image"
              class="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h2 class="text-2xl font-bold">{{ userStore.getConnectedUser()?.username }}</h2>
              <span class="text-green-500">Online</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <h1 class="pt-4 pb-2 text-xl font-bold">Conversations</h1>
          <ConversationItemView
            v-for="conversation in conversationStore.getConversations()"
            :key="conversation._id"
            :conversation="conversation"
          ></ConversationItemView>
        </div>
      </div>

      <div class="w-2/3 h-full px-4">
        <UserListView v-if="!showConversationView()"></UserListView>
        <ConversationView v-else></ConversationView>
      </div>
    </div>
  </main>
</template>
