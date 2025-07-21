<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      <!-- Admin Management -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Admin Management</h2>
        
        <div class="mb-6">
          <div class="flex space-x-2">
            <input 
              v-model="newAdminEmail"
              type="email"
              placeholder="Enter email to add as admin"
              class="flex-1 border border-gray-300 rounded-md px-3 py-2"
            >
            <button 
              @click="handleAddAdmin"
              :disabled="!newAdminEmail || addingAdmin"
              class="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
            >
              {{ addingAdmin ? 'Adding...' : 'Add Admin' }}
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 text-left">Email</th>
                <th class="px-4 py-2 text-left">Added At</th>
                <th class="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.email" class="border-t">
                <td class="px-4 py-2">{{ admin.email }}</td>
                <td class="px-4 py-2">
                  {{ admin.addedAt?.toDate?.()?.toLocaleDateString() || 'N/A' }}
                </td>
                <td class="px-4 py-2">
                  <button 
                    @click="handleRemoveAdmin(admin.email)"
                    :disabled="admin.email === user.email"
                    class="bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                  >
                    {{ admin.email === user.email ? 'You' : 'Remove' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Submissions -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">User Submissions</h2>
        
        <div class="space-y-4">
          <div 
            v-for="submission in submissions" 
            :key="submission.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-semibold text-gray-800">{{ submission.userEmail }}</h3>
                <p class="text-sm text-gray-600">
                  {{ submission.timestamp?.toDate?.()?.toLocaleString() || 'No timestamp' }}
                </p>
              </div>
            </div>
            <div class="bg-gray-50 rounded p-3">
              <pre class="text-sm overflow-x-auto">{{ submission.code }}</pre>
            </div>
          </div>
          
          <div v-if="submissions.length === 0" class="text-center text-gray-600 py-8">
            No submissions yet.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getAllSubmissions, addAdmin, removeAdmin, getAllAdmins } = useFirebase()
const { user } = storeToRefs(useAuthStore())
const authStore = useAuthStore()

const submissions = ref([])
const admins = ref([])
const newAdminEmail = ref('')
const addingAdmin = ref(false)
const loading = ref(true)

const loadData = async () => {
  try {
    const [submissionsData, adminsData] = await Promise.all([
      getAllSubmissions(),
      getAllAdmins()
    ])
    
    submissions.value = submissionsData
    admins.value = adminsData
  } catch (error) {
    console.error('Error loading data:', error)
    alert('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

const handleAddAdmin = async () => {
  if (!newAdminEmail.value) return
  
  addingAdmin.value = true
  try {
    await addAdmin(newAdminEmail.value)
    newAdminEmail.value = ''
    await loadData() // Refresh data
    alert('Admin added successfully!')
  } catch (error) {
    console.error('Error adding admin:', error)
    alert('Failed to add admin')
  } finally {
    addingAdmin.value = false
  }
}

const handleRemoveAdmin = async (email) => {
  if (email === user.value.email) {
    alert('You cannot remove yourself as admin')
    return
  }
  
  if (!confirm(`Are you sure you want to remove ${email} as admin?`)) return
  
  try {
    await removeAdmin(email)
    await loadData() // Refresh data
    await authStore.refreshAdminStatus() // Refresh current user's admin status
    alert('Admin removed successfully!')
  } catch (error) {
    console.error('Error removing admin:', error)
    alert('Failed to remove admin')
  }
}

onMounted(() => {
  loadData()
})
</script>