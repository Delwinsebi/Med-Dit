&lt;template&gt;
  &lt;div class="max-w-4xl mx-auto px-4 py-8"&gt;
    &lt;div class="space-y-4"&gt;
      &lt;Post
        v-for="post in posts"
        :key="post.id"
        v-bind="post"
      /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import Post from '../components/Post.vue'
import { ref } from 'vue'

const posts = ref([
  {
    id: 1,
    title: 'Welcome to Med-Dit!',
    content: 'This is our first post. Feel free to explore and contribute!',
    author: 'admin',
    timeAgo: '1 hour ago',
    votes: 42,
    commentCount: 5
  },
  // Add more mock posts here
])
&lt;/script&gt;
