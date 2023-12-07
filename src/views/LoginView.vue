<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="w-[600px] bg-white p-8 shadow-md rounded-lg">
      <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>
      <p v-if="errorMessage" class="text-center text-red-600">{{ errorMessage }}</p>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="username" class="block text-gray-700 font-bold mb-2">Username</label>
          <input
            type="text"
            v-model="username"
            id="username"
            name="username"
            class="w-full border rounded py-2 px-3"
            required
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 font-bold mb-2">Password</label>
          <input
            type="password"
            v-model="password"
            id="password"
            name="password"
            class="w-full border rounded py-2 px-3"
            @input="checkPasswordError"
            @blur="checkPasswordLength"
            required
          />
        </div>
        <div class="text-center">
          <button
            type="submit"
            :disabled="errorMessage || areInputInValid ? true : false"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import useSocketStore from '@/store/socketStore'
import type { User } from '@/models/user'
import useUserStore from '@/store/userStore'

const router = useRouter()

const socketStore = useSocketStore()

const userStore = useUserStore()

const username = ref('')
const password = ref('')

const areInputInValid = computed(() => {
  return !(username.value.length > 0 && password.value.length > 4 && password.value.length < 15)
})

const errorMessage = ref<string | null>(null)

function checkPasswordLength() {
  setupErrorMessage(password.value.length)
}

function checkPasswordError() {
  if (errorMessage.value) {
    setupErrorMessage(password.value.length)
  }
}

function setupErrorMessage(passwordLength: number) {
  if (passwordLength > 15 || passwordLength < 5) {
    errorMessage.value = 'The password length should be between 5 and 15'
  } else {
    errorMessage.value = null
  }
}

const submitForm = async () => {
  axios
    .post(`http://localhost:${import.meta.env.VITE_PORT}/users/login`, {
      password: password.value,
      username: username.value
    })
    .then((response) => {
      router.push({ path: '/' })
      userStore.setConnectedUser(response.data.user)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      socketStore.login(response.data.user as User)
    })
    .catch((error) => console.log(error))
}
</script>
