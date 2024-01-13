<script setup lang="ts">
import type { Message } from '@/models/message'
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import useMessageStore from '@/store/messageStore'
import useUserStore from '@/store/userStore'
import MessageReaction from '@/components/message/MessageReactionButtons.vue'
import { REACTION_EMOJI_MAP } from '@/models/message'
import type { Reaction } from '@/models/reaction'
import OverlayPanel from 'primevue/overlaypanel'
import Tag from 'primevue/tag'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits(['replyToMessage'])

const messageStore = useMessageStore()
const userStore = useUserStore()

const messageItem = ref<Message>(props.message)
const edition = ref<boolean>(false)
const editedMessageContent = ref<string>('')
const usernameOfRespondedMessage = ref<string>('')
const repliedMessageContent = ref<string>('')
const usernameReplyTo = ref<string>('')
const reactions = ref<Reaction[]>([])

const op = ref()

const isCurrentUser = computed(() => {
  return messageItem.value.from === userStore.getConnectedUser()?._id
})

const toggleReactionButton = (event) => {
  op.value.toggle(event)
}

onMounted(() => {
  if (props.message.replyTo) {
    const repliedMessage = messageStore.getMessageById(props.message.replyTo)
    if (repliedMessage) {
      const username = userStore.getUserNameById(repliedMessage.from)
      repliedMessageContent.value = !repliedMessage.deleted
        ? repliedMessage.content
        : 'Message supprimé'
      if (username) {
        usernameOfRespondedMessage.value = username
      }
    }
    const username = userStore.getUserNameById(props.message.from)
    if (username) {
      usernameReplyTo.value = username
    }
  }

  setExistingReactionList()
})

function setExistingReactionList() {
  for (const reactionName of Object.values(messageItem.value.reactions)) {
    const existingReaction = reactions.value.find((reaction) => reaction.name === reactionName)

    if (existingReaction) {
      existingReaction.number++
    } else {
      const emoji = REACTION_EMOJI_MAP[reactionName] || ''
      const newReaction: Reaction = {
        name: reactionName,
        emoji,
        number: 1
      }

      reactions.value.push(newReaction)
    }
  }
}

function reply(): void {
  emit('replyToMessage', messageItem.value)
}

async function deleteMessage() {
  await axios
    .delete(`http://localhost:${import.meta.env.VITE_PORT}/messages/` + props.message._id, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })
    .then((response) => {
      messageItem.value = response.data.message
    })
    .catch((error) => console.log(error))
}

async function editMessage() {
  if (messageItem.value.content === editedMessageContent.value) {
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
        messageItem.value = response.data.message
      })
      .catch((error) => console.log(error))
  }
}

function closeEdition(): void {
  edition.value = false
}

function closeReactionsButtons(updatedMessage: Message) {
  messageItem.value = updatedMessage
  op.value.hide()
  reactions.value = []
  setExistingReactionList()
}
</script>
<template>
  <div class="pt-1 pb-1">
    <div class="flex flex-col">
      <div
        v-if="messageItem.edited && !messageItem.deleted"
        class="flex text-xs"
        :class="isCurrentUser ? 'justify-end' : ''"
      >
        Edited
      </div>
      <div
        v-if="messageItem.replyTo"
        class="flex text-xs"
        :class="isCurrentUser ? 'justify-end' : ''"
      >
        <FontAwesomeIcon :icon="['fas', 'reply']" class="pe-1 pt-1" />
        {{ usernameOfRespondedMessage }} a répondu à {{ usernameReplyTo }} :
        {{ repliedMessageContent }}
      </div>
      <div
        v-if="edition"
        class="flex flex-row gap-2 py-2 px-4 rounded-lg bg-blue-500 justify-end self-end"
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
      <div v-else class="flex" :class="isCurrentUser ? 'justify-end' : ''">
        <img
          v-if="!isCurrentUser"
          class="w-8 h-8 mb-3 rounded-full shadow-lg me-3"
          :src="
            'https://source.unsplash.com/' +
            userStore.getUserProfilPicIdById(messageItem.from) +
            '/100x100'
          "
          alt="Bonnie image"
        />
        <div
          class="relative flex flex-row gap-2 py-2 px-4 rounded-lg max-w-xs items-end"
          :class="isCurrentUser ? 'bg-blue-500 text-white order-2' : 'bg-gray-200 order-1'"
        >
          <p v-if="!messageItem.deleted">{{ messageItem.content }}</p>
          <p v-else class="italic">Message supprimé</p>
        </div>
        <div class="flex" :class="isCurrentUser ? 'order-1' : 'order-2'">
          <button v-if="isCurrentUser && !messageItem.deleted" @click="deleteMessage" class="pe-2">
            <FontAwesomeIcon :icon="['fas', 'trash']" />
          </button>
          <button v-if="isCurrentUser && !messageItem.deleted" @click="edition = true" class="pe-2">
            <FontAwesomeIcon :icon="['fas', 'pen']" />
          </button>
          <button @click="toggleReactionButton" class="pe-2">
            <FontAwesomeIcon :icon="['far', 'face-smile']" />
          </button>
          <OverlayPanel ref="op">
            <MessageReaction
              :id="messageItem._id"
              @closeReactionsButtons="closeReactionsButtons"
            ></MessageReaction>
          </OverlayPanel>
          <button @click="reply" class="pe-2">
            <FontAwesomeIcon :icon="['fas', 'reply']" />
          </button>
        </div>
      </div>
    </div>
    <div>
      <ul class="flex" :class="{ 'justify-end': isCurrentUser }">
        <li v-for="reaction in reactions" v-bind:key="reaction.name">
          <Tag value="test" class="bg-slate-300 px-2 py-1" rounded>
            <span v-if="reaction.number > 1">{{ reaction.number }}</span>
            {{ reaction.emoji }}
          </Tag>
        </li>
      </ul>
    </div>
  </div>
</template>
