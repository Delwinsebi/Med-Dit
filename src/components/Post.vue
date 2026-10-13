<script setup lang="ts">
export interface PostProps {
  id: number
  title: string
  content: string
  author: string
  timeAgo?: string
  upvotes: number
  commentCount?: number
}

defineProps<{
  post: PostProps
}>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-start space-x-4">
      <div class="flex flex-col items-center">
        <button class="text-gray-400 hover:text-orange-500">▲</button>
        <span class="font-semibold">{{ post.upvotes }}</span>
        <button class="text-gray-400 hover:text-blue-500">▼</button>
      </div>
      <div class="flex-1">
        <h2 class="text-xl font-semibold">{{ post.title }}</h2>
        <p class="text-gray-600 mt-1 whitespace-pre-line">{{ post.content }}</p>
        <div class="text-sm text-gray-500 mt-2">
          Posted by u/{{ post.author }}
          <span v-if="post.timeAgo"> • {{ post.timeAgo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>