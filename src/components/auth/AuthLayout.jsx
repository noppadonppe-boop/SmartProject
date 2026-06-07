import React from 'react'
import { Building2 } from 'lucide-react'

const CloudSeparatorDesktop = () => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 bottom-0 left-0 w-[120px] h-full translate-x-[-99%] hidden md:block" style={{ zIndex: 10 }}>
    <path d="M 100 0 Q 60 10 70 25 Q 40 40 60 55 Q 30 70 50 85 Q 20 95 100 100 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M 100 0 Q 70 15 80 30 Q 50 45 70 60 Q 40 75 60 90 Q 30 100 100 100 Z" fill="rgba(255,255,255,0.5)" />
    <path d="M 100 0 Q 80 20 90 35 Q 60 50 80 65 Q 50 80 70 95 Q 40 100 100 100 Z" fill="#ffffff" />
  </svg>
)

const CloudSeparatorMobile = () => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 left-0 right-0 w-full h-[60px] translate-y-[-99%] md:hidden" style={{ zIndex: 10 }}>
    <path d="M 0 100 Q 10 60 25 70 Q 40 40 55 60 Q 70 30 85 50 Q 95 20 100 100 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M 0 100 Q 15 70 30 80 Q 45 50 60 70 Q 75 40 90 60 Q 100 30 100 100 Z" fill="rgba(255,255,255,0.5)" />
    <path d="M 0 100 Q 20 80 35 90 Q 50 60 65 80 Q 80 50 95 70 Q 100 40 100 100 Z" fill="#ffffff" />
  </svg>
)

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1565D8] font-sans">
      {/* Left/Top Panel */}
      <div className="relative flex flex-col justify-center items-center p-10 md:w-3/5 lg:w-2/3 text-white min-h-[40vh] md:min-h-screen z-0">
        <h1 className="text-2xl md:text-3xl font-medium mb-8 md:mb-12">Welcome to</h1>
        
        <div className="flex flex-col items-center mb-8 md:mb-16">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="text-[#1565D8]" size={40} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide">SmartProject</h2>
        </div>
        
        <p className="text-[11px] md:text-sm text-center opacity-90 max-w-[320px] leading-relaxed mb-4 md:mb-0">
          Streamline your workflow with intelligent project management, real-time collaboration, and advanced scheduling tools.
        </p>
      </div>

      {/* Right/Bottom Panel - Form */}
      <div className="relative flex-1 bg-white flex items-center justify-center p-8 z-10 md:rounded-none rounded-none">
        <CloudSeparatorDesktop />
        <CloudSeparatorMobile />

        <div className="w-full max-w-sm mt-4 md:mt-0 relative z-20">
          {children}
        </div>
      </div>
    </div>
  )
}
