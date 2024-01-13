<script setup lang="ts">
import type { User } from '@/models/user'
import useUserStore from '@/store/userStore'

const props = defineProps<{
  user: User
  selected: boolean
}>()

const emit = defineEmits(['select'])
const userStore = useUserStore()
function isConnected() {
  return userStore.isConnected(props.user._id);
}
function selectUser(userId: string) {
  emit('select', userId)
}
</script>

<template>
  <div
    class="w-72 bg-white rounded-lg cursor-pointer border-4"
    :class="{
      'border-red-400': props.selected
    }"
    @click="selectUser(props.user._id)"
  >
    <div class="flex flex-col items-center py-4 px-4">
      <div class="relative">
        <img
          class="w-24 h-24 mb-3 rounded-full shadow-lg"
          :src="'https://source.unsplash.com/' + user.profilePicId + '/100x100'"
          alt="Bonnie image"
        />
        <span
          class="top-0 left-16 absolute w-6 h-6 border-2 border-white rounded-full"
          :class="{ 'bg-red-500': !isConnected, 'bg-green-500': isConnected }"
        ></span>
      </div>
      <span class="text-lg text-center">{{ user.username }}</span>
    </div>
  </div>
</template>
