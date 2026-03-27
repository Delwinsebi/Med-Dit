<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-6">
      <RouterLink to="/submit" class="inline-block px-4 py-2 bg-blue-600 text-white rounded">
        Create Post
      </RouterLink>
    </div>

    <div class="space-y-4">
      <Post
        v-for="post in store.posts"
        :key="post.id"
        v-bind="post"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Post from '../components/Post.vue'
import { usePostStore } from '../stores/posts'

const store = usePostStore()
</script>