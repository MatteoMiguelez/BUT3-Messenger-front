<script setup lang="ts">
import type { Conversation } from '@/models/conversation'

const props = defineProps<{
  conversation: Conversation
  showConversation: boolean
}>()
</script>
<template>
  {{ props.conversation.participants }}
  <button @click="1 === 1">X</button>
</template>
