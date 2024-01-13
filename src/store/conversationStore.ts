import type { Conversation } from '@/models/conversation'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import router from '@/router'
import type { Message } from '@/models/message'

const useConversationStore = defineStore('conversationStore', () => {
  const conversationList = ref<Conversation[]>([])
  const showConversation = ref<boolean>(false)
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

  async function deleteConversationById(id: string): Promise<void> {
    if (localStorage.getItem('token')) {
      await axios
        .delete(`http://localhost:${import.meta.env.VITE_PORT}/conversations/` + id, {
          headers: {
            Authorization: localStorage.getItem('token')
          }
        })
        .then((response) => {
          deleteConversation(response.data.conversation._id)
          showConversation.value = false
        })
        .catch((error) => {
          return error
        })
    } else {
      await router.push('/login')
    }
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
    if(conversationExist(conversation._id)) return
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

  function addMessageToConversation(message: Message): void {
    if(messageExistInConversation(message.conversationId, message._id)) return
    getSelectedConversation().messages.push(message)
  }
  function deleteMessageInConv( msgId: string): void {
    const conversation = getSelectedConversation()
    const message: Message | undefined = conversation.messages.find((message : Message) : boolean => {
      return message._id === msgId
    })
    if(message) {
      message.deleted = true
    }
  }
  function editMessage (msgId: string, editedMessage: Message): void {
    const conversation = getSelectedConversation()
    const message: Message | undefined = conversation.messages.find((message : Message) : boolean => {
      return message._id === msgId
    })
    if(message) {
      message.content = editedMessage.content
    }
  }

  function messageExistInConversation(convId: string, msgId: string): boolean {
    const conversation = getSelectedConversation()
    if (conversation) {
      const index : number = conversation.messages.findIndex((message : Message) : boolean => {
        return message._id === msgId
      })
      if (index !== -1) {
        return true
      }
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
    openConversation,
    deleteConversationById,
    addMessageToConversation,
    deleteMessageInConv,
    editMessage
  }
})

export default useConversationStore
