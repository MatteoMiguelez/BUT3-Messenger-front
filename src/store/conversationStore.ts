import type { Conversation } from '@/models/conversation'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const useConversationStore = defineStore('conversationStore', () => {
  const conversationList = ref<Conversation[]>([])
  let showConversation = ref<boolean>(false)
  const selectedConversation = ref<Conversation>()


  function setSelectedConversation(conversation: Conversation): void {
    selectedConversation.value = conversation
  }

  function getSelectedConversation(): Conversation {
    return <Conversation>selectedConversation.value
  }
  async function createConversation(usersId: string[]): Promise<void> {
    await axios
      .post(
        `http://localhost:${import.meta.env.VITE_PORT}/conversations`,
        { concernedUsersIds: usersId },
        {
          headers: {
            Authorization: localStorage.getItem('token')
          }
        }
      )
      .then((response) => {
        addConversation(response.data.conversation)
        openConversation(response.data.conversation)
      })
      .catch((error) => {
        return error
      })
  }
  async function fetchConversations(): Promise<void> {
    await axios
      .get(`http://localhost:${import.meta.env.VITE_PORT}/conversations`, {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      })
      .then((response: any) => {
        setConversations(response.data.conversations)
      })
  }
  function setConversations(conversations: Conversation[]): void {
    conversationList.value = conversations
  }

  function openConversation(conversation: Conversation) {
    showConversation.value = true
    setSelectedConversation(conversation)
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

  function conversationExist(id: string): boolean {
    const index : number = conversationList.value.findIndex((conversation : Conversation) : boolean => {
      return conversation._id === id
    })
    if (index !== -1) {
      return true
    }
    return false
  }

  function getConversations(): Conversation[] {
    return conversationList.value
  }

  return {
    setConversations,
    getConversations,
    addConversation,
    deleteConversation,
    fetchConversations,
    createConversation,
    conversationExist,
    setSelectedConversation,
    getSelectedConversation,
    showConversation,
    openConversation
  }
})

export default useConversationStore
