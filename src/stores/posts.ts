import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Post {
  id: number
  title: string
  content: string
  author: string
  timeAgo: string
  votes: number
  commentCount: number
}

export const usePostStore = defineStore('posts', () => {
  const posts = ref&lt;Post[]&gt;([])
  const loading = ref(false)

  const addPost = (post: Omit&lt;Post, 'id' | 'timeAgo' | 'votes' | 'commentCount'&gt;) => {
    const newPost: Post = {
      ...post,
      id: Date.now(),
      timeAgo: 'just now',
      votes: 0,
      commentCount: 0
    }
    posts.value.unshift(newPost)
  }

  const upvotePost = (postId: number) => {
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.votes++
    }
  }

  const downvotePost = (postId: number) => {
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.votes--
    }
  }

  return {
    posts,
    loading,
    addPost,
    upvotePost,
    downvotePost
  }
})
