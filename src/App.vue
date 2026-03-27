<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import { RouterView } from 'vue-router'

// 1. Define the Interface for your data
interface PostData {
  id: number;
  title: string;
  content: string;
  author: string;
  timeAgo: string;
  upvotes: number;
  commentCount: number;
}

// 2. Reactive State
const posts = ref<PostData[]>([
  {
    id: 1,
    title: 'Welcome to Med-Dit!',
    content: 'This is our first post. Feel free to explore and contribute!',
    author: 'admin',
    timeAgo: '1 hour ago',
    upvotes: 42,
    commentCount: 5
  }
]); // This replaces your hardcoded array
const showCreatePost = ref(false)
const newPost = ref({
  title: '',
  content: '',
  author: 'current_user'
})

// 3. Fetch Data from Supabase
async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('id', { ascending: false }); // Show newest first
  
  if (error) {
    console.error("Supabase Error:", error);
    return;
  }
  posts.value = data || [];
}

// 4. Submit to Supabase
const submitPost = async () => {
  if (newPost.value.title && newPost.value.content) {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { 
          title: newPost.value.title, 
          content: newPost.value.content,
          author: newPost.value.author,
          upvotes: 0,
          commentCount: 0
        }
      ])
      .select();

    if (!error && data) {
      posts.value.unshift(data[0]); // Add the new post to the top of the list
      newPost.value.title = '';
      newPost.value.content = '';
      showCreatePost.value = false;
    }
  }
}

onMounted(() => {
  getPosts()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm p-4 flex justify-center space-x-4">
      <router-link to="/" class="text-primary-500 font-bold">Home</router-link>
      <span class="text-gray-300">|</span>
      <router-link to="/submit" class="hover:text-primary-500">Submit</router-link>
    </nav>

    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center text-blue-600 mb-8">Med-Dit</h1>
      
      <div class="max-w-4xl mx-auto mb-6">
        <button 
          @click="showCreatePost = true"
          class="w-full bg-blue-500 text-white rounded-lg py-3 px-4 font-medium hover:bg-blue-600 transition"
        >
          Create Post
        </button>
      </div>

      <div v-if="showCreatePost" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg w-full max-w-2xl p-6">
          <h2 class="text-2xl font-bold mb-4">Create a Post</h2>
          <div class="space-y-4">
            <input v-model="newPost.title" type="text" placeholder="Title" class="w-full p-2 border rounded">
            <textarea v-model="newPost.content" rows="5" placeholder="Content" class="w-full p-2 border rounded"></textarea>
            <div class="flex justify-end space-x-3">
              <button @click="showCreatePost = false">Cancel</button>
              <button @click="submitPost" class="bg-blue-500 text-white px-4 py-2 rounded">Post</button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto space-y-4">
        <div v-for="post in posts" :key="post.id" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-start space-x-4">
            <div class="flex flex-col items-center">
              <button class="text-gray-400">▲</button>
              <span>{{ post.upvotes }}</span>
              <button class="text-gray-400">▼</button>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-semibold">{{ post.title }}</h2>
              <p class="text-gray-600">{{ post.content }}</p>
              <div class="text-sm text-gray-500 mt-2">
                Posted by u/{{ post.author }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>