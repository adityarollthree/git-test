<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">
          Login Required
        </h2>
        <p class="text-gray-600 mb-8">
          Sign in with your Google account to access the programming quiz.
        </p>
        
        <button 
          @click="handleGoogleSignIn"
          :disabled="loading"
          class="w-full bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{{ loading ? 'Signing in...' : 'Sign in with Google' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { signInWithGoogle } = useFirebase()
const loading = ref(false)

const handleGoogleSignIn = async () => {
  loading.value = true
  try {
    await signInWithGoogle()
    await navigateTo('/question')
  } catch (error) {
    alert('Sign-in failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Redirect if already logged in
const { user } = storeToRefs(useAuthStore())
watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/question')
  }
})
</script>
