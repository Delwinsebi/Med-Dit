import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Post {
  id: number
  title: string
  topics: string
  content: string
  author: string
  timeAgo: string
  likes: number
  commentCount: number
}

export const usePostStore = defineStore('posts', () => {
  const posts = ref<Post[]>([
    {
      id: 1,
      title: 'Welcome to Meddit',
      topics: 'community, introductions',
      content: 'First post',
      author: 'admin',
      timeAgo: 'just now',
      likes: 0,
      commentCount: 0
    }
  ])

  const addPost = (input: { title: string; topics: string; content: string; author?: string }) => {
    posts.value.unshift({
      id: Date.now(),
      title: input.title,
      topics: input.topics,
      content: input.content,
      author: input.author || 'current_user',
      timeAgo: 'just now',
      likes: 0,
      commentCount: 0
    })
  }

  return { posts, addPost }
})
