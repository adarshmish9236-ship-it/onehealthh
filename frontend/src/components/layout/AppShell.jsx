import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, BottomNav } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from '../ui/Toast'

export function AppShell({ title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Global toast container */}
      <ToastContainer />
    </div>
  )
}
