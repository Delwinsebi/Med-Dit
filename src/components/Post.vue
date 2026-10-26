<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'
import { usePostStore, type Comment, type VoteType } from '../stores/posts'

export interface PostProps {
  id: string
  title: string
  topic: string
  content: string
  author: string
  community: string 
  timeAgo?: string
  upvotes: number
  downvotes: number
  currentVote: VoteType | null
  commentCount: number
}

const props = defineProps<{
  post: PostProps
}>()

const router = useRouter()
const store = usePostStore()
const comments = ref<Comment[]>([])
const commentText = ref('')
const commentsOpen = ref(false)
const commentsLoading = ref(false)
const submittingComment = ref(false)
const voting = ref(false)
const interactionError = ref('')
const currentUserId = ref('')

async function loadComments() {
  commentsLoading.value = true
  try {
    comments.value = await store.fetchComments(props.post.id)
  } catch (error) {
    interactionError.value = error instanceof Error ? error.message : 'Unable to load comments.'
  } finally {
    commentsLoading.value = false
  }
}

async function requireUser() {
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    await router.push({ name: 'Profile' })
    return false
  }
  currentUserId.value = data.user.id
  return true
}

async function handleVote(voteType: VoteType) {
  if (!(await requireUser())) return
  voting.value = true
  interactionError.value = ''
  try {
    await store.vote(props.post.id, voteType)
  } catch (error) {
    interactionError.value = error instanceof Error ? error.message : 'Unable to save your vote.'
  } finally {
    voting.value = false
  }
}

async function handleComment() {
  if (!(await requireUser())) return
  const content = commentText.value.trim()
  if (!content) return
  submittingComment.value = true
  interactionError.value = ''
  try {
    await store.addComment(props.post.id, content)
    commentText.value = ''
    commentsOpen.value = true
    await loadComments()
    props.post.commentCount = comments.value.length
  } catch (error) {
    interactionError.value = error instanceof Error ? error.message : 'Unable to publish your comment.'
  } finally {
    submittingComment.value = false
  }
}

async function handleDeleteComment(commentId: string) {
  try {
    await store.deleteComment(commentId)
    comments.value = comments.value.filter((comment) => comment.id !== commentId)
    props.post.commentCount = comments.value.length
  } catch (error) {
    interactionError.value = error instanceof Error ? error.message : 'Unable to delete your comment.'
  }
}

function formatCommentTime(value: string) {
  return new Date(value).toLocaleString()
}

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  currentUserId.value = data.user?.id || ''
  await loadComments()
})
</script>

<template>
  <article class="post-card">
    <div class="post-meta"><span class="community-mark">M</span><span>r/meddit</span><span class="muted">•</span><span class="muted">Posted by u/{{ post.author }} {{ post.timeAgo }}</span></div>
      <h2>{{ post.topic || post.title }}</h2><p class="post-content">{{ post.content }}</p>
    <div class="post-actions">
      <div class="vote-control" aria-label="Post votes">
        <button type="button" :class="{ active: post.currentVote === 'up' }" :disabled="voting" aria-label="Upvote post" @click="handleVote('up')">↑</button>
        <strong>{{ post.upvotes }}</strong>
        <button type="button" :class="{ active: post.currentVote === 'down' }" :disabled="voting" aria-label="Downvote post" @click="handleVote('down')">↓</button>
        <strong>{{ post.downvotes }}</strong>
      </div>
      <button type="button" class="post-action" @click="commentsOpen = !commentsOpen">
        <strong>{{ post.commentCount }}</strong>
        <span>{{ post.commentCount === 1 ? 'comment' : 'comments' }}</span>
      </button>
    </div>
    <p v-if="interactionError" class="form-message form-error" role="alert">{{ interactionError }}</p>
    <section v-if="commentsOpen" class="comments-panel" aria-label="Comments">
      <div v-if="commentsLoading" class="comments-status">Loading comments...</div>
      <div v-else-if="!comments.length" class="comments-status">No comments yet.</div>
      <article v-for="comment in comments" :key="comment.id" class="comment-item">
        <p>{{ comment.content }}</p>
        <small>{{ comment.userId === currentUserId ? 'You' : 'Community member' }} · {{ formatCommentTime(comment.createdAt) }}</small>
        <button v-if="comment.userId === currentUserId" type="button" class="comment-delete" @click="handleDeleteComment(comment.id)">Delete</button>
      </article>
      <form class="comment-form" @submit.prevent="handleComment">
        <textarea v-model="commentText" rows="2" maxlength="1000" required placeholder="Add a thoughtful comment..."></textarea>
        <button type="submit" class="primary-action" :disabled="submittingComment">{{ submittingComment ? 'Posting...' : 'Comment' }}</button>
      </form>
    </section>
  </article>
</template>

<style scoped>
.vote-control { display: inline-flex; align-items: center; gap: 5px; padding: 3px 7px; border: 1px solid #e0e3e4; border-radius: 18px; background: #f6f7f7; color: #566066; font-size: 12px; }
.vote-control button { border: 0; padding: 0 2px; color: #6d777c; background: transparent; font-size: 18px; line-height: 1; cursor: pointer; }
.vote-control button.active { color: var(--orange); font-weight: 700; }
.vote-control button:disabled { cursor: wait; opacity: .6; }
.comments-panel { display: grid; gap: 10px; margin-top: 13px; padding-top: 12px; border-top: 1px solid var(--line); }
.comments-status { color: var(--muted); font-size: 12px; }
.comment-item { position: relative; padding: 9px 10px; border-left: 2px solid var(--line); background: var(--surface); }
.comment-item p { margin: 0 0 5px; color: var(--text); font-size: 13px; white-space: pre-wrap; }
.comment-item small { color: var(--muted); font-size: 10px; }
.comment-delete { margin-left: 8px; padding: 0; border: 0; color: var(--orange); background: transparent; font-size: 10px; cursor: pointer; }
.comment-form { display: grid; gap: 8px; }
.comment-form textarea { width: 100%; padding: 9px 10px; border: 1px solid var(--line); border-radius: 5px; color: var(--text); background: var(--surface); font: inherit; font-size: 12px; resize: vertical; }
.comment-form button { width: fit-content; border: 0; cursor: pointer; }
</style>