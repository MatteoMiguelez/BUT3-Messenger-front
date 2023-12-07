import type { Conversation } from '@/models/conversation'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

const useConversationStore = defineStore('conversationStore', () => {
  const state = reactive<{
    conversations: Conversation[]
  }>({
    conversations: []
  })

  function setConversations(conversations: Conversation[]): void {
    state.conversations = conversations
  }

  function getConversations(): Conversation[] {
    return state.conversations
  }

  return { setConversations, getConversations }
})

export default useConversationStore
