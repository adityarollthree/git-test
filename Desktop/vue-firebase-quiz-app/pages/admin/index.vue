<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <AdminDashboard />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'admin'
})
</script>
