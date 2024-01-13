<script setup lang="ts">
import type { Conversation } from '@/models/conversation'
import Card from 'primevue/card'
import useConversationStore from '@/store/conversationStore'

const props = defineProps<{
  conversation: Conversation
}>()

const conversationStore = useConversationStore()
function openConv(conversation: Conversation) {
  conversationStore.openConversation(conversation)
}

function dateToString(date: Date) {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <Card class="p-1">
    <template #content>
      <div
        class="flex py-2 px-5 pt-5 cursor-pointer bg-white"
        @click="openConv(props.conversation)"
      >
        <img
          class="w-24 h-24 mb-3 rounded-full shadow-lg me-5"
          src="https://source.unsplash.com/0xjqx38Pc5I/100x100"
          alt="Bonnie image"
          style="width: 50px; height: 50px"
        />
        <div class="flex flex-col">
          <span class="font-semibold">{{ conversation.title }}</span>
          <span class="text-sm italic">{{ dateToString(props.conversation.lastUpdate) }}</span>
        </div>
      </div>
    </template>
  </Card>
</template>
