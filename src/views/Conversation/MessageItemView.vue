<script setup lang="ts">
import { ALL_REACTIONS, type Message } from '@/models/message'
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import useConversationStore from '@/store/conversationStore'
import useUserStore from '@/store/userStore'
import MessageReaction from '@/components/MessageReactionButtons.vue'
import { REACTION_EMOJI_MAP } from '@/models/message'
import type { Reaction } from '@/models/reaction'
import OverlayPanel from 'primevue/overlaypanel'
import Tag from 'primevue/tag'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps<{
  message: Message
  seenList: string[]
}>()

const emit = defineEmits(['replyToMessage'])

const conversationStore = useConversationStore()
const userStore = useUserStore()

const messageItem = ref<Message>(props.message)
const edition = ref<boolean>(false)
const editedMessageContent = ref<string>('')
const usernameOfRespondedMessage = ref<string>('')
const repliedMessageContent = ref<string>('')
const usernameReplyTo = ref<string>('')
const reactions = ref<Reaction[]>([])

const op = ref()
function getReactionAsEmoji(value: typeof ALL_REACTIONS): string {
  return REACTION_EMOJI_MAP[value]
}
const isCurrentUser = computed(() => {
  return messageItem.value.from === userStore.getConnectedUser()?._id
})

const toggleReactionButton = (event) => {
  op.value.toggle(event)
}

onMounted(() => {
  if (props.message.replyTo) {
    const repliedMessage = conversationStore.getMessageById(props.message.replyTo)
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
  conversationStore.setExistingReactionList(messageItem.value.reactions, reactions.value)
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
  <div class="pt-1 pb-1" :class="isCurrentUser ? 'pe-5' : ''">
    <div class="flex flex-col">
      <div
        v-if="messageItem.edited && !messageItem.deleted"
        class="flex text-xs italic text-slate-500"
        :class="isCurrentUser ? 'justify-end' : ''"
        :style="isCurrentUser ? '' : 'padding-left:45px'"
      >
        Edited
      </div>
      <div
        v-if="messageItem.replyTo"
        class="flex text-xs flex-col"
        :class="isCurrentUser ? 'justify-end items-end' : ''"
        :style="isCurrentUser ? '' : 'padding-left:45px'"
      >
        <div>
          <FontAwesomeIcon :icon="['fas', 'reply']" class="pe-1 pt-1" />
          {{ usernameOfRespondedMessage }} a répondu à {{ usernameReplyTo }}
        </div>
        <div>
          <p class="w-fit py-1 px-2 rounded-lg bg-cyan-200">
            {{ repliedMessageContent }}
          </p>
        </div>
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
          <FontAwesomeIcon :icon="['fas', 'check']" />
        </button>
        <button @click="closeEdition">
          <FontAwesomeIcon :icon="['fas', 'xmark']" />
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
        <div
          v-if="!messageItem.deleted"
          class="flex"
          :class="isCurrentUser ? 'order-1' : 'order-2'"
        >
          <button v-if="isCurrentUser" @click="deleteMessage" class="pe-2">
            <FontAwesomeIcon :icon="['fas', 'trash']" />
          </button>
          <button v-if="isCurrentUser" @click="edition = true" class="pe-2">
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
      <ul
        class="flex"
        :class="{ 'justify-end': isCurrentUser }"
        :style="isCurrentUser ? '' : 'padding-left:45px'"
      >
        <li v-for="(reaction, key) in Object.values(messageItem.reactions)" :key="key">
          <Tag value="test" class="bg-slate-300 px-2 py-1" rounded>
            <span v-if="key > 1">{{ key }}</span>
            {{ getReactionAsEmoji(reaction) }}
          </Tag>
        </li>
      </ul>
    </div>
    <div
      v-if="seenList.length > 0"
      class="pt-2"
      :style="isCurrentUser ? '' : 'padding-left:45px'"
    >
      <ul class="flex" :class="isCurrentUser ? 'justify-end' : ''">
        <li v-for="profilePic of seenList" :key="profilePic">
          <img
            class="w-6 h-6 mb-3 rounded-full shadow-lg me-3"
            :src="'https://source.unsplash.com/' + profilePic + '/100x100'"
            alt="Bonnie image"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
