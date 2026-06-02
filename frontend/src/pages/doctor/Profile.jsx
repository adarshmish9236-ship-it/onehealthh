import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  BookOpen, 
  ShieldCheck,
  Edit2
} from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useAuthStore } from '../../store/authStore'

export function Profile() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Profile Header */}
      <Card className="p-0 overflow-hidden border-0 shadow-sm bg-white dark:bg-slate-900 rounded-3xl relative">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 relative z-10">
            <div className="relative group">
              <Avatar 
                src={user?.avatar || ""} 
                name={user?.name || "Sarah Smith"}
                size="xxl"
                className="border-4 border-white dark:border-slate-900 shadow-lg"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dr. Sarah Smith</h1>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">Senior Cardiologist</p>
            </div>
            
            <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 mb-2">
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Contact & Info */}
        <div className="space-y-6">
          <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-sm">sarah.smith@cityhospital.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="text-sm">+1 (555) 987-6543</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="text-sm">City General Hospital, NY</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/30">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Verification Status</h3>
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">Verified Practitioner</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">MCR-12345678</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Professional Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
                <Input defaultValue="Cardiology" readOnly className="bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Years of Experience</label>
                <Input defaultValue="12 Years" readOnly className="bg-slate-50 dark:bg-slate-800" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Biography</label>
                <textarea 
                  defaultValue="Dr. Sarah Smith is a board-certified cardiologist with over 12 years of experience. She specializes in preventive cardiology and echocardiography. She completed her fellowship at Johns Hopkins Hospital."
                  className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:text-white"
                  readOnly
                ></textarea>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Education
              </h4>
              <ul className="space-y-4">
                <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">MD in Cardiology</p>
                  <p className="text-xs text-slate-500">Harvard Medical School, 2014</p>
                </li>
                <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">MBBS</p>
                  <p className="text-xs text-slate-500">University of California, 2010</p>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Awards
              </h4>
              <ul className="space-y-4">
                <li className="relative pl-4 border-l-2 border-amber-200 dark:border-amber-800">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Excellence in Patient Care</p>
                  <p className="text-xs text-slate-500">American Heart Association, 2023</p>
                </li>
                <li className="relative pl-4 border-l-2 border-amber-200 dark:border-amber-800">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Best Researcher Award</p>
                  <p className="text-xs text-slate-500">Cardiology Society, 2021</p>
                </li>
              </ul>
            </Card>
          </div>

        </div>
      </div>

    </div>
  )
}
