<template>
  <div class="border rounded-md overflow-hidden flex flex-col">
    <div ref="editorRef" class="min-h-[300px] flex-grow"></div>

    <!-- Buttons are commented out as you requested -->
    <!--
    <div class="p-2 border-t flex items-center justify-between bg-gray-50 dark:bg-gray-800">
      <div class="space-x-2">
        <button
          @click="runCode"
          :disabled="loading"
          class="bg-blue-600 text-white px-4 py-1 rounded text-sm"
        >
          {{ loading ? 'Running...' : 'Test Code' }}
        </button>
        <button
          @click="submitCode"
          :disabled="loading || !canSubmit"
          class="bg-green-600 text-white px-4 py-1 rounded text-sm"
        >
          Submit
        </button>
      </div>
      <span class="text-xs text-gray-500">Runs in-browser via Pyodide</span>
    </div>
    -->

    <!-- Output / Error tabs commented out as you requested -->
    <!--
    <div class="mt-2">
      ...
    </div>
    -->

    <p v-if="submitMsg" :class="submitSuccess ? 'text-green-600' : 'text-red-600'" class="mt-2 px-2">
      {{ submitMsg }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const editorRef = ref()
const output = ref('')
const error = ref('')
const loading = ref(false)
const tab = ref('output')
const submitMsg = ref('')
const submitSuccess = ref(false)
const canSubmit = ref(false)

let pyodide = null
let view = null

const firestore = getFirestore()
const auth = getAuth()

onMounted(async () => {
  // Setup CodeMirror editor
  view = new EditorView({
    doc: props.modelValue || '',
    extensions: [
      basicSetup,
      python(),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
          canSubmit.value = false
          submitMsg.value = ''
          output.value = ''
          error.value = ''
        }
      })
    ],
    parent: editorRef.value
  })

  // Dynamically load Pyodide script if not loaded
  if (!window.loadPyodide) {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        script.async = true
        script.onload = resolve
        script.onerror = () => reject(new Error('Failed to load Pyodide script'))
        document.head.appendChild(script)
      })
    } catch (e) {
      error.value = '❌ Failed to load Pyodide: ' + e.message
      return
    }
  }

  try {
    pyodide = await window.loadPyodide()
  } catch (e) {
    error.value = '❌ Failed to initialize Pyodide: ' + e.message
  }
})

onUnmounted(() => {
  view?.destroy()
})

watch(() => props.modelValue, (newValue) => {
  if (view && newValue !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newValue || '' }
    })
  }
})

// Run code in Pyodide, capture output and errors, validate primes count
const runCode = async () => {
  if (!pyodide) {
    error.value = '⚠️ Pyodide is not loaded.'
    return
  }
  loading.value = true
  output.value = ''
  error.value = ''
  submitMsg.value = ''
  canSubmit.value = false

  try {
    await pyodide.runPythonAsync(`
import sys
import io

sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

try:
  ${props.modelValue}

  print_first_100_primes()

  result = sys.stdout.getvalue()
  errors = sys.stderr.getvalue()

except Exception as e:
  result = sys.stdout.getvalue()
  errors = str(e)
`)

    // Get Python stdout and stderr
    output.value = pyodide.globals.get('result') || ''
    error.value = pyodide.globals.get('errors') || ''

    // Auto-validate output for 100 primes (count lines)
    const lines = output.value.trim().split('\n').filter(l => l.match(/^\d+$/))
    if (lines.length === 100) {
      canSubmit.value = true
      submitMsg.value = '✅ Code runs successfully and output looks valid!'
      submitSuccess.value = true
    } else {
      submitMsg.value = `⚠️ Output does not contain 100 primes (found ${lines.length}). Please fix your code.`
      submitSuccess.value = false
    }
    tab.value = 'output'
  } catch (e) {
    error.value = '❌ Execution error: ' + e.message
    tab.value = 'errors'
    submitMsg.value = ''
    canSubmit.value = false
  } finally {
    loading.value = false
  }
}

// Submit the code + validation status to Firestore
const submitCode = async () => {
  if (!canSubmit.value) {
    submitMsg.value = '⚠️ Please run and pass the test before submitting.'
    submitSuccess.value = false
    return
  }

  const user = auth.currentUser
  if (!user) {
    submitMsg.value = '⚠️ You must be logged in to submit.'
    submitSuccess.value = false
    return
  }

  loading.value = true
  submitMsg.value = ''
  try {
    await addDoc(collection(firestore, 'submissions'), {
      userEmail: user.email,
      code: props.modelValue,
      output: output.value,
      passedTest: canSubmit.value,
      createdAt: serverTimestamp()
    })
    submitMsg.value = '🎉 Submission successful!'
    submitSuccess.value = true
  } catch (err) {
    submitMsg.value = '❌ Submission failed: ' + err.message
    submitSuccess.value = false
  } finally {
    loading.value = false
  }
}
</script>
