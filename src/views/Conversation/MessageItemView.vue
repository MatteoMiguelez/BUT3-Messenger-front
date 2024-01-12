<script setup lang="ts">
import type { Message } from '@/models/message'
import type { User } from '@/models/user'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import useMessageStore from '@/store/messageStore'
import useUserStore from '@/store/userStore'

const messageStore = useMessageStore()
const userStore = useUserStore()

const emit = defineEmits(['replyToMessage'])

const props = defineProps<{
  message: Message
}>()

const message = ref<Message>(props.message)
const edition = ref<boolean>(false)
const editedMessageContent = ref<string>('')
const usernameOfRespondedMessage = ref<string>('')
const repliedMessageContent = ref<string>('')
const usernameReplyTo = ref<string>('')

onMounted(() => {
  message.value = props.message
  if (props.message.replyTo) {
    const repliedMessage = messageStore.getUserIdByMessageId(props.message.replyTo)
    if (repliedMessage) {
      const username = userStore.getUserNameById(repliedMessage.from)
      repliedMessageContent.value = repliedMessage.content
      if (username) {
        usernameOfRespondedMessage.value = username
      }
    }
    const username = userStore.getUserNameById(props.message.from)
    if (username) {
      usernameReplyTo.value = username
    }
  }
})

function isCurrentUser(): boolean {
  return props.message.from === (JSON.parse(localStorage.getItem('user')) as User)._id
}

function reply(): void {
  emit('replyToMessage', message.value)
}

async function deleteMessage() {
  await axios
    .delete(`http://localhost:${import.meta.env.VITE_PORT}/messages/` + props.message._id, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    .then((response) => {
      message.value = response.data.message
    })
    .catch((error) => console.log(error))
}

async function editMessage() {
  if (message.value.content === editedMessageContent.value) {
    edition.value = false
  } else {
    await axios
      .put(
        `http://localhost:${import.meta.env.VITE_PORT}/messages/` + props.message._id,
        {
          newMessageContent: editedMessageContent.value
        },
        {
          headers: {
            Authorization: localStorage.getItem('token')
          }
        }
      )
      .then((response) => {
        edition.value = false
        message.value = response.data.message
      })
      .catch((error) => console.log(error))
  }
}

function closeEdition() {
  edition.value = false
}
</script>
<template>
  <div class="pt-1 pb-1">
    <div v-if="!isCurrentUser()" class="flex flex-col w-max items-start">
      <div class="relative flex flex-row gap-2 py-2 px-4 rounded-lg max-w-xs items-end bg-gray-200">
        <p v-if="!message.deleted">{{ message.content }}</p>
        <p v-else class="italic">Message supprimé</p>
      </div>
      <button @click="reply">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
          <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path
            d="M205 34.8c11.5 5.1 19 16.6 19 29.2v64H336c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96H224v64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z"
          />
        </svg>
      </button>
    </div>
    <div v-else class="flex items-center group justify-end">
      <div v-if="message.replyTo">
        {{ usernameOfRespondedMessage }} a répondu à {{ usernameReplyTo }} :
        {{ repliedMessageContent }}
      </div>
      <div v-if="message.edited && !message.deleted">Edited</div>
      <div v-if="!edition">
        <div v-if="!message.deleted">
          <button @click="deleteMessage">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
              <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
              <path
                d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
              />
            </svg>
          </button>
          <button @click="edition = true">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
              <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
              <path
                d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"
              />
            </svg>
          </button>
          <button @click="reply">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
              <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
              <path
                d="M205 34.8c11.5 5.1 19 16.6 19 29.2v64H336c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96H224v64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z"
              />
            </svg>
          </button>
        </div>
        <div
          class="relative flex flex-row gap-2 py-2 px-4 rounded-lg max-w-xs items-end bg-blue-500 text-white"
        >
          <p v-if="!message.deleted">{{ message.content }}</p>
          <p v-else class="italic">Message supprimé</p>
        </div>
      </div>
      <div
        v-else
        class="relative flex flex-row gap-2 py-2 px-4 rounded-lg max-w-xs items-end bg-blue-500 text-white"
      >
        <input
          v-model="editedMessageContent"
          type="text"
          placeholder="Type a message..."
          style="color: black"
          @keyup.enter="editMessage"
        />
        <button @click="editMessage">
          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path
              d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
            />
          </svg>
        </button>
        <button @click="closeEdition">
          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512">
            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path
              d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
