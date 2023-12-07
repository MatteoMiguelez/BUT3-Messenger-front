<script setup lang="ts">
import type { Message } from '@/models/message'

const props = defineProps<{
  message: Message
}>()

function isCurrentUser(): boolean {
  return true
}
</script>
<template>
  <div>
    <div v-if="isCurrentUser()"></div>
    <div v-else></div>
  </div>
  {{ props.message.content }}
</template>
