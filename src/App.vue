
<script setup>
  import { ref, onMounted } from 'vue'
  import { supabase } from './utils/supabase'
  import { RouterLink, RouterView } from 'vue-router'

  const todos = ref([])

  async function getTodos() {
    const { data } = await supabase.from('todos').select()
    todos.value = data
  }

  onMounted(() => {
    getTodos()
  })

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
      <RouterLink to="/profile" class="avatar" aria-label="Open your profile">U</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
