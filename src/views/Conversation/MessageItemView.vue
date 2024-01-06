<script setup lang="ts">
import type { Message } from '@/models/message'
import type {User} from "@/models/user";

const props = defineProps<{
  message: Message
}>()

function isCurrentUser(): boolean {
  return props.message.from === (JSON.parse(localStorage.getItem('user')) as User)._id
}
</script>
<template>
  <div class="pt-1 pb-1">
    <div v-if="!isCurrentUser()"
         class="flex flex-col w-max items-start">
        <div class="relative flex flex-row gap-2 py-2 px-4 rounded-lg max-w-xs items-end bg-gray-200">{{ props.message.content}}</div>
    </div>
    <div v-else class="flex items-center group justify-end">
        <div class="relative flex flex-row gap-2 py-2 px-4 rounded-lg max-w-xs items-end bg-blue-500 text-white">{{props.message.content}}</div>
    </div>
  </div>
</template>
