'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Habit } from '@/types/habits';

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateHabit: (id: string, updatedHabit: Partial<Habit>) => Promise<void>;
  habit: Habit | null;
}

const colorOptions = [
  { name: 'red', display: 'Rot', class: 'bg-red-500' },
  { name: 'blue', display: 'Blau', class: 'bg-blue-500' },
  { name: 'green', display: 'Grün', class: 'bg-green-500' },
  { name: 'yellow', display: 'Gelb', class: 'bg-yellow-500' },
  { name: 'purple', display: 'Lila', class: 'bg-purple-500' },
  { name: 'pink', display: 'Pink', class: 'bg-pink-500' },
  { name: 'indigo', display: 'Indigo', class: 'bg-indigo-500' },
  { name: 'orange', display: 'Orange', class: 'bg-orange-500' },
];

const iconOptions = ['💧', '🏃', '📚', '💪', '🧘', '🍎', '💤', '🎯', '📝', '🎵', '🌱', '⚡'];

export function EditHabitModal({ isOpen, onClose, onUpdateHabit, habit }: EditHabitModalProps) {
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitIcon, setHabitIcon] = useState('💧');
  const [colorOption, setColorOption] = useState('blue');
  const [targetFrequency, setTargetFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetCount, setTargetCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (habit) {
      setHabitName(habit.name);
      setHabitDescription(habit.description || '');
      setHabitIcon(habit.icon);
      setColorOption(habit.color);
      setTargetFrequency(habit.target_frequency);
      setTargetCount(habit.target_count);
    }
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit || !habitName.trim()) return;

    setIsLoading(true);
    try {
      await onUpdateHabit(habit.id, {
        name: habitName.trim(),
        description: habitDescription.trim() || null,
        icon: habitIcon,
        color: colorOption,
        target_frequency: targetFrequency,
        target_count: targetCount,
      });
      onClose();
    } catch (error) {
      console.error('Error updating habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !habit) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-black rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">Habit bearbeiten</h2>
            <p className="text-gray-500 mt-1 text-sm">Bearbeiten Sie Ihre Gewohnheit</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 group"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Name *
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 text-sm"
              placeholder="z.B. 3L Wasser trinken"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Beschreibung
            </label>
            <textarea
              value={habitDescription}
              onChange={(e) => setHabitDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 text-sm resize-none"
              placeholder="Optionale Beschreibung..."
              rows={2}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setHabitIcon(icon)}
                  className={`p-2 rounded-lg text-lg transition-all duration-300 ${
                    icon === habitIcon
                      ? 'bg-white text-black scale-110 shadow-xl'
                      : 'bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:scale-105'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Farbe
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setColorOption(color.name)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    color.name === colorOption
                      ? 'ring-2 ring-white scale-110 shadow-xl bg-gray-900'
                      : 'hover:scale-105 bg-gray-900/50 hover:bg-gray-900'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${color.class} mx-auto shadow-lg`} />
                  <span className="text-white text-xs mt-1 block font-medium">{color.display}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency and Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Häufigkeit
              </label>
              <select
                value={targetFrequency}
                onChange={(e) => setTargetFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 text-sm"
              >
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Ziel-Anzahl
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-300"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading || !habitName.trim()}
              className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Speichern...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Speichern</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
