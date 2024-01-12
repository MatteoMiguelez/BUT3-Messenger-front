<script setup lang="ts">
import axios from 'axios'
import { REACTION_EMOJI_MAP } from '@/models/message'
import useMessageStore from '@/store/messageStore'

const props = defineProps<{
  id: string
}>()

const messageStore = useMessageStore()

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
        messageStore.editMessage(props.id, response.data.message)
      }
      console.log(messageStore.getMessages())
    })
    .catch((error) => console.log(error))
}
</script>
<template>
  <button @click="addReaction('HAPPY')">{{ REACTION_EMOJI_MAP.HAPPY }}</button>
  <button @click="addReaction('SAD')">{{ REACTION_EMOJI_MAP.SAD }}</button>
  <button @click="addReaction('LOVE')">{{ REACTION_EMOJI_MAP.LOVE }}</button>
  <button @click="addReaction('THUMBSDOWN')">{{ REACTION_EMOJI_MAP.THUMBSDOWN }}</button>
  <button @click="addReaction('THUMBSUP')">{{ REACTION_EMOJI_MAP.THUMBSUP }}</button>
</template>
