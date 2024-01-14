<script setup lang="ts">
import type { Conversation } from '@/models/conversation'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import MessageItemVue from '@/views/Conversation/MessageItemView.vue'
import type { Message } from '@/models/message'
import useConversationStore from '@/store/conversationStore'
import useSocketStore from '@/store/socketStore'
import type { MessageBody } from '@/models/messageBody'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ScrollPanel from 'primevue/scrollpanel'
import useUserStore from '@/store/userStore'

const userStore = useUserStore()
const conversationStore = useConversationStore()
const socketStore = useSocketStore()

const messageContent = ref('')
const messageReplied = ref<Message | null>(null)

onMounted(() => {})

function closeConversation() {
  conversationStore.showConversation = false
}

async function deleteConversation() {
  await conversationStore.deleteConversationById(getConversation()._id)
}

function getConversation(): Conversation {
  return conversationStore.getSelectedConversation()
}
function getMessages(): Message[] {
  return getConversation().messages
}

function replyToMessage(message: Message): void {
  messageReplied.value = message
  conversationStore.editMessage(message._id, message)
}

function sendMessage() {
  let corps: MessageBody = {
    messageContent: messageContent.value
  }
  if (messageReplied.value) {
    corps.messageReplyId = messageReplied.value?._id
  }
  axios
    .post(
      `http://localhost:${import.meta.env.VITE_PORT}/conversations/` + getConversation()._id,
      corps,
      {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      }
    )
    .then((response) => {
      const createdMessage: Message = response.data.message
      if (createdMessage) {
        conversationStore.addMessageToConversation(
          conversationStore.getSelectedConversation()._id,
          createdMessage
        )
      }
      conversationStore.addSeenToConversation(createdMessage._id)
      messageContent.value = ''
      messageReplied.value = null
    })
    .catch((error) => console.log(error))
}

function deleteReply(): void {
  messageReplied.value = null
}

function getMessageSeenList(messageId: string): string[] {
  const userIds: string[] = conversationStore
    .getSeenListByMessageId(messageId)
    .filter((userId) => userId !== userStore.getConnectedUser()?._id)
  const profilPics = []
  userIds.forEach((userId) => {
    profilPics.push(userStore.getUserProfilPicIdById(userId))
  })
  return profilPics
}
</script>
<template>
  <div class="relative flex flex-col h-full p-4">
    <h2 class="text-3xl">{{ getConversation().title }}</h2>
    <p>{{ getConversation().participants.length }} participants</p>
    <div>
      <button
        @click="deleteConversation"
        class="absolute w-9 h-9 top-2 right-14 bg-red-600 hover:bg-red-700 p-2 rounded-full flex justify-center items-center"
      >
        <FontAwesomeIcon :icon="['fas', 'trash']" />
      </button>
      <button
        @click="closeConversation"
        class="absolute w-9 h-9 top-2 right-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-full flex justify-center items-center"
      >
        <FontAwesomeIcon :icon="['fas', 'xmark']" />
      </button>
    </div>
    <div class="pt-5"></div>
    <ScrollPanel style="height: 75%">
      <MessageItemVue
        v-for="message in getMessages()"
        :key="message._id"
        :message="message"
        :seenList="getMessageSeenList(message._id)"
        @replyToMessage="replyToMessage($event)"
      ></MessageItemVue>
    </ScrollPanel>
    <div class="bg-white p-4 shadow-md rounded-lg flex bottom-0 mt-5 fixed" style="width: 64%">
      <div class="flex flex-col w-full">
        <div v-if="messageReplied">
          <span style="background: deepskyblue">Replying to: {{ messageReplied.content }}</span>
          <button @click="deleteReply">
            <FontAwesomeIcon :icon="['fas', 'circle-xmark']" />
          </button>
        </div>
        <div class="flex">
          <input
            type="text"
            class="flex-1 border rounded-full py-2 px-4 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Type a message..."
            v-model="messageContent"
            @keyup.enter="sendMessage"
          />
          <button
            class="w-[75px] ml-2 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full"
            @click="sendMessage"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
