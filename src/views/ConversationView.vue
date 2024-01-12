<script setup lang="ts">
import type { Conversation } from '@/models/conversation'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import MessageItemVue from '@/views/Conversation/MessageItemView.vue'
import type { Message } from '@/models/message'
import useMessageStore from '@/store/messageStore'
import type {MessageBody} from "@/models/messageBody";

const messageStore = useMessageStore()

const props = defineProps<{
  conversation: Conversation
}>()

const messageContent = ref<string>('')
const messageReplied = ref<Message | null>(null)

const emit = defineEmits(['changeView', 'deleteConv'])

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

function replyToMessage(message: Message) : void {
  messageReplied.value = message
}

function deleteReply() : void{
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
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
          <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
          />
        </svg>
      </button>
      <button
        @click="closeConversation"
        class="absolute w-9 h-9 top-2 right-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
          <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
          />
        </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
              <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
              <path
                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
              />
            </svg>
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
