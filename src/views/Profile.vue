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
						<label>Username<input v-model="username" type="text" maxlength="30" placeholder="e.g. medstudentmaria" /></label>
					</div>
					<label>About you<textarea v-model="bio" rows="4" maxlength="240" placeholder="A short introduction for the community" /></label>
					<p v-if="message" class="form-message" :class="{ 'form-error': isError }" role="status">{{ message }}</p>
					<div class="form-actions">
						<button class="primary-action" type="submit" :disabled="submitting">{{ submitting ? 'Saving...' : 'Save profile' }}</button>
						<button class="text-action" type="button" @click="signOut">Sign out</button>
					</div>
				</form>
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

async function loadProfile(currentUser: User) {
	fillProfile(currentUser)
	const { data } = await supabase.from('users').select('user_name').eq('id', currentUser.id).maybeSingle()
	if (data?.user_name) username.value = data.user_name
}

async function saveUsername(currentUser: User) {
	const { error } = await supabase.from('users').upsert(
		{ id: currentUser.id, user_name: username.value.trim() },
		{ onConflict: 'id' }
	)
	if (error) throw error
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

	if (result.error) setMessage(result.error.message, true)
	else if (mode.value === 'signup' && !result.data.session) setMessage('Account created. Check your email to confirm your address.')
	else if (result.data.user) {
		fillProfile(result.data.user)
		try {
			await saveUsername(result.data.user)
		} catch (error) {
			setMessage(error instanceof Error ? error.message : 'Unable to save your username.', true)
		}
	}
	submitting.value = false
}

async function updateProfile() {
	if (!user.value) return
	submitting.value = true
	setMessage('')
	const { data, error } = await supabase.auth.updateUser({
		data: { display_name: displayName.value.trim(), username: username.value.trim(), bio: bio.value.trim() }
	})
	if (error) setMessage(error.message, true)
	else if (data.user) {
		try {
			await saveUsername(data.user)
			fillProfile(data.user)
			setMessage('Profile saved.')
		} catch (saveError) {
			setMessage(saveError instanceof Error ? saveError.message : 'Unable to save your username.', true)
		}
	}
	submitting.value = false
}

async function signOut() {
	const { error } = await supabase.auth.signOut()
	if (error) setMessage(error.message, true)
	else {
		user.value = null
		mode.value = 'signin'
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
