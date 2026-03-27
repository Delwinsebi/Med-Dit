<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Create a Post</h1>

    <form @submit.prevent="submitPost" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
        <input id="title" v-model="title" type="text" class="mt-1 block w-full rounded-md border-gray-300" required />
      </div>

      <div>
        <label for="content" class="block text-sm font-medium text-gray-700">Content</label>
        <textarea id="content" v-model="content" rows="5" class="mt-1 block w-full rounded-md border-gray-300" required />
      </div>

      <button type="submit" class="w-full px-4 py-2 bg-blue-600 text-white rounded">
        Submit Post
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '../stores/posts'

const router = useRouter()
const store = usePostStore()

const title = ref('')
const content = ref('')

const submitPost = () => {
  store.addPost({
    title: title.value.trim(),
    content: content.value.trim(),
    author: 'current_user'
  })
  router.push('/')
}
</script>