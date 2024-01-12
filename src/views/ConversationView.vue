<script setup lang="ts">
import type { Conversation } from '@/models/conversation'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import MessageItemVue from '@/views/Conversation/MessageItemView.vue'
import type { Message } from '@/models/message'
import useMessageStore from '@/store/messageStore'
import type { MessageBody } from '@/models/messageBody'

const props = defineProps<{
  conversation: Conversation
}>()

const emit = defineEmits(['changeView', 'deleteConv'])

const messageStore = useMessageStore()

const messageContent = ref<string>('')
const messageReplied = ref<Message | null>(null)

onMounted(() => {
  messageStore.setMessages(props.conversation.messages)
})

function closeConversation(): void {
  emit('changeView')
}

function deleteConversation(): void {
  emit('deleteConv', props.conversation)
}

function sendMessage(): void {
  let corps: MessageBody = {
    messageContent: messageContent.value
  }
  if (messageReplied.value) {
    corps.messageReplyId = messageReplied.value?._id
  }
  axios
    .post(
      `http://localhost:${import.meta.env.VITE_PORT}/conversations/` + props.conversation._id,
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
        messageStore.addMessage(createdMessage)
      }
      messageContent.value = ''
      messageReplied.value = null
    })
    .catch((error) => console.log(error))
}

function replyToMessage(message: Message): void {
  messageReplied.value = message
}

function deleteReply(): void {
  messageReplied.value = null
}
</script>
<template>
  <div class="relative flex flex-col h-full p-4">
    <h2 class="text-3xl">{{ props.conversation.title }}</h2>
    <div>
      <button
        @click="deleteConversation"
        class="absolute w-9 h-9 top-2 right-14 bg-red-600 hover:bg-red-700 p-2 rounded-full"
      >
        <FontAwesomeIcon :icon="['fas', 'trash']" />
      </button>
      <button
        @click="closeConversation"
        class="absolute w-9 h-9 top-2 right-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
      >
        <FontAwesomeIcon :icon="['fas', 'xmark']" />
      </button>
    </div>
    <div class="pt-5"></div>
    <MessageItemVue
      v-for="message in messageStore.getMessages()"
      :key="message._id"
      :message="message"
      @replyToMessage="replyToMessage($event)"
    ></MessageItemVue>

    <div class="bg-white p-4 shadow-md rounded-lg flex relative bottom-0 mt-5">
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
