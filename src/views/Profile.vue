<template>
	<main class="profile-page">
		<section class="profile-intro">
			<p class="eyebrow">YOUR MEDDIT ACCOUNT</p>
			<h1>{{ user ? 'Your profile' : 'Join the conversation' }}</h1>
			<p>{{ user ? 'Keep your identity and introduction up to date.' : 'Sign in to manage your profile, or create an account to start sharing.' }}</p>
		</section>

		<section v-if="loading" class="profile-card profile-loading" aria-live="polite">Loading your account...</section>

		<template v-else-if="user">
			<section class="profile-card">
				<div class="profile-card-heading">
					<div class="profile-avatar">{{ initials }}</div>
					<div>
						<p class="eyebrow">SIGNED IN AS</p>
						<h2>{{ user.email }}</h2>
					</div>
				</div>

				<form class="profile-form" @submit.prevent="updateProfile">
					<div class="form-row">
						<label>Display name<input v-model="displayName" type="text" maxlength="80" placeholder="How should people know you?" /></label>
            <label>Username<input v-model="username" type="text" maxlength="30" disabled aria-readonly="true" /></label>
					</div>
					<label>About you<textarea v-model="bio" rows="4" maxlength="240" placeholder="A short introduction for the community" /></label>
					<p v-if="message" class="form-message" :class="{ 'form-error': isError }" role="status">{{ message }}</p>
					<div class="form-actions">
						<button class="primary-action" type="submit" :disabled="submitting">{{ submitting ? 'Saving...' : 'Save profile' }}</button>
						<button class="text-action" type="button" @click="signOut">Sign out</button>
					</div>
				</form>
			</section>

			<section class="profile-posts">
				<div class="profile-posts-heading">
					<div>
						<p class="eyebrow">YOUR CONTRIBUTIONS</p>
						<h2>Your posts</h2>
					</div>
				</div>
				<p v-if="postsLoading" class="profile-card profile-loading" aria-live="polite">Loading your posts...</p>
				<p v-else-if="postsError" class="form-message form-error" role="alert">{{ postsError }}</p>
				<p v-else-if="!userPosts.length" class="profile-card empty-state">You have not published any posts yet.</p>
				<div v-else class="post-list"><Post v-for="post in userPosts" :key="post.id" :post="post" /></div>
			</section>
		</template>

		<section v-else class="profile-card auth-card">
			<div class="auth-tabs" role="tablist" aria-label="Account access">
				<button type="button" :class="{ active: mode === 'signin' }" @click="mode = 'signin'">Sign in</button>
				<button type="button" :class="{ active: mode === 'signup' }" @click="mode = 'signup'">Create account</button>
			</div>
			<h2>{{ mode === 'signin' ? 'Welcome back' : 'Create your account' }}</h2>
			<p class="auth-description">{{ mode === 'signin' ? 'Continue where you left off in the Meddit community.' : 'A few details and you are ready to be part of the Meddit community.' }}</p>

			<form class="profile-form" @submit.prevent="submitAuth">
				<label>Email address<input v-model="email" type="email" autocomplete="email" required placeholder="you@example.com" /></label>
				<label>Password<input v-model="password" type="password" :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'" minlength="6" required placeholder="At least 6 characters" /></label>
				<div v-if="mode === 'signup'" class="form-row">
					<label>Display name<input v-model="displayName" type="text" maxlength="80" required placeholder="Your name" /></label>
					<label>Username<input v-model="username" type="text" maxlength="30" placeholder="Optional" /></label>
				</div>
				<p v-if="message" class="form-message" :class="{ 'form-error': isError }" role="status">{{ message }}</p>
				<button class="primary-action form-submit" type="submit" :disabled="submitting">{{ submitting ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account' }}</button>
			</form>
		</section>
	</main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'
import Post from '../components/Post.vue'
import { usePostStore, type Post as UserPost } from '../stores/posts'

const user = ref<User | null>(null)
const loading = ref(true)
const submitting = ref(false)
const mode = ref<'signin' | 'signup'>('signin')
const email = ref('')
const password = ref('')
const displayName = ref('')
const username = ref('')
const bio = ref('')
const message = ref('')
const isError = ref(false)
const userPosts = ref<UserPost[]>([])
const postsLoading = ref(false)
const postsError = ref('')
const postStore = usePostStore()
let subscription: { unsubscribe: () => void } | undefined

const initials = computed(() => (displayName.value || user.value?.email || 'm').slice(0, 1).toUpperCase())

function setMessage(text: string, error = false) {
	message.value = text
	isError.value = error
}

function fillProfile(currentUser: User) {
	user.value = currentUser
	displayName.value = currentUser.user_metadata?.display_name || ''
	username.value = currentUser.user_metadata?.username || ''
	bio.value = currentUser.user_metadata?.bio || ''
}

function clearProfile() {
	user.value = null
	userPosts.value = []
	mode.value = 'signin'
}

async function loadProfile(currentUser: User) {
  // 1. Initial local state assignment
  fillProfile(currentUser)

  // 2. Query all profile fields from public.users
  const { data, error } = await supabase
    .from('users')
    .select('user_name, display_name, bio')
    .eq('id', currentUser.id)
    .maybeSingle()

  if (error) {
    postsError.value = error.message
    return
  }

  // 3. Fallback when user row is missing in public.users
  if (!data) {
    console.warn('Profile record not found in public.users. Keeping session active.')
    
    // Check if auth metadata has values before setting to empty
    const meta = currentUser.user_metadata || {}
    username.value = meta.username || ''
    displayName.value = meta.display_name || ''
    bio.value = meta.bio || ''

    if (!username.value) {
      setMessage('Please complete your profile details.')
    }
    return
  }

  // 4. Populate form fields from the database row
  username.value = data.user_name || ''
  if (data.display_name) displayName.value = data.display_name
  if (data.bio) bio.value = data.bio

  // 5. Fetch posts using the confirmed database user_name
  const postAuthor = data.user_name || username.value
  if (postAuthor) {
    postsLoading.value = true
    postsError.value = ''
    try {
      userPosts.value = await postStore.fetchPostsByUserName(postAuthor)
    } catch (err) {
      postsError.value = err instanceof Error ? err.message : 'Unable to load your posts.'
    } finally {
      postsLoading.value = false
    }
  }
}

async function saveUsername(currentUser: User) {
 const userName = username.value.trim()
 const { data, error } = await supabase
  .from('users')
  .update({ user_name: userName })
  .eq('id', currentUser.id)
  .select('id')
  .maybeSingle()

 if (error) throw error
 if (!data) {
  const { error: insertError } = await supabase
   .from('users')
   .insert({ id: currentUser.id, user_name: userName })
  if (insertError) throw insertError
 }
}

async function submitAuth() {
    submitting.value = true
    setMessage('')
    const result = mode.value === 'signin'
        ? await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
        : await supabase.auth.signUp({
                email: email.value,
                password: password.value,
                options: { data: { display_name: displayName.value.trim(), username: username.value.trim() } }
            })

    if (result.error) {
        setMessage(result.error.message, true)
    } else if (mode.value === 'signup' && !result.data.session) {
        setMessage('Account created. Check your email to confirm your address.')
    } else if (result.data.user) {
        fillProfile(result.data.user)
        
        // ONLY execute saveUsername during signup!
        if (mode.value === 'signup') {
            try {
                await saveUsername(result.data.user)
            } catch (error) {
                console.error('saveUsername error:', error)
                setMessage(error instanceof Error ? error.message : 'Failed to save username.', true)
            }
        }
    }
    submitting.value = false
}

async function updateProfile() {
  submitting.value = true
  setMessage('')

  // 1. Get the current active session directly to ensure valid auth.uid()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    setMessage('User session expired. Please sign in again.', true)
    submitting.value = false
    return
  }

  const cleanUsername = username.value?.trim()
  if (!cleanUsername) {
    setMessage('Username cannot be empty.', true)
    submitting.value = false
    return
  }

  // 2. Perform the upsert including user_name
  const { error } = await supabase
    .from('users')
    .upsert({
      id: session.user.id,
      user_name: cleanUsername,
      display_name: displayName.value.trim(),
      bio: bio.value.trim()
    })
    .select()

  if (error) {
    console.error('Save failed:', error)
    setMessage(error.message, true)
  } else {
    setMessage('Profile saved successfully!')
  }

  submitting.value = false
}

async function signOut() {
	const { error } = await supabase.auth.signOut()
	if (error) setMessage(error.message, true)
	else {
		clearProfile()
		setMessage('You have been signed out.')
	}
}

onMounted(async () => {
	const { data } = await supabase.auth.getSession()
	if (data.session?.user) await loadProfile(data.session.user)
	loading.value = false
	const authState = supabase.auth.onAuthStateChange((_event, session) => {
		if (session?.user) void loadProfile(session.user)
		else user.value = null
	})
	subscription = authState.data.subscription
})

onUnmounted(() => subscription?.unsubscribe())
</script>
