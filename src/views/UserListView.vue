<script setup lang="ts">
import { ref } from 'vue'
import { twMerge } from 'tailwind-merge'
import type { User } from '@/models/user'

const selectedUsersIds = ref<Array<string>>([])
const userList = ref<User[]>([])

const emit = defineEmits(['createConv'])

function isUserSelected(userId: string) {
  return selectedUsersIds.value.findIndex((id) => id === userId) !== -1
}

function createConversation() {
  emit('createConv', selectedUsersIds.value)
}

function selectUser(userId: string) {
  const index = selectedUsersIds.value.findIndex((id) => id === userId)
  if (index !== -1) {
    selectedUsersIds.value.splice(index, 1)
  } else {
    selectedUsersIds.value.push(userId)
  }
  console.log(selectedUsersIds.value)
}
</script>
<template>
  <h2 class="font-bold text-3xl p-2">Users</h2>
  <button
    :disabled="!selectedUsersIds.length"
    @click="createConversation"
    :class="
      twMerge(
        'py-2 px-4 my-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded',
        !selectedUsersIds.length && 'bg-blue-400 cursor-not-allowed hover:bg-blue-400'
      )
    "
  >
    Create conversation
  </button>
  <div class="flex flew-row flex-wrap gap-2">
    <!-- liste des utilisateurs -->
    <UserItem
      v-for="user in userList"
      :key="user._id"
      :selected="isUserSelected(user._id)"
      :user="user"
      @select="selectUser($event)"
    >
    </UserItem>
  </div>
</template>
