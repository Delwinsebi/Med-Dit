<template>
  <main class="feed-page">
    <aside class="rail" aria-label="Community navigation">
      <button class="rail-toggle" type="button" aria-label="Open navigation">=</button>
      <div class="rail-line"></div>
    </aside>
    <section class="feed-shell">
      <div class="feed-heading">
        <h1>meddit</h1>
        <p>Ask, learn, and share with your medical community.</p>
      </div>
      <label class="search-box"><span aria-hidden="true">⌕</span><input type="search" placeholder="Find anything" aria-label="Search posts" /></label>
      <div class="feed-toolbar">
        <span>Home</span><button type="button">Best <span aria-hidden="true">⌄</span></button>
        <RouterLink to="/submit" class="toolbar-create">Create post</RouterLink>
      </div>
      <div class="post-list"><Post v-for="post in store.posts" :key="post.id" :post="post" /></div>
      <div v-if="!store.posts.length" class="empty-state">No posts yet. Start the conversation.</div>
    </section>
    <aside class="about-panel">
      <p class="eyebrow">MED-DIT COMMUNITY</p><h2>A calmer place to talk medicine.</h2>
      <p>Share questions, study wins, and useful clinical knowledge with people who get it.</p>
      <RouterLink to="/submit" class="primary-action">Create a post</RouterLink>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Post from '../components/Post.vue'
import { usePostStore } from '../stores/posts'

const store = usePostStore()
</script>