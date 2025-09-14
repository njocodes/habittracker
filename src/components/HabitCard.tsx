'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { Habit } from '@/types/habits';
import { Check, X, MoreVertical, Trash2 } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  progressDots: boolean[];
}

export function HabitCard({ habit, isCompleted, onToggle, onEdit, onDelete, progressDots }: HabitCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0], [0.3, 1]);
  
  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir] }) => {
      setIsDragging(down);
      
      if (!down) {
        // Snap back to original position
        x.set(0);
        return;
      }
      
      // Only allow left swipe (negative direction)
      if (xDir < 0) {
        x.set(Math.max(mx, -120));
      }
    },
    {
      axis: 'x',
      bounds: cardRef,
      rubberband: true,
    }
  );
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

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="relative overflow-hidden mb-3">
      {/* Action Buttons (behind card) */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-red-500 to-red-400 flex items-center justify-end pr-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleDelete}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              showDeleteConfirm 
                ? 'bg-white text-red-500' 
                : 'bg-white bg-opacity-20 text-white'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        ref={cardRef}
        style={{ x, opacity }}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 relative z-10"
        whileTap={{ scale: isDragging ? 0.98 : 1 }}
        {...(bind() as Record<string, unknown>)}
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

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
            Tap again to delete
          </div>
        )}
      </motion.div>
    </div>
  );
}
