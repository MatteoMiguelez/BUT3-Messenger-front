<script setup lang="ts">
import type { Conversation } from '@/models/conversation'
import useConversationStore from '@/store/conversationStore'
import Card from 'primevue/card'
import useUserStore from '@/store/userStore'
import { computed } from 'vue'

const props = defineProps<{
  conversation: Conversation
}>()

const userStore = useUserStore()
const isCurrentConversation = computed<boolean>(() => {
  return conversationStore.getSelectedConversation()
    ? conversationStore.getSelectedConversation()._id === props.conversation._id
    : false
})

const conversationStore = useConversationStore()
function openConv(conversation: Conversation) {
  conversationStore.openConversation(conversation)
  conversationStore.addSeenToConversation(
    conversation.messages[conversation.messages.length - 1]._id
  )
}

function getUsername(id: string): string | null {
  return userStore.getUserNameById(id)
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
        :class="isCurrentConversation ? 'bg-slate-100 rounded-lg' : ''"
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
          <span class="text-sm italic" v-if="conversation.messages.length > 0"
            >{{ getUsername(conversation.messages[conversation.messages.length - 1]?.from) }}:
            {{ conversation.messages[conversation.messages.length - 1]?.content }}</span
          >
        </div>
      </div>
    </template>
  </Card>
</template>
