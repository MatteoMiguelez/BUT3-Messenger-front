<script setup lang="ts">
import type { Message } from '@/models/message'
import type { User } from '@/models/user'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import useMessageStore from '@/store/messageStore'
import useUserStore from '@/store/userStore'
import MessageReaction from '@/components/message/MessageReactionButtons.vue'
import { REACTION_EMOJI_MAP } from '@/models/message'
import type { Reaction } from '@/models/reaction'

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

onMounted(() => {
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

  /* Existing reaction */
  for (const reactionName of Object.values(props.message.reactions)) {
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
})

function isCurrentUser(): boolean {
  return props.message.from === (JSON.parse(localStorage.getItem('user')) as User)._id
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

function closeEdition() {
  edition.value = false
}
</script>
<template>
  <div class="pt-1 pb-1">
    <div v-if="!isCurrentUser()" class="flex flex-col w-max items-start">
      <div class="relative flex flex-row gap-2 py-2 px-4 rounded-lg max-w-xs items-end bg-gray-200">
        <p v-if="!messageItem.deleted">{{ messageItem.content }}</p>
        <p v-else class="italic">Message supprimé</p>
      </div>
      <div class="flex">
        <MessageReaction :id="messageItem._id"></MessageReaction>

        <button @click="reply">
          <FontAwesomeIcon :icon="['fas', 'reply']" />
        </button>
      </div>
    </div>
    <div v-else class="flex items-center group justify-end">
      <div v-if="messageItem.replyTo">
        {{ usernameOfRespondedMessage }} a répondu à {{ usernameReplyTo }} :
        {{ repliedMessageContent }}
      </div>
      <div v-if="messageItem.edited && !messageItem.deleted">Edited</div>
      <div v-if="!edition">
        <div v-if="!messageItem.deleted">
          <button @click="deleteMessage">
            <FontAwesomeIcon :icon="['fas', 'trash']" />
          </button>
          <button @click="edition = true">
            <FontAwesomeIcon :icon="['fas', 'pen']" />
          </button>
          <button @click="reply">
            <FontAwesomeIcon :icon="['fas', 'reply']" />
          </button>
          <MessageReaction :id="messageItem._id"></MessageReaction>
        </div>
        <div
          class="relative flex flex-row gap-2 py-2 px-4 rounded-lg max-w-xs items-end bg-blue-500 text-white"
        >
          <p v-if="!messageItem.deleted">{{ messageItem.content }}</p>
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
          <FontAwesomeIcon :icon="['fas', 'check']" style="color: black" />
        </button>
        <button @click="closeEdition">
          <FontAwesomeIcon :icon="['fas', 'xmark']" style="color: black" />
        </button>
      </div>
    </div>
    <div>
      <ul>
        <li v-for="reaction in reactions" v-bind:key="reaction.name">
          <div>
            <span v-if="reaction.number > 1">{{ reaction.number }}</span>
            {{ reaction.emoji }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
