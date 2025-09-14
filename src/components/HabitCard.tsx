'use client';

import { Habit } from '@/types/habits';
import { Check, X } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  progressDots: boolean[];
}

export function HabitCard({ habit, isCompleted, onToggle, progressDots }: HabitCardProps) {
  const getFrequencyText = () => {
    switch (habit.targetFrequency) {
      case 'daily':
        return 'Everyday';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        return `${habit.targetCount} times/week`;
      default:
        return 'Daily';
    }
  };

  const getHabitColor = (color: string) => {
    const colorMap: Record<string, { light: string; dark: string }> = {
      green: { light: 'bg-green-200', dark: 'bg-green-500' },
      blue: { light: 'bg-blue-200', dark: 'bg-blue-500' },
      yellow: { light: 'bg-yellow-200', dark: 'bg-yellow-500' },
      purple: { light: 'bg-purple-200', dark: 'bg-purple-500' },
      red: { light: 'bg-red-200', dark: 'bg-red-500' },
      orange: { light: 'bg-orange-200', dark: 'bg-orange-500' },
    };
    return colorMap[color] || colorMap.green;
  };

  const colors = getHabitColor(habit.color);

  return (
    <div className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{habit.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{habit.name}</h3>
            <p className="text-sm text-gray-500">{getFrequencyText()}</p>
          </div>
        </div>
        
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

      {/* Progress Dots */}
      <div className="grid grid-cols-7 gap-1">
        {progressDots.map((isCompleted, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              isCompleted ? colors.dark : colors.light
            }`}
          />
        ))}
      </div>
    </div>
  );
}
