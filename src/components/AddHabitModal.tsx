'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Habit } from '@/types/habits';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
}

const HABIT_ICONS = [
  '📖', '💪', '💊', '🚶‍♀️', '🧘‍♀️', '💧', '🍎', '📝', '🎯', '🌟',
  '🏃‍♂️', '🎨', '🎵', '📚', '☕', '🌱', '💤', '🧠', '❤️', '🔥'
];

const HABIT_COLORS = [
  { name: 'green', class: 'bg-green-500' },
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'yellow', class: 'bg-yellow-500' },
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'red', class: 'bg-red-500' },
  { name: 'orange', class: 'bg-orange-500' },
];

export function AddHabitModal({ isOpen, onClose, onAddHabit }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📖');
  const [color, setColor] = useState('green');
  const [targetFrequency, setTargetFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [targetCount, setTargetCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    onAddHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      targetFrequency,
      targetCount: targetFrequency === 'custom' ? targetCount : undefined,
      isActive: true,
    });

    // Reset form
    setName('');
    setDescription('');
    setIcon('📖');
    setColor('green');
    setTargetFrequency('daily');
    setTargetCount(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Habit</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Reading, Workout, Meditation"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a description for this habit"
              rows={2}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {HABIT_ICONS.map((iconEmoji) => (
                <button
                  key={iconEmoji}
                  type="button"
                  onClick={() => setIcon(iconEmoji)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    icon === iconEmoji
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{iconEmoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Color
            </label>
            <div className="flex space-x-2">
              {HABIT_COLORS.map((colorOption) => (
                <button
                  key={colorOption.name}
                  type="button"
                  onClick={() => setColor(colorOption.name)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption.name
                      ? 'border-gray-800'
                      : 'border-gray-300'
                  } ${colorOption.class}`}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  checked={targetFrequency === 'daily'}
                  onChange={(e) => setTargetFrequency(e.target.value as 'daily')}
                  className="mr-2"
                />
                <span className="text-sm">Everyday</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  checked={targetFrequency === 'weekly'}
                  onChange={(e) => setTargetFrequency(e.target.value as 'weekly')}
                  className="mr-2"
                />
                <span className="text-sm">Weekly</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="frequency"
                  value="custom"
                  checked={targetFrequency === 'custom'}
                  onChange={(e) => setTargetFrequency(e.target.value as 'custom')}
                  className="mr-2"
                />
                <span className="text-sm">
                  Custom: 
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={targetCount}
                    onChange={(e) => setTargetCount(parseInt(e.target.value))}
                    className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    disabled={targetFrequency !== 'custom'}
                  />
                  times per week
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
