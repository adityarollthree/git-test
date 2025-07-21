export default defineNuxtRouteMiddleware((to, from) => {
  const { user, loading } = storeToRefs(useAuthStore())
  
  if (loading.value) return
  
  if (!user.value) {
    return navigateTo('/login')
  }
})