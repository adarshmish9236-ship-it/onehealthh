import React from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'

const NAV_LINKS = [
  { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
  { name: 'Patients', path: '/doctor/patients', icon: Users },
  { name: 'Consultations', path: '/doctor/consultation', icon: Stethoscope },
  { name: 'Analytics', path: '/doctor/analytics', icon: BarChart3 },
  { name: 'Profile', path: '/doctor/profile', icon: Settings },
]

export function DoctorLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/doctor/login')
  }

  // Get current page title based on route
  const currentTitle = NAV_LINKS.find(link => location.pathname.startsWith(link.path))?.name || 'Portal'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="oneHealth logo" className="w-full h-full object-cover" />
          </div>
          <span>oneHealth Pro</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
          {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 shadow-xl md:shadow-none
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-300`}
          >
            {/* Logo area */}
            <div className="hidden md:flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-slate-800 text-blue-600 dark:text-blue-500 font-bold text-2xl tracking-tight">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="oneHealth logo" className="w-full h-full object-cover" />
              </div>
              oneHealth Pro
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-3">
                Main Menu
              </div>
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname.startsWith(link.path)
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <link.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-slate-900 dark:group-hover:text-slate-200'}`} />
                    {link.name}
                  </NavLink>
                )
              })}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-2 mb-4">
                <img 
                  src={user?.avatar || "https://ui-avatars.com/api/?name=Dr+Smith&background=0D8ABC&color=fff"} 
                  alt="Doctor Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Dr. {user?.name || "Sarah Smith"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Cardiologist</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentTitle}</h1>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>oneHealth Pro</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>{currentTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search patient, ID..." 
                className="pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none text-sm w-64 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content with Transition */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
    </div>
  )
}
