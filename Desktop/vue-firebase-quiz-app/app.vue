<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initAuth()
})
</script>