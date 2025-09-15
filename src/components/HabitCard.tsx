// Habit Card Component - Komplett neu implementiert

'use client';

import { useState, useRef } from 'react';
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
  const [isClicked, setIsClicked] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const getNextDueText = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (habit.target_frequency) {
      case 'daily':
        return isCompleted ? '✅ Heute erledigt' : '📅 Heute fällig';
      case 'weekly':
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
        const nextMondayStr = nextMonday.toISOString().split('T')[0];
        return isCompleted ? '✅ Diese Woche erledigt' : `📅 Fällig bis ${nextMonday.toLocaleDateString('de-DE', { weekday: 'long' })}`;
      case 'custom':
        const days = habit.target_count || 1;
        const nextDue = new Date(today);
        nextDue.setDate(today.getDate() + days);
        return isCompleted ? '✅ Erledigt' : `📅 Nächster Termin: ${nextDue.toLocaleDateString('de-DE')}`;
      default:
        return isCompleted ? '✅ Heute erledigt' : '📅 Heute fällig';
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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - startX;
    
    // Only allow left swipe
    if (deltaX < 0) {
      const swipeProgress = Math.min(Math.abs(deltaX) / 80, 1);
      setCurrentX(swipeProgress);
    }
  };

  const handleTouchEnd = () => {
    if (currentX > 0.5) {
      // Swipe threshold reached (50% of max swipe)
      setIsSwiped(true);
    } else {
      // Reset position
      setCurrentX(0);
      setIsSwiped(false);
    }
  };

  // Click handler for desktop
  const handleCardClick = () => {
    console.log('Card clicked, current isClicked:', isClicked);
    setIsClicked(!isClicked);
  };

  const showActions = isClicked || isSwiped;
  const swipeProgress = isSwiped ? 1 : currentX;
  const cardWidth = showActions ? `calc(100% - 80px)` : '100%';

  return (
    <div className="relative overflow-hidden">
      {/* Action Buttons - Hidden behind card */}
      <div className={`absolute right-0 top-0 h-full w-20 bg-gray-900 rounded-xl flex items-center justify-center space-x-2 pr-2 transition-opacity duration-300 ${
        showActions ? 'opacity-100' : 'opacity-0'
      }`}>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4 text-gray-300" />
        </button>
        
        <button
          onClick={handleDelete}
          className={`p-2 rounded-lg transition-colors ${
            showDeleteConfirm
              ? 'bg-red-900 text-red-300'
              : 'hover:bg-gray-800 text-gray-300'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>

      {/* Main Card */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          width: cardWidth
        }}
        exit={{ opacity: 0, y: -20 }}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-black rounded-xl shadow-xl border border-gray-800 p-6 hover:shadow-2xl hover:border-gray-600 transition-all duration-300 relative z-10 cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{habit.icon}</span>
            <div>
              <h3 className="font-semibold text-white">{habit.name}</h3>
              <p className="text-sm text-gray-300">{getFrequencyText()}</p>
              <p className="text-xs text-gray-400 mt-1">{getNextDueText()}</p>
            </div>
          </div>
          
          {/* Toggle Button - Markiert Habit als erledigt/nicht erledigt */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('🔘 Toggle button clicked for habit:', habit.id, 'isCompleted:', isCompleted);
              console.log('🔘 onToggle function:', onToggle);
              onToggle();
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              isCompleted
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            title={isCompleted ? 'Als nicht erledigt markieren' : 'Als erledigt markieren'}
          >
            {isCompleted ? (
              <Check className="w-5 h-5 text-green-100" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
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
          <div className="text-xs text-red-300 bg-red-900 px-2 py-1 rounded">
            Nochmal tippen zum Löschen
          </div>
        )}
      </motion.div>
    </div>
  );
}