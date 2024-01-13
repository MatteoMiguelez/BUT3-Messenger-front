<script setup lang="ts">
import axios from 'axios'
import { REACTION_EMOJI_MAP } from '@/models/message'
import useConversationStore from '@/store/conversationStore'
import useMessageStore from '@/store/messageStore'

const props = defineProps<{
  id: string
}>()

const emit = defineEmits(['closeReactionsButtons'])
const conversationStore = useConversationStore()
async function addReaction(reactionName: string) {
  const messageReaction = await conversationStore.addReactionToMessage(props.id, reactionName)
  emit('closeReactionsButtons', messageReaction)
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
