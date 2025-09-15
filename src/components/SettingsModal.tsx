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
  onNameUpdate?: (newName: string) => void;
}

export function SettingsModal({ isOpen, onClose, user, onNameUpdate }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'privacy'>('profile');
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
  });
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

  const handleSave = async () => {
    try {
      // Update the name in the parent component
      if (onNameUpdate && profileData.name !== user.name) {
        onNameUpdate(profileData.name);
      }
      // TODO: Implement API call to save profile data and settings
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'appearance', label: 'Erscheinungsbild', icon: Moon },
    { id: 'privacy', label: 'Datenschutz', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-1 sm:p-2">
      <div className="bg-black rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Einstellungen</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row h-full">
          {/* Sidebar */}
          <div className="w-full sm:w-48 bg-gray-900/30 border-b sm:border-b-0 sm:border-r border-gray-800 flex-shrink-0">
            <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'notifications' | 'appearance' | 'privacy')}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Profil-Einstellungen</h3>
                  <p className="text-gray-400 mt-1 text-sm sm:text-base">Verwalten Sie Ihre persönlichen Informationen</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white text-sm"
                      placeholder="Ihr Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">E-Mail kann nicht geändert werden</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Benachrichtigungen</h3>
                  <p className="text-gray-400 mt-1 text-sm sm:text-base">Verwalten Sie Ihre Benachrichtigungseinstellungen</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/30 rounded-lg sm:rounded-xl border border-gray-800">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-white">Tägliche Erinnerung</h4>
                      <p className="text-gray-400 mt-1 text-xs sm:text-sm">Erinnert Sie täglich an Ihre Habits</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'dailyReminder', !settings.notifications.dailyReminder)}
                      className={`relative inline-flex h-6 w-11 sm:h-8 sm:w-14 items-center rounded-full transition-all duration-300 flex-shrink-0 ml-3 ${
                        settings.notifications.dailyReminder ? 'bg-white' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 sm:h-6 sm:w-6 transform rounded-full bg-black transition-transform duration-300 ${
                          settings.notifications.dailyReminder ? 'translate-x-5 sm:translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/30 rounded-lg sm:rounded-xl border border-gray-800">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-white">Wöchentliche Zusammenfassung</h4>
                      <p className="text-gray-400 mt-1 text-xs sm:text-sm">Zeigt Ihre Fortschritte der Woche</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'weeklySummary', !settings.notifications.weeklySummary)}
                      className={`relative inline-flex h-6 w-11 sm:h-8 sm:w-14 items-center rounded-full transition-all duration-300 flex-shrink-0 ml-3 ${
                        settings.notifications.weeklySummary ? 'bg-white' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 sm:h-6 sm:w-6 transform rounded-full bg-black transition-transform duration-300 ${
                          settings.notifications.weeklySummary ? 'translate-x-5 sm:translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/30 rounded-lg sm:rounded-xl border border-gray-800">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-white">Streak-Erinnerungen</h4>
                      <p className="text-gray-400 mt-1 text-xs sm:text-sm">Erinnert Sie an laufende Streaks</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'streakReminders', !settings.notifications.streakReminders)}
                      className={`relative inline-flex h-6 w-11 sm:h-8 sm:w-14 items-center rounded-full transition-all duration-300 flex-shrink-0 ml-3 ${
                        settings.notifications.streakReminders ? 'bg-white' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 sm:h-6 sm:w-6 transform rounded-full bg-black transition-transform duration-300 ${
                          settings.notifications.streakReminders ? 'translate-x-5 sm:translate-x-7' : 'translate-x-1'
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
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-800 bg-gray-900/30 space-y-2 sm:space-y-0">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            Änderungen werden automatisch gespeichert
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="px-4 sm:px-6 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
