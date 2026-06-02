import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// All values must be set in frontend/.env (VITE_ prefix)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k)
if (missing.length > 0) {
  console.warn('[oneHealth] Missing Firebase config:', missing.join(', '))
}

// Reuse existing app instance (prevents HMR duplicate-app errors)
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)

let auth, db, storage

try {
  auth    = getAuth(app)
  db      = getFirestore(app)
  storage = getStorage(app)
} catch (e) {
  console.error('[oneHealth] Firebase init failed:', e.message)
  // Provide null stubs so the app renders; errors will surface in auth flows
  auth = null
  db   = null
  storage = null
}

export { auth, db, storage }
export default app
