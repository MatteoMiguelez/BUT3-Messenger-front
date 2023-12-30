import type { Conversation } from '@/models/conversation'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const useConversationStore = defineStore('conversationStore', () => {
  const conversationList = ref<Conversation[]>([])

  function setConversations(conversations: Conversation[]): void {
    conversationList.value = conversations
  }

  function addConversation(conversation: Conversation): void {
    conversationList.value.push(conversation)
  }

  function deleteConversation(id: string): void {
    const index : number = conversationList.value.findIndex((conversation : Conversation) : boolean => {
      return conversation._id === id
    })
    if (index !== -1) {
      conversationList.value.splice(index, 1)
    }
  }

  function getConversations(): Conversation[] {
    return conversationList.value
  }

  return {
    setConversations,
    getConversations,
    addConversation,
    deleteConversation
  }
})

export default useConversationStore
