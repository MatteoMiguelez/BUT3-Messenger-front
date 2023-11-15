<script setup lang="ts">
import type { Conversation } from '@/models/conversation'

const props = defineProps<{
  conversation: Conversation
}>()

const emit = defineEmits(['changeView'])

function closeConversation() {
  emit('changeView')
}
</script>
<template>
  {{ props.conversation.participants }}
  <button @click="closeConversation">X</button>
</template>
