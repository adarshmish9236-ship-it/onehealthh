import api from './api'
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore'
import { db, auth } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export const recordsService = {
  // Upload file to Firebase Storage
  async uploadFile(file, userId) {
    const fileRef = ref(storage, `records/${userId}/${Date.now()}_${file.name}`)
    await uploadBytes(fileRef, file)
    const downloadURL = await getDownloadURL(fileRef)
    return downloadURL
  },

  // Fetch records from Firestore directly (Client-side read)
  async getUserRecords(userId) {
    const recordsRef = collection(db, 'records')
    const q = query(recordsRef, where('userId', '==', userId), orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Save record to Firestore (could also be done via Flask API for validation)
  async saveRecord(userId, recordData) {
    const recordId = recordData.id || `rec-${Date.now()}`
    const docRef = doc(db, 'records', recordId)
    await setDoc(docRef, { ...recordData, userId, updatedAt: new Date().toISOString() }, { merge: true })
    return recordId
  },

  // Delete record from Firestore
  async deleteRecord(recordId) {
    await deleteDoc(doc(db, 'records', recordId))
  },

  // Fetch record from backend using ID number
  async fetchById(reportId) {
    const response = await api.get(`/records/fetch-by-id/${reportId}`)
    return response.data
  },

  // Example: Backend Flask API Call for parsing complex records
  async parseMedicalReport(fileUrl, fileType) {
    const response = await api.post('/records/parse', { fileUrl, fileType })
    return response.data
  }
}
