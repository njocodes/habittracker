// Habit Card Component - Komplett neu implementiert

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { HabitCardProps } from '@/types/habits';

export function HabitCard({ 
  habit, 
  isCompleted, 
  onToggle, 
  onEdit, 
  onDelete, 
  progressDots 
}: HabitCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getFrequencyText = () => {
    switch (habit.target_frequency) {
      case 'daily':
        return 'Täglich';
      case 'weekly':
        return 'Wöchentlich';
      case 'custom':
        return `Alle ${habit.target_count || 1} Tage`;
      default:
        return 'Täglich';
    }
  };

  const getHabitColor = () => {
    const colors: Record<string, { light: string; dark: string }> = {
      blue: { light: 'bg-blue-100', dark: 'bg-blue-500' },
      green: { light: 'bg-green-100', dark: 'bg-green-500' },
      purple: { light: 'bg-purple-100', dark: 'bg-purple-500' },
      orange: { light: 'bg-orange-100', dark: 'bg-orange-500' },
      red: { light: 'bg-red-100', dark: 'bg-red-500' },
      yellow: { light: 'bg-yellow-100', dark: 'bg-yellow-500' },
    };
    return colors[habit.color] || colors.blue;
  };

  const colors = getHabitColor();

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{habit.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{habit.name}</h3>
            <p className="text-sm text-gray-500">{getFrequencyText()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          
          <button
            onClick={handleDelete}
            className={`p-1 rounded transition-colors ${
              showDeleteConfirm
                ? 'bg-red-100 text-red-600'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isCompleted
                ? `${colors.dark} text-white`
                : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
            }`}
          >
            {isCompleted ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {progressDots.map((isCompleted, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              isCompleted ? colors.dark : colors.light
            }`}
          />
        ))}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          Nochmal tippen zum Löschen
        </div>
      )}
    </motion.div>
  );
}