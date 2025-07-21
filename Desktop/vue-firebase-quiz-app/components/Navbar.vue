<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-800">
            Programming Quiz
          </NuxtLink>
        </div>
        
        <div class="flex items-center space-x-4">
          <template v-if="user">
            <NuxtLink 
              to="/question"
              class="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
            >
              Question
            </NuxtLink>
            <NuxtLink 
              v-if="isAdmin"
              to="/admin"
              class="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
            >
              Admin
            </NuxtLink>
            <div class="flex items-center space-x-2">
              <img 
                :src="user.photoURL" 
                :alt="user.displayName"
                class="w-8 h-8 rounded-full"
              >
              <span class="text-sm text-gray-600">{{ user.displayName }}</span>
            </div>
            <button 
              @click="handleLogout"
              class="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink 
              to="/login"
              class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Login
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const { logout } = useFirebase()
const { user, isAdmin } = storeToRefs(useAuthStore())

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    alert('Logout failed: ' + error.message)
  }
}
</script>