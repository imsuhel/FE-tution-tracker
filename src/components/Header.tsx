"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell, Moon, MoreHorizontal, Menu, X, User, LogOut } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout, user } = useAuth();

  const userInitial = user?.email?.[0].toUpperCase() || "U";

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-4 md:px-8 py-4 bg-[#222222] text-neutral-100">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden flex items-center justify-center rounded-md p-1.5 -ml-1.5 hover:bg-neutral-800 transition-colors">
          <Menu className="h-6 w-6 text-neutral-400" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold">Overview</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 relative">
        {isSearchOpen ? (
          <div className="flex items-center bg-[#2b2b2b] rounded-full px-3 py-1.5 border border-neutral-700">
            <Search className="h-4 w-4 text-neutral-400" />
            <input 
              autoFocus
              type="text" 
              className="bg-transparent border-none outline-none text-sm text-neutral-100 ml-2 w-24 sm:w-32 md:w-48" 
              placeholder="Search..." 
            />
            <button onClick={() => setIsSearchOpen(false)} className="ml-2 hover:bg-neutral-700 rounded-full p-0.5">
              <X className="h-4 w-4 text-neutral-400" />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsSearchOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 hover:bg-neutral-800 transition-colors">
            <Search className="h-5 w-5 text-neutral-400" />
          </button>
        )}
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 hover:bg-neutral-800 transition-colors">
          <Bell className="h-5 w-5 text-neutral-400" />
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a4c2b5] text-neutral-900 transition-colors">
            <span className="font-bold">{userInitial}</span>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-[#2b2b2b] border border-neutral-700 shadow-lg py-1 z-50">
              <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="flex w-full items-center px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
              <button 
                onClick={logout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
        
        <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
          <MoreHorizontal className="h-5 w-5 text-neutral-400" />
        </button>
      </div>
    </header>
  );
}
