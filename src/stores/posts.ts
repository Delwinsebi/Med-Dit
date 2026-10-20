import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../utils/supabase'

export interface Post {
  id: number | string
  title: string
  topic: string
  content: string
  author: string
  community: string
  timeAgo: string
  likes: number
  commentCount: number
}

export const usePostStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref('')

  function mapPost(row: Record<string, unknown>): Post {
    return {
      id: row.id as number | string,
      title: String(row.title || row.subject || ''),
      topic: String(row.topic || row.Topic || ''),
      content: String(row.content || row.Content || ''),
      author: String(row.user_name || row.author || 'current_user'),
      community: String(row.community || 'meddit'),
      timeAgo: row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : 'just now',
      likes: Number(row.likes || 0),
      commentCount: Number(row.comment_count || 0)
    }
  }


  async function fetchPosts() {
    loading.value = true
    error.value = ''
    const { data, error: fetchError } = await supabase.from('posts').select('*')
    if (fetchError) error.value = fetchError.message
    else posts.value = (data || []).map((row) => mapPost(row as Record<string, unknown>))
    loading.value = false
  }

  async function addPost(input: { topic: string; content: string; userName: string }) {
    const { error: insertError } = await supabase.from('posts').insert({
      topic: input.topic,
      content: input.content,
      user_name: input.userName
    })
    if (insertError) throw insertError
    await fetchPosts()
  }

  return { posts, loading, error, fetchPosts, addPost }
})
