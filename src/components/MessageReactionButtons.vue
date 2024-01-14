<script setup lang="ts">
import axios from 'axios'
import { REACTION_EMOJI_MAP } from '@/models/message'
import useConversationStore from '@/store/conversationStore'

const props = defineProps<{
  id: string
}>()

const emit = defineEmits(['closeReactionsButtons'])

const conversationStore = useConversationStore()

async function addReaction(reactionName: string) {
  await axios
    .post(
      `http://localhost:${import.meta.env.VITE_PORT}/messages/` + props.id,
      { reaction: reactionName },
      {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      }
    )
    .then((response) => {
      if (response.data.message) {
        conversationStore.editMessage(response.data.message._id, response.data.message)
        emit('closeReactionsButtons', response.data.message)
      }
    })
    .catch((error) => console.log(error))
}
</script>
<template>
  <div class="p-3 rounded-lg bg-slate-50">
    <button @click="addReaction('HAPPY')" class="pe-2">{{ REACTION_EMOJI_MAP.HAPPY }}</button>
    <button @click="addReaction('SAD')" class="pe-2">{{ REACTION_EMOJI_MAP.SAD }}</button>
    <button @click="addReaction('LOVE')" class="pe-2">{{ REACTION_EMOJI_MAP.LOVE }}</button>
    <button @click="addReaction('THUMBSDOWN')" class="pe-2">
      {{ REACTION_EMOJI_MAP.THUMBSDOWN }}
    </button>
    <button @click="addReaction('THUMBSUP')">{{ REACTION_EMOJI_MAP.THUMBSUP }}</button>
  </div>
</template>
