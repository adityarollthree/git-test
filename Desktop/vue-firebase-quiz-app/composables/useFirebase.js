import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'

export const useFirebase = () => {
  const { $firebase } = useNuxtApp()
  const { auth, db } = $firebase

  // Auth functions
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      return result.user
    } catch (error) {
      console.error('Sign-in error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Firestore functions
  const submitAnswer = async (userEmail, code, userId) => {
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        userEmail,
        userId,
        code,
        timestamp: serverTimestamp(),
        question: "Write a function to print the first 100 prime numbers."
      })
      return docRef.id
    } catch (error) {
      console.error('Submit error:', error)
      throw error
    }
  }

  const getAllSubmissions = async () => {
    try {
      const q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Get submissions error:', error)
      throw error
    }
  }

  const addAdmin = async (email) => {
    try {
      await setDoc(doc(db, 'admins', email), {
        email,
        addedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Add admin error:', error)
      throw error
    }
  }

  const removeAdmin = async (email) => {
    try {
      await deleteDoc(doc(db, 'admins', email))
    } catch (error) {
      console.error('Remove admin error:', error)
      throw error
    }
  }

  const checkIfAdmin = async (email) => {
    try {
      const docRef = doc(db, 'admins', email)
      const docSnap = await getDoc(docRef)
      return docSnap.exists()
    } catch (error) {
      console.error('Check admin error:', error)
      return false
    }
  }

  const getAllAdmins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'admins'))
      return querySnapshot.docs.map(doc => doc.data())
    } catch (error) {
      console.error('Get admins error:', error)
      throw error
    }
  }

  return {
    auth,
    db,
    signInWithGoogle,
    logout,
    submitAnswer,
    getAllSubmissions,
    addAdmin,
    removeAdmin,
    checkIfAdmin,
    getAllAdmins
  }
}