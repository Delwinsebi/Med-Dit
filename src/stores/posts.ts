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

  function formatTimeAgo(value: unknown) {
    if (!value) return 'just now'
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(String(value)).getTime()) / 1000))
    if (elapsedSeconds < 60) return 'just now'
    const minutes = Math.floor(elapsedSeconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  function mapPost(row: Record<string, unknown>): Post {
    return {
      id: row.id as number | string,
      title: String(row.title || row.subject || ''),
      topic: String(row.topic || row.Topic || ''),
      content: String(row.content || row.Content || ''),
      author: String(row.user_name || row.author || 'current_user'),
      community: String(row.community || 'meddit'),
      timeAgo: formatTimeAgo(row.created_at),
      likes: Number(row.likes || 0),
      commentCount: Number(row.comment_count || 0)
    }
  }


  async function fetchPosts() {
    loading.value = true
    error.value = ''
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) error.value = fetchError.message
    else posts.value = (data || []).map((row) => mapPost(row as Record<string, unknown>))
    loading.value = false
  }

  async function fetchPostsByUserName(userName: string) {
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_name', userName)
      .order('created_at', { ascending: false })
    if (fetchError) throw fetchError
    return (data || []).map((row) => mapPost(row as Record<string, unknown>))
  }

  async function addPost(input: { topic: string; content: string; userName: string }) {
    const { error: insertError } = await supabase.from('posts').insert({
      topic: input.topic,
      content: input.content,
      user_name: input.userName,
      created_at: new Date().toISOString()
    })
    if (insertError) throw insertError
    await fetchPosts()
  }

  return { posts, loading, error, fetchPosts, fetchPostsByUserName, addPost }
})
