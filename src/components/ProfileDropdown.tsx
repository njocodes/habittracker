// Profile Dropdown Component - Komplett neu implementiert

'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { SettingsModal } from './SettingsModal';

interface ProfileDropdownProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || user.email || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-black rounded-lg shadow-2xl border border-gray-800 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.email || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {user.name || 'Unnamed User'}
                </p>
                <p className="text-sm text-gray-300 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button 
              onClick={() => {
                setIsSettingsOpen(true);
                setIsOpen(false);
              }}
              className="flex items-center space-x-3 w-full text-left hover:bg-gray-800 px-4 py-2"
            >
              <Settings className="w-4 h-4 text-gray-300" />
              <span className="text-gray-300">Einstellungen</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full text-left hover:bg-red-900 px-4 py-2 text-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />
    </div>
  );
}