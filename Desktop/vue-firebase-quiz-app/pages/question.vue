<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-4">
            Programming Challenge
          </h1>
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h2 class="text-xl font-semibold text-blue-800 mb-2">
              Question:
            </h2>
            <p class="text-blue-700">
              Write a function to print the first 100 prime numbers.
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Your Solution (Python):
            </label>
            <CodeEditor v-model="code" />
          </div>

          <div class="flex space-x-4 mb-6">
            <button
              @click="runCode"
              :disabled="!code.trim() || runningCode"
              class="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {{ runningCode ? 'Running...' : 'Test Run Code' }}
            </button>
            <button
              @click="submitCode"
              :disabled="!code.trim() || submitting || !canSubmit"
              class="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {{ submitting ? 'Submitting...' : 'Submit Solution' }}
            </button>
          </div>

          <div v-if="output" class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Output:</h3>
            <pre class="bg-gray-100 p-4 rounded overflow-x-auto text-sm">{{ output }}</pre>
          </div>

          <div v-if="error" class="mb-6">
            <h3 class="text-lg font-semibold mb-2 text-red-600">Error:</h3>
            <pre
              class="bg-red-50 border border-red-200 p-4 rounded overflow-x-auto text-sm text-red-700"
            >
              {{ error }}
            </pre>
          </div>

          <div
            v-if="submitted"
            class="bg-green-50 border-l-4 border-green-500 p-4 text-green-700"
          >
            ✅ Solution submitted successfully!
          </div>

          <div v-if="validationMessage" :class="validationClass" class="mb-4 p-2 rounded">
            {{ validationMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFirebase } from '@/composables/useFirebase'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const { submitAnswer } = useFirebase()
const { user } = storeToRefs(useAuthStore())

const code = ref(`def print_first_100_primes():
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0:
                return False
        return True
    
    primes = []
    num = 2
    while len(primes) < 100:
        if is_prime(num):
            primes.append(num)
        num += 1
    
    for prime in primes:
        print(prime)

print_first_100_primes()`)

const output = ref('')
const error = ref('')
const runningCode = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const canSubmit = ref(false)
const validationMessage = ref('')
const validationClass = ref('')

let pyodide = null

// Helper to indent user code by 2 spaces for correct Python try-except block
function indentCode(codeString, indent = '  ') {
  return codeString
    .split('\n')
    .map(line => indent + line)
    .join('\n')
}

onMounted(async () => {
  if (!window.loadPyodide) {
    error.value = 'Pyodide is not loaded. Check your nuxt.config.ts script setup.'
    return
  }
  pyodide = await window.loadPyodide()
})

async function runCode() {
  if (!pyodide) {
    alert('Code execution is not available')
    return
  }

  runningCode.value = true
  output.value = ''
  error.value = ''
  validationMessage.value = ''
  validationClass.value = ''
  canSubmit.value = false

  try {
    await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = mystdout = StringIO()
sys.stderr = mystderr = StringIO()

try:
${indentCode(code.value)}

except Exception as e:
  print('Error:', e)

result = mystdout.getvalue()
errors = mystderr.getvalue()
`)

    output.value = pyodide.globals.get('result') || ''
    error.value = pyodide.globals.get('errors') || ''

    const lines = output.value.trim().split('\n').filter(line => /^\d+$/.test(line))
    if (lines.length === 100) {
      validationMessage.value = '✅ Output validation passed: 100 primes printed!'
      validationClass.value = 'text-green-700 bg-green-100 border border-green-300'
      canSubmit.value = true
    } else {
      validationMessage.value = `⚠️ Output validation failed: Expected 100 primes, found ${lines.length}.`
      validationClass.value = 'text-red-700 bg-red-100 border border-red-300'
      canSubmit.value = false
    }
  } catch (e) {
    error.value = e.message
  } finally {
    runningCode.value = false
  }
}

async function submitCode() {
  if (!canSubmit.value) {
    alert('Please pass the test run before submitting.')
    return
  }
  if (!user.value?.email) {
    alert('You must be logged in to submit.')
    return
  }

  submitting.value = true
  try {
    await submitAnswer(user.value.email, code.value, user.value.uid)
    submitted.value = true
    setTimeout(() => {
      submitted.value = false
    }, 3000)
  } catch (err) {
    alert('Submission failed: ' + err.message)
  } finally {
    submitting.value = false
  }
}
</script>
