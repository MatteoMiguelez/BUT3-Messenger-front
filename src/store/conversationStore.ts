import type { Conversation } from '@/models/conversation'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import router from '@/router'
import type { Message, Reactions } from '@/models/message'
import { REACTION_EMOJI_MAP } from '@/models/message'
import type { Reaction } from '@/models/reaction'


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

  function addReactionToMessage(convId: string, message: Message): void {
    setMessageById(convId, message)
  }

  function setMessageById(convId: string, message: Message) {
    const conversation = getConversationById(convId)
    if (conversation) {
      const messageIndex = conversation.messages.findIndex((msg: Message) => msg._id === message._id)
      if (messageIndex !== -1) {
        conversation.messages[messageIndex] = message
      }
    }
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

  function addMessageToConversation(convId: string,message: Message): void {
    if(messageExistInConversation(message.conversationId, message._id)) return
    const conversation = getConversationById(convId);
    if(conversation) {
      conversation.messages.push(message)
    }
  }

  function getConversationById(id: string): Conversation| null {
    const conversation: Conversation[] | undefined = conversationList.value.filter((conversation: Conversation) => conversation._id === id)
    if (conversation){
      return conversation[0] ?? null
    }
    return null
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

  async function addSeenToConversation(conversationId: string, messageId: string) {
    await axios
      .post(
        `http://localhost:${import.meta.env.VITE_PORT}/conversations/see/` + conversationId,
        {
          messageId: messageId
        },
        {
          headers: {
            Authorization: localStorage.getItem('token')
          }
        }
      )
      .then((response) => {
        if (response.data.conversation) {
          selectedConversation.value = response.data.conversation
        }
      })
      .catch((error) => console.log(error))
  }

  function userListOfSeenForMessage(messageId: string) {
    const matchingUserIds: string[] = []

    if (selectedConversation.value) {
      for (const userId in selectedConversation.value.seen) {
        if (selectedConversation.value.seen[userId] === messageId) {
          matchingUserIds.push(userId)
        }
      }
    }

    return matchingUserIds
  }

  function setExistingReactionList(reactions: Reactions,react: Reaction[]) {
    for (const reactionName of Object.values(reactions)) {
      const existingReaction = react.find((reaction) => reaction.name === reactionName)

      if (existingReaction) {
        existingReaction.number++
      } else {
        const emoji = REACTION_EMOJI_MAP[reactionName] || ''
        const newReaction: Reaction = {
          name: reactionName,
          emoji,
          number: 1
        }

        react.push(newReaction)
      }
    }
  }

  function getConversations(): Conversation[] {
    return conversationList.value
  }

  function getMessageById(id: string): Message | null {
    const message: Message[] | undefined = selectedConversation.value?.messages.filter((message: Message) => message._id === id)
    if (message){
      return message[0] ?? null
    }
    return null
  }

  return {
    setConversations,
    getConversations,
    addConversation,
    deleteConversation,
    fetchConversations,
    createConversation,
    showConversation,
    conversationExist,
    setSelectedConversation,
    getSelectedConversation,
    openConversation,
    deleteConversationById,
    addMessageToConversation,
    deleteMessageInConv,
    editMessage,
    getMessageById,
    addSeenToConversation,
    addReactionToMessage,
    userListOfSeenForMessage,
    setExistingReactionList
  }
})

export default useConversationStore