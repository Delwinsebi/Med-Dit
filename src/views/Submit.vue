&lt;template&gt;
  &lt;div class="max-w-2xl mx-auto px-4 py-8"&gt;
    &lt;h1 class="text-2xl font-bold mb-6"&gt;Create a Post&lt;/h1&gt;
    &lt;form @submit.prevent="submitPost" class="space-y-4"&gt;
      &lt;div&gt;
        &lt;label for="title" class="block text-sm font-medium text-gray-700"&gt;Title&lt;/label&gt;
        &lt;input
          type="text"
          id="title"
          v-model="title"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        &gt;
      &lt;/div&gt;
      &lt;div&gt;
        &lt;label for="content" class="block text-sm font-medium text-gray-700"&gt;Content&lt;/label&gt;
        &lt;textarea
          id="content"
          v-model="content"
          rows="4"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        &gt;&lt;/textarea&gt;
      &lt;/div&gt;
      &lt;button
        type="submit"
        class="w-full px-4 py-2 text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      &gt;
        Submit Post
      &lt;/button&gt;
    &lt;/form&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const title = ref('')
const content = ref('')

const submitPost = () => {
  // Here you would typically make an API call to submit the post
  console.log('Submitting post:', { title: title.value, content: content.value })
  router.push('/')
}
&lt;/script&gt;
