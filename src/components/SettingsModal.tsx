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
      // Hier würde normalerweise ein API-Call gemacht werden, um die Profildaten zu speichern
      console.log('Saving profile data:', profileData);
      console.log('Saving settings:', settings);
      
      // Für jetzt schließen wir das Modal
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-6">
      <div className="bg-black rounded-3xl shadow-2xl max-w-6xl w-full h-[95vh] sm:h-[800px] overflow-hidden border border-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-10 py-4 sm:py-8 border-b border-gray-900">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-white">Einstellungen</h2>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Verwalten Sie Ihre Präferenzen</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 sm:p-4 hover:bg-gray-900 rounded-2xl transition-all duration-200 group"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row">
          {/* Sidebar */}
          <div className="w-full sm:w-64 bg-gray-900/30 border-b sm:border-b-0 sm:border-r border-gray-900">
            <nav className="p-4 sm:p-8 space-y-2 sm:space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'notifications' | 'appearance' | 'privacy')}
                    className={`w-full flex items-center space-x-3 sm:space-x-4 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white text-black shadow-xl scale-105'
                        : 'text-gray-400 hover:bg-gray-800/40 hover:text-white hover:scale-102'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-10 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6 sm:space-y-10">
                <div>
                  <h3 className="text-xl sm:text-3xl font-bold text-white">Profil-Einstellungen</h3>
                  <p className="text-gray-500 mt-2 sm:mt-3 text-sm sm:text-lg">Verwalten Sie Ihre persönlichen Informationen</p>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-lg font-semibold text-white mb-4">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-6 py-4 bg-gray-900 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 text-lg"
                      placeholder="Ihr Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-white mb-4">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-6 py-4 bg-gray-950 border border-gray-800 rounded-2xl text-gray-600 cursor-not-allowed text-lg"
                    />
                    <p className="text-sm text-gray-500 mt-3">E-Mail kann nicht geändert werden</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-3xl font-bold text-white">Benachrichtigungen</h3>
                  <p className="text-gray-500 mt-3 text-lg">Verwalten Sie Ihre Benachrichtigungseinstellungen</p>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
                    <div>
                      <h4 className="text-xl font-semibold text-white">Tägliche Erinnerung</h4>
                      <p className="text-gray-400 mt-2">Erinnert Sie täglich an Ihre Habits</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'dailyReminder', !settings.notifications.dailyReminder)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                        settings.notifications.dailyReminder ? 'bg-white' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-black transition-transform duration-300 ${
                          settings.notifications.dailyReminder ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
                    <div>
                      <h4 className="text-xl font-semibold text-white">Wöchentliche Zusammenfassung</h4>
                      <p className="text-gray-400 mt-2">Zeigt Ihre Fortschritte der Woche</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'weeklySummary', !settings.notifications.weeklySummary)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                        settings.notifications.weeklySummary ? 'bg-white' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-black transition-transform duration-300 ${
                          settings.notifications.weeklySummary ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
                    <div>
                      <h4 className="text-xl font-semibold text-white">Streak-Erinnerungen</h4>
                      <p className="text-gray-400 mt-2">Erinnert Sie an laufende Streaks</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notifications', 'streakReminders', !settings.notifications.streakReminders)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                        settings.notifications.streakReminders ? 'bg-white' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-black transition-transform duration-300 ${
                          settings.notifications.streakReminders ? 'translate-x-7' : 'translate-x-1'
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
        <div className="flex items-center justify-end space-x-6 px-10 py-8 border-t border-gray-900 bg-gray-950/50">
          <button
            onClick={onClose}
            className="px-8 py-4 text-lg font-semibold text-gray-300 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800 hover:text-white transition-all duration-300"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-4 text-lg font-semibold text-black bg-white rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
