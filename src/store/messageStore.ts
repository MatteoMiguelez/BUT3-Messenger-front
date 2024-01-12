import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message } from '@/models/message'

const useMessageStore = defineStore('messageStore', () => {
  const messsageList = ref<Message[]>([])

  function setMessages(messages: Message[]): void {
    messsageList.value = messages
  }

  function addMessage(message: Message): void {
    messsageList.value.push(message)
  }

  function getMessages(): Message[] {
    return messsageList.value
  }

  function getUserIdByMessageId(id: string): Message | null {
    const message: Message[] = messsageList.value.filter((message: Message) => message._id === id)
    return message[0] ?? null
  }

  return {
    setMessages,
    addMessage,
    getMessages,
    getUserIdByMessageId
  }
})

export default useMessageStore
