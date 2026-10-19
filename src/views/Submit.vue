<template>
  <main class="submit-page">
    <section class="submit-heading">
      <p class="eyebrow">START A DISCUSSION</p>
      <h1>Create a post</h1>
      <p>Share a question, insight, or useful resource with the Meddit community.</p>
    </section>

    <form class="submit-card" @submit.prevent="handleSubmit">
      <label>
        Subject
        <input v-model="form.subject" type="text" maxlength="120" required placeholder="What would you like to discuss?" />
      </label>
      <label>
        Topics
        <input v-model="form.topics" type="text" maxlength="120" required placeholder="e.g. cardiology, exams, research" />
        <span class="field-help">Separate multiple topics with commas.</span>
      </label>
      <label>
        Content
        <textarea v-model="form.content" rows="8" maxlength="5000" required placeholder="Add the details your community needs..." />
      </label>
      <button class="primary-action submit-button" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Publishing...' : 'Publish post' }}
      </button>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '../stores/posts'

const router = useRouter()
const store = usePostStore()
const isSubmitting = ref(false)
const form = ref({ subject: '', topics: '', content: '' })

async function handleSubmit() {
  isSubmitting.value = true
  store.addPost({
    title: form.value.subject.trim(),
    topics: form.value.topics.trim(),
    content: form.value.content.trim()
  })
  await router.push('/')
  isSubmitting.value = false
}
</script>

<style scoped>
.submit-page { display: grid; grid-template-columns: minmax(0, 680px); justify-content: center; gap: 22px; padding: 56px 24px 90px; }
.submit-heading { padding-left: 4px; }
.submit-heading h1 { margin: 7px 0 8px; color: var(--ink); font: 700 38px 'Space Grotesk', sans-serif; letter-spacing: -1px; }
.submit-heading > p:last-child { max-width: 480px; margin: 0; color: var(--muted); font-size: 14px; }
.submit-card { display: grid; gap: 19px; padding: 28px; background: var(--card); border: 1px solid var(--line); border-radius: 9px; box-shadow: 0 5px 18px rgba(31,36,40,.04); }
.submit-card label { display: grid; gap: 7px; color: #42484d; font-size: 12px; font-weight: 700; }
.submit-card input, .submit-card textarea { width: 100%; padding: 11px 12px; border: 1px solid #d4d8da; border-radius: 5px; outline: 0; color: var(--ink); background: #fbfbfb; font: inherit; font-size: 13px; resize: vertical; }
.submit-card input:focus, .submit-card textarea:focus { border-color: var(--orange); box-shadow: 0 0 0 2px rgba(38,123,192,.12); }
.field-help { color: var(--muted); font-size: 11px; font-weight: 400; }
.submit-button { width: fit-content; margin-top: 2px; border: 0; cursor: pointer; }
.submit-button:disabled { cursor: wait; opacity: .6; }

@media (max-width: 560px) {
  .submit-page { padding: 34px 15px 60px; }
  .submit-heading h1 { font-size: 31px; }
  .submit-card { padding: 21px 17px; }
}
</style>
