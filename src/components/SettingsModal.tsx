'use client';

import { useState } from 'react';
import { X, User, Bell, Moon, Sun, Globe, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'privacy'>('profile');
  const [settings, setSettings] = useState({
    notifications: {
      dailyReminder: true,
      weeklySummary: true,
      streakReminders: true,
    },
    appearance: {
      theme: 'system' as 'light' | 'dark' | 'system',
      language: 'de',
    },
    privacy: {
      shareProgress: false,
      showInLeaderboard: false,
    }
  });

  if (!isOpen) return null;

  const updateSetting = (category: string, key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'appearance', label: 'Erscheinungsbild', icon: Moon },
    { id: 'privacy', label: 'Datenschutz', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-2xl shadow-2xl max-w-5xl w-full h-[700px] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Einstellungen</h2>
            <p className="text-sm text-gray-400 mt-1">Verwalten Sie Ihre Präferenzen</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-56 bg-gray-900/50 border-r border-gray-800">
            <nav className="p-6 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'notifications' | 'appearance' | 'privacy')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-black shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white">Profil-Einstellungen</h3>
                  <p className="text-gray-400 mt-2">Verwalten Sie Ihre persönlichen Informationen</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Name
                    </label>
                    <input
                      type="text"
                      value={user.name || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-white transition-all duration-200"
                      placeholder="Ihr Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-2">E-Mail kann nicht geändert werden</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Benachrichtigungen</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Tägliche Erinnerung</h4>
                      <p className="text-sm text-gray-500">Erinnert Sie täglich an Ihre Habits</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'dailyReminder', !settings.notifications.dailyReminder)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.dailyReminder ? 'bg-white' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.dailyReminder ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Wöchentliche Zusammenfassung</h4>
                      <p className="text-sm text-gray-500">Zeigt Ihre Fortschritte der Woche</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'weeklySummary', !settings.notifications.weeklySummary)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.weeklySummary ? 'bg-white' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.weeklySummary ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Streak-Erinnerungen</h4>
                      <p className="text-sm text-gray-500">Erinnert Sie an laufende Streaks</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'streakReminders', !settings.notifications.streakReminders)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.streakReminders ? 'bg-white' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.streakReminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Erscheinungsbild</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Theme
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'light', label: 'Hell', icon: Sun },
                        { value: 'dark', label: 'Dunkel', icon: Moon },
                        { value: 'system', label: 'System', icon: Globe },
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value={option.value}
                              checked={settings.appearance.theme === option.value}
                              onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                              className="text-white "
                            />
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sprache
                    </label>
                    <select
                      value={settings.appearance.language}
                      onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Datenschutz</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Fortschritt teilen</h4>
                      <p className="text-sm text-gray-500">Erlauben Sie Freunden, Ihren Fortschritt zu sehen</p>
                    </div>
                    <button
                      onClick={() => updateSetting('privacy', 'shareProgress', !settings.privacy.shareProgress)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.privacy.shareProgress ? 'bg-white' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.privacy.shareProgress ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">In Bestenliste anzeigen</h4>
                      <p className="text-sm text-gray-500">Zeigen Sie sich in der globalen Bestenliste</p>
                    </div>
                    <button
                      onClick={() => updateSetting('privacy', 'showInLeaderboard', !settings.privacy.showInLeaderboard)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.privacy.showInLeaderboard ? 'bg-white' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.privacy.showInLeaderboard ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-8 border-t border-gray-800 bg-gray-900/30">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all duration-200"
          >
            Abbrechen
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-black bg-white rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
