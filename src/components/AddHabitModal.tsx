// Add Habit Modal Component - Komplett neu implementiert

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { AddHabitModalProps } from '@/types/habits';

const HABIT_COLORS = [
  { name: 'blue', label: 'Blau', class: 'bg-blue-500' },
  { name: 'green', label: 'Grün', class: 'bg-green-500' },
  { name: 'purple', label: 'Lila', class: 'bg-purple-500' },
  { name: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { name: 'red', label: 'Rot', class: 'bg-red-500' },
  { name: 'yellow', label: 'Gelb', class: 'bg-yellow-500' },
];

const HABIT_ICONS = [
  '📝', '🏃', '💧', '📚', '🧘', '🍎', '💤', '🎯',
  '💪', '🌱', '🎨', '🎵', '🚶', '🧠', '❤️', '⭐'
];

export function AddHabitModal({ isOpen, onClose, onAddHabit }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [icon, setIcon] = useState('📝');
  const [targetFrequency, setTargetFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [targetCount, setTargetCount] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    onAddHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
      target_frequency: targetFrequency,
      target_count: targetFrequency === 'custom' ? targetCount : undefined,
      is_active: true,
    });

    // Reset form
    setName('');
    setDescription('');
    setColor('blue');
    setIcon('📝');
    setTargetFrequency('daily');
    setTargetCount(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Neue Gewohnheit</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-400 text-gray-900"
                  placeholder="z.B. 10.000 Schritte gehen"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-400 text-gray-900"
                  placeholder="Optionale Beschreibung..."
                  rows={3}
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {HABIT_ICONS.map((habitIcon) => (
                    <button
                      key={habitIcon}
                      type="button"
                      onClick={() => setIcon(habitIcon)}
                      className={`w-10 h-10 rounded-lg border-2 transition-colors ${
                        icon === habitIcon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{habitIcon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farbe
                </label>
                <div className="flex space-x-2">
                  {HABIT_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.name}
                      type="button"
                      onClick={() => setColor(colorOption.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-colors ${
                        color === colorOption.name
                          ? 'border-gray-800'
                          : 'border-gray-300'
                      } ${colorOption.class}`}
                      title={colorOption.label}
                    />
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Häufigkeit
                </label>
                <select
                  value={targetFrequency}
                  onChange={(e) => setTargetFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-400 text-gray-900"
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="custom">Benutzerdefiniert</option>
                </select>
              </div>

              {/* Custom Frequency */}
              {targetFrequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alle X Tage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetCount}
                    onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-400 text-gray-900"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hinzufügen</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}