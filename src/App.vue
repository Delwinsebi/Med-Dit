
<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import type { User } from '@supabase/supabase-js'
  import { supabase } from './utils/supabase'
  import { RouterLink, RouterView } from 'vue-router'

  interface Todo {
    id: number
    name: string
  }

  const todos = ref<Todo[]>([])
  const user = ref<User | null>(null)
  let subscription: { unsubscribe: () => void } | undefined

  const profileInitial = computed(() => {
    const name = user.value?.user_metadata?.display_name || user.value?.email || 'u'
    return name.slice(0, 1).toUpperCase()
  })

  async function getTodos() {
    const { data } = await supabase.from('todos').select()
    todos.value = data || []
  }

  onMounted(async () => {
    getTodos()
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user || null
    const authState = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
    })
    subscription = authState.data.subscription
  })

  onUnmounted(() => subscription?.unsubscribe())
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">{{ todo.name }}</li>
  </ul>
  <header class="topbar">
    <RouterLink to="/" class="brand" aria-label="Meddit home">
      <span class="brand-mark">M</span>
      <span>Meddit</span>
    </RouterLink>
    <nav class="topbar-actions" aria-label="Primary navigation">
      <RouterLink to="/submit" class="create-link"><span aria-hidden="true">+</span> Create</RouterLink>
      <RouterLink to="/profile" class="avatar" aria-label="Open your profile">{{ profileInitial }}</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
