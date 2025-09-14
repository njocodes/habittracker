'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Users, Share2, ChevronDown } from 'lucide-react';
import { sql } from '@/lib/database';
import { signOut } from 'next-auth/react';

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
  const [showShareCode, setShowShareCode] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [friends, setFriends] = useState<{
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
  }[]>([]);
  const [shareCodeInput, setShareCodeInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowShareCode(false);
        setShowFriends(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    try {
      const friendsData = await sql`
        SELECT fc.*, u.email, u.full_name, u.avatar_url
        FROM friend_connections fc
        LEFT JOIN users u ON fc.friend_id = u.id
        WHERE fc.user_id = ${user.id} AND fc.status = 'accepted'
      `;
      setFriends((friendsData as typeof friends) || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!shareCodeInput.trim()) return;

    try {
      await sql`
        INSERT INTO friend_connections (user_id, share_code, status)
        VALUES (${user.id}, ${shareCodeInput.trim()}, 'pending')
      `;
      
      setShareCodeInput('');
      setShowShareCode(false);
      loadFriends();
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const copyShareCode = () => {
    // TODO: Get share code from user data
    navigator.clipboard.writeText('SHARE123');
    // You could add a toast notification here
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.email || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user.name || 'Unnamed User'}
                </p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Share Code */}
            <div className="px-4 py-2">
              <button
                onClick={() => setShowShareCode(!showShareCode)}
                className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2"
              >
                <Share2 className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Mein Share Code</span>
              </button>
              
              {showShareCode && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      SHARE123
                    </code>
                    <button
                      onClick={copyShareCode}
                      className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Kopieren
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Teile diesen Code mit Freunden, um deine Gewohnheiten zu verfolgen
                  </p>
                </div>
              )}
            </div>

            {/* Friends */}
            <div className="px-4 py-2">
              <button
                onClick={() => setShowFriends(!showFriends)}
                className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2"
              >
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Freunde ({friends.length})</span>
              </button>
              
              {showFriends && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {/* Add Friend */}
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      placeholder="Share Code eingeben"
                      value={shareCodeInput}
                      onChange={(e) => setShareCodeInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddFriend}
                      className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Hinzufügen
                    </button>
                  </div>
                  
                  {/* Friends List */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {friends.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Noch keine Freunde hinzugefügt
                      </p>
                    ) : (
                      friends.map((friend) => (
                        <div key={friend.id} className="flex items-center space-x-2 p-2 bg-white rounded">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="text-sm text-gray-700 truncate">
                            {friend.full_name || friend.email || 'Unbekannt'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 mx-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">Einstellungen</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full text-left hover:bg-red-50 rounded-lg p-2 mx-2 text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
