<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="brand" aria-label="Meddit home">
      <span class="brand-mark">m</span>
      <span>Meddit</span>
    </RouterLink>
    <nav class="topbar-actions" aria-label="Primary navigation">
      <RouterLink to="/submit" class="create-link"><span aria-hidden="true">+</span> Create</RouterLink>
      <button class="icon-button" type="button" aria-label="Notifications">o</button>
      <RouterLink to="/profile" class="avatar" aria-label="Open your profile">m</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
