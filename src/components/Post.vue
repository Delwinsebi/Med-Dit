<script setup lang="ts">
export interface PostProps {
  id: number
  title: string
  content: string
  author: string
  community: string 
  timeAgo?: string
  votes: number
  commentCount?: number
}

defineProps<{
  post: PostProps
}>()
</script>

<template>
  <article class="post-card">
    <div class="post-meta"><span class="community-mark">m</span><span>r/med-dit</span><span class="muted">•</span><span class="muted">Posted by u/{{ post.author }} {{ post.timeAgo }}</span><button class="more-button" type="button" aria-label="More post options">•••</button></div>
    <h2>{{ post.title }}</h2><p class="post-content">{{ post.content }}</p>
    <div class="post-actions"><div class="vote-control"><button type="button" aria-label="Upvote post">⌃</button><strong>{{ post.votes }}</strong><button type="button" aria-label="Downvote post">⌄</button></div><button type="button" class="post-action">{{ post.commentCount }} <span>comments</span></button><button type="button" class="post-action">Share</button></div>
  </article>
</template>