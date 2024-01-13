import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message } from '@/models/message'

const useMessageStore = defineStore('messageStore', () => {
  const messsageList = ref<Message[]>([])
  const showReaction = ref<boolean>(false)

  function setMessages(messages: Message[]): void {
    messsageList.value = messages
  }

  function addMessage(message: Message): void {
    messsageList.value.push(message)
  }

  function editMessage(id: string, newMessage: Message): void{
    const index : number= messsageList.value.findIndex((message) => message._id === id)
    if (index !== -1){
      messsageList.value[index] = newMessage
    }
  }

  function getMessages(): Message[] {
    return messsageList.value
  }

  function getMessageById(id: string): Message | null {
    const message: Message[] = messsageList.value.filter((message: Message) => message._id === id)
    return message[0] ?? null
  }

  function showReactionBar(): boolean {
    return showReaction.value
  }

  return {
    setMessages,
    addMessage,
    editMessage,
    getMessages,
    getMessageById,
    showReactionBar,
    showReaction
  }
})

export default useMessageStore
