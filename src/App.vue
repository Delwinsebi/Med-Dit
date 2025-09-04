<script setup lang="ts">
import { ref } from 'vue'

const showCreatePost = ref(false)
const newPost = ref({
  title: '',
  content: '',
  author: 'current_user' // In a real app, this would come from authentication
})

const submitPost = () => {
  if (newPost.value.title && newPost.value.content) {
    posts.unshift({
      id: Date.now(),
      title: newPost.value.title,
      content: newPost.value.content,
      upvotes: 0,
      comments: 0,
      author: newPost.value.author,
      timeAgo: 'just now'
    })
    newPost.value.title = ''
    newPost.value.content = ''
    showCreatePost.value = false
  }
}

const posts = [
  {
    id: 1,
    title: "Sleep Schedule During Rotations",
    content: "How do you all manage sleep during clinical rotations? I'm averaging 4-5 hours and it's starting to affect my performance.",
    upvotes: 156,
    comments: 42,
    author: "tired_med_student",
    timeAgo: "2h"
  },
  {
    id: 2,
    title: "Mnemonics for Pharmacology",
    content: "Looking for creative mnemonics to remember drug classes. Anyone have some good ones for antihypertensives?",
    upvotes: 234,
    comments: 67,
    author: "pharmGeek",
    timeAgo: "5h"
  },
  {
    id: 3,
    title: "Imposter Syndrome in Clinicals",
    content: "Does anyone else feel completely lost during clinical rotations? Sometimes I feel like I don't know anything despite studying constantly.",
    upvotes: 421,
    comments: 89,
    author: "future_doc_22",
    timeAgo: "8h"
  },
  {
    id: 4,
    title: "Balancing Social Life",
    content: "Haven't seen my non-med school friends in months. How do you maintain relationships outside of medicine?",
    upvotes: 198,
    comments: 45,
    author: "medlife_balance",
    timeAgo: "12h"
  },
  {
    id: 5,
    title: "USMLE Step 1 Study Strategy",
    content: "Starting my Step 1 prep and feeling overwhelmed. What resources worked best for you?",
    upvotes: 312,
    comments: 94,
    author: "step1_warrior",
    timeAgo: "1d"
  }
]
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center text-primary-500 mb-8">Med-Dit</h1>
      
      <!-- Create Post Button -->
      <div class="max-w-4xl mx-auto mb-6">
        <button 
          @click="showCreatePost = true"
          class="w-full bg-primary-500 text-white rounded-lg py-3 px-4 font-medium hover:bg-primary-600 transition-colors duration-200"
        >
          Create Post
        </button>
      </div>

      <!-- Create Post Modal -->
      <div v-if="showCreatePost" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg w-full max-w-2xl p-6">
          <h2 class="text-2xl font-bold mb-4">Create a Post</h2>
          
          <div class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                id="title"
                v-model="newPost.title"
                type="text"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="What's on your mind?"
              >
            </div>
            
            <div>
              <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                id="content"
                v-model="newPost.content"
                rows="5"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Share your thoughts, questions, or experiences..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                @click="showCreatePost = false"
                class="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                @click="submitPost"
                class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                :disabled="!newPost.title || !newPost.content"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Post Grid -->
      <div class="max-w-4xl mx-auto space-y-4">
        <div v-for="post in posts" :key="post.id" 
             class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
          <div class="flex items-start space-x-4">
            <!-- Voting -->
            <div class="flex flex-col items-center space-y-2">
              <button class="text-gray-400 hover:text-primary-500">▲</button>
              <span class="font-medium text-gray-700">{{ post.upvotes }}</span>
              <button class="text-gray-400 hover:text-primary-500">▼</button>
            </div>
            
            <!-- Content -->
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ post.title }}</h2>
              <p class="text-gray-600 mb-3">{{ post.content }}</p>
              <div class="flex items-center text-sm text-gray-500 space-x-4">
                <span>Posted by u/{{ post.author }}</span>
                <span>{{ post.timeAgo }}</span>
                <button class="flex items-center space-x-1 hover:text-gray-700">
                  <span>💬</span>
                  <span>{{ post.comments }} comments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No scoped styles needed as we're using Tailwind classes */
</style>
