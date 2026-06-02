import { 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import api from './api'

export const authService = {
  // Register a new user
  async registerUser(email, password, displayName, role = 'patient', extraData = {}) {
    // 1. Call backend API to create user in Firebase Auth and Firestore with correct claims
    await api.post('/auth/register', {
      email,
      password,
      name: displayName,
      phone: extraData.phone || undefined, // Backend phone is Optional
      role
    })

    // 2. Sign in to the Firebase client SDK
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // 3. Force token refresh to pick up custom claims immediately
    await user.getIdToken(true)

    return user
  },

  // Login user
  async loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  },

  // Logout user
  async logout() {
    await signOut(auth)
  },

  // Fetch full user profile from Firestore
  async getUserProfile(uid) {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  },

  // Update user profile in Firestore
  async updateUserProfile(uid, data) {
    await setDoc(doc(db, 'users', uid), data, { merge: true })
  }
}
