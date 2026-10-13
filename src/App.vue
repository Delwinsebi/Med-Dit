<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="brand" aria-label="Med-Dit home">
      <span class="brand-mark">m</span>
      <span>meddit</span>
    </RouterLink>
    <nav class="topbar-actions" aria-label="Primary navigation">
      <RouterLink to="/submit" class="create-link"><span aria-hidden="true">+</span> Create</RouterLink>
      <button class="icon-button" type="button" aria-label="Notifications">o</button>
      <button class="avatar" type="button" aria-label="Account menu">m</button>
    </nav>
  </header>
  <RouterView />
</template>
