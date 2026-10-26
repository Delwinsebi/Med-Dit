import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../utils/supabase'

export interface Post {
  id: string
  title: string
  topic: string
  content: string
  author: string
  community: string
  timeAgo: string
  upvotes: number
  downvotes: number
  currentVote: VoteType | null
  commentCount: number
}

export type VoteType = 'up' | 'down'

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
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
      id: String(row.id),
      title: String(row.title || row.subject || ''),
      topic: String(row.topic || row.Topic || ''),
      content: String(row.content || row.Content || ''),
      author: String(row.user_name || row.author || 'current_user'),
      community: String(row.community || 'meddit'),
      timeAgo: formatTimeAgo(row.created_at),
      upvotes: 0,
      downvotes: 0,
      currentVote: null,
      commentCount: Number(row.comment_count || 0)
    }
  }

  async function loadInteraction(post: Post, collection = posts.value) {
    const [{ data: votes, error: votesError }, { count, error: commentsError }, { data: userData }] = await Promise.all([
      supabase.from('post_votes').select('vote_type').eq('post_id', post.id),
      supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
      supabase.auth.getUser()
    ])

    if (votesError) throw votesError
    if (commentsError) throw commentsError

    const currentPost = collection.find((item) => item.id === post.id)
    if (!currentPost) return

    currentPost.upvotes = votes?.filter((vote) => vote.vote_type === 'up').length || 0
    currentPost.downvotes = votes?.filter((vote) => vote.vote_type === 'down').length || 0
    currentPost.commentCount = count || 0

    if (userData.user) {
      const { data: currentVote, error: currentVoteError } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', post.id)
        .eq('user_id', userData.user.id)
        .maybeSingle()
      if (currentVoteError) throw currentVoteError
      currentPost.currentVote = (currentVote?.vote_type as VoteType | undefined) || null
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
    else {
      posts.value = (data || []).map((row) => mapPost(row as Record<string, unknown>))
      await Promise.all(posts.value.map((post) => loadInteraction(post)))
    }
    loading.value = false
  }

  async function fetchPostsByUserName(userName: string) {
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_name', userName)
      .order('created_at', { ascending: false })
    if (fetchError) throw fetchError
    const userPosts = (data || []).map((row) => mapPost(row as Record<string, unknown>))
    await Promise.all(userPosts.map((post) => loadInteraction(post, userPosts)))
    return userPosts
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

  async function vote(postId: string, voteType: VoteType) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Sign in to vote on posts.')

    const { data: existingVote, error: lookupError } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('post_id', postId)
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (lookupError) throw lookupError

    if (existingVote?.vote_type === voteType) {
      const { error } = await supabase.from('post_votes').delete().eq('post_id', postId).eq('user_id', userData.user.id)
      if (error) throw error
    } else if (existingVote) {
      const { error } = await supabase
        .from('post_votes')
        .update({ vote_type: voteType })
        .eq('post_id', postId)
        .eq('user_id', userData.user.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('post_votes').insert({ post_id: postId, user_id: userData.user.id, vote_type: voteType })
      if (error) throw error
    }

    const post = posts.value.find((item) => item.id === postId)
    if (post) await loadInteraction(post)
  }

  async function fetchComments(postId: string) {
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select('id, post_id, user_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
    if (fetchError) throw fetchError
    return (data || []).map((comment) => ({
      id: String(comment.id),
      postId: String(comment.post_id),
      userId: String(comment.user_id),
      content: String(comment.content),
      createdAt: String(comment.created_at)
    })) as Comment[]
  }

  async function addComment(postId: string, content: string) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Sign in to comment on posts.')
    const { error: insertError } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: userData.user.id,
      content: content.trim()
    })
    if (insertError) throw insertError
  }

  async function deleteComment(commentId: string) {
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId)
    if (deleteError) throw deleteError
  }

  return { posts, loading, error, fetchPosts, fetchPostsByUserName, addPost, vote, fetchComments, addComment, deleteComment }
})
