import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Phone, AlertCircle, Heart, Pill, ShieldAlert, Droplet } from 'lucide-react'

export default function EmergencyCardView({ profile }) {
  // Use mock data if profile is not provided
  const patient = profile ? {
    name: profile.name,
    age: profile.age || 'N/A',
    bloodGroup: profile.blood_group || 'N/A',
    allergies: profile.allergies || [],
    chronicDiseases: profile.chronic_diseases || [],
    medications: profile.current_medications || [],
    contacts: profile.emergency_contacts || []
  } : {
    name: 'Priya Sharma',
    age: 34,
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicDiseases: ['Asthma', 'Hypertension'],
    medications: [
      { name: 'Salbutamol 100mcg', dosage: '2 puffs SOS' },
      { name: 'Amlodipine 5mg', dosage: '1 tablet daily' }
    ],
    contacts: [
      { name: 'Rahul Sharma', relationship: 'Spouse', phone: '+91 98765 43211' },
      { name: 'Dr. Arjun', relationship: 'Family Doctor', phone: '+91 98765 00000' }
    ]
  }

  return (
    <Card className="border border-slate-200/80 shadow-xl overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl transition-all duration-300 hover:shadow-2xl">
      {/* Premium Calming Header */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 p-8 text-white relative">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ShieldAlert size={120} />
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight">Digital Health Passport</h2>
            <p className="text-rose-100 text-xs font-semibold uppercase tracking-wider mt-0.5">Emergency Medical Card</p>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {/* Basic Info & Blood Group */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{patient.name}</h3>
            <p className="text-slate-500 font-semibold text-sm mt-0.5">{patient.age} Years Old • Verified Patient</p>
          </div>
          <div className="text-center">
            <div className="bg-rose-50 text-rose-600 border border-rose-200/60 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-sm">
              <span className="text-2xl font-black">{patient.bloodGroup}</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-rose-500/80 -mt-1">Blood</span>
            </div>
          </div>
        </div>

        {/* Medical Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100">
          {/* Allergies & Diseases */}
          <div className="p-6 space-y-6">
            <div>
              <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-base">
                <AlertCircle size={18} className="text-rose-500" /> Known Allergies
              </h4>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map(a => (
                    <span key={a} className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg font-semibold text-xs border border-rose-100/80">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-medium text-sm">No known allergies</p>
              )}
            </div>

            <div>
              <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-base">
                <Heart size={18} className="text-amber-500" /> Chronic Conditions
              </h4>
              {patient.chronicDiseases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.chronicDiseases.map(d => (
                    <span key={d} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg font-semibold text-xs border border-amber-100/80">
                      {d}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-medium text-sm">No chronic conditions listed</p>
              )}
            </div>
          </div>

          {/* Medications & Actions */}
          <div className="p-6">
            <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-base">
              <Pill size={18} className="text-sky-500" /> Active Medications
            </h4>
            {patient.medications.length > 0 ? (
              <div className="space-y-2">
                {patient.medications.map(m => (
                  <div key={m.name} className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <div className="font-bold text-slate-800 text-sm">{m.name}</div>
                    <div className="text-xs text-slate-500 font-semibold mt-0.5">{m.dosage}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 font-medium text-sm">No active medications</p>
            )}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="p-6 bg-slate-50/30">
          <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4 text-base">
            <Phone size={18} className="text-emerald-500" /> Primary Emergency Contacts
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patient.contacts.map(c => (
              <a 
                key={c.name} 
                href={profile ? `tel:${c.phone}` : '#'}
                onClick={(e) => { if(!profile) { e.preventDefault(); alert("Call feature disabled in demo mode."); } }}
                className="flex items-center justify-between p-4 bg-white border border-slate-200/60 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-900 text-sm">{c.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{c.relationship}</div>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-250">
                  <Phone size={16} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
