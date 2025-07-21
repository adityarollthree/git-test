<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-6">
            Welcome to Programming Quiz
          </h1>
          
          <div v-if="!user" class="text-center">
            <p class="text-gray-600 mb-6">
              Please log in to access the programming question.
            </p>
            <NuxtLink 
              to="/login" 
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login with Google
            </NuxtLink>
          </div>
          
          <div v-else class="text-center">
            <p class="text-gray-600 mb-6">
              Ready to solve some programming challenges?
            </p>
            <NuxtLink 
              to="/question" 
              class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Start Quiz
            </NuxtLink>
            <NuxtLink 
              v-if="isAdmin" 
              to="/admin" 
              class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Admin Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user, isAdmin } = storeToRefs(useAuthStore())
</script>