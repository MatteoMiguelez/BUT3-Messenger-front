<script setup lang="ts">
import type { User } from '@/models/user'

const props = defineProps<{
  user: User
  selected: boolean
}>()

const emit = defineEmits(['select'])

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
      <img
        class="w-24 h-24 mb-3 rounded-full shadow-lg"
        :src="'https://source.unsplash.com/' + user.profilePicId + '/100x100'"
        alt="Bonnie image"
      />
      <span class="text-lg text-center">{{ user.username }}</span>
    </div>
  </div>
</template>
