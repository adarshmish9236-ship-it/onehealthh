import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

export const medicationService = {
  async getMedications(userId) {
    const medsRef = collection(db, 'medications')
    // Check both potential fields: patient_uid (used by seed) and userId
    const q1 = query(medsRef, where('patient_uid', '==', userId))
    const s1 = await getDocs(q1)
    if (!s1.empty) {
      return s1.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }
    const q2 = query(medsRef, where('userId', '==', userId))
    const s2 = await getDocs(q2)
    return s2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  async addMedication(userId, medData) {
    const medId = medData.id || `med-${Date.now()}`
    const docRef = doc(db, 'medications', medId)
    await setDoc(docRef, { ...medData, userId, createdAt: new Date().toISOString() })
    return medId
  },

  async updateMedication(medId, data) {
    const docRef = doc(db, 'medications', medId)
    await setDoc(docRef, data, { merge: true })
  },

  async deleteMedication(medId) {
    await deleteDoc(doc(db, 'medications', medId))
  }
}
