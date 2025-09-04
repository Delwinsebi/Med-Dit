&lt;template&gt;
  &lt;div class="bg-white rounded-lg shadow p-4 mb-4"&gt;
    &lt;div class="flex items-start space-x-3"&gt;
      &lt;div class="flex flex-col items-center space-y-2"&gt;
        &lt;button class="text-gray-400 hover:text-primary-500"&gt;
          ▲
        &lt;/button&gt;
        &lt;span class="text-sm font-medium"&gt;{{ votes }}&lt;/span&gt;
        &lt;button class="text-gray-400 hover:text-primary-500"&gt;
          ▼
        &lt;/button&gt;
      &lt;/div&gt;
      &lt;div class="flex-1"&gt;
        &lt;h3 class="text-lg font-semibold"&gt;{{ title }}&lt;/h3&gt;
        &lt;p class="text-sm text-gray-500"&gt;Posted by u/{{ author }} {{ timeAgo }}&lt;/p&gt;
        &lt;p class="mt-2 text-gray-700"&gt;{{ content }}&lt;/p&gt;
        &lt;div class="mt-4 flex space-x-4 text-sm text-gray-500"&gt;
          &lt;button class="flex items-center space-x-2 hover:text-gray-700"&gt;
            &lt;span&gt;💬&lt;/span&gt;
            &lt;span&gt;{{ commentCount }} Comments&lt;/span&gt;
          &lt;/button&gt;
          &lt;button class="flex items-center space-x-2 hover:text-gray-700"&gt;
            &lt;span&gt;↗️&lt;/span&gt;
            &lt;span&gt;Share&lt;/span&gt;
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
defineProps&lt;{
  title: string
  content: string
  author: string
  timeAgo: string
  votes: number
  commentCount: number
}&gt;()
&lt;/script&gt;
