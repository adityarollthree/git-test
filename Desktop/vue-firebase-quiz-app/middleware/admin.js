export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAdmin, loading } = storeToRefs(useAuthStore())
  
  if (loading.value) return
  
  if (!user.value) {
    return navigateTo('/login')
  }
  
  if (!isAdmin.value) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied: Admin privileges required'
    })
  }
})