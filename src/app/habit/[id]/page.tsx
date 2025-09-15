// Habit Detail Page - Komplett neu implementiert

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, Calendar, BarChart3 } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';

export default function HabitDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const habitId = params.id as string;

  const {
    habits,
    isLoading,
    deleteHabit,
    toggleHabitEntry,
    isHabitCompletedOnDate,
  } = useHabits();

  const [habit, setHabit] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    if (habits.length > 0) {
      const foundHabit = habits.find(h => h.id === habitId);
      setHabit(foundHabit);
    }
  }, [habits, habitId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Gewohnheit nicht gefunden</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const getDaysForPeriod = () => {
    const now = new Date();
    if (selectedPeriod === 'week') {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      return eachDayOfInterval({
        start: subDays(now, 29),
        end: now
      });
    }
  };

  const days = getDaysForPeriod();
  const completedDays = days.filter(day => 
    isHabitCompletedOnDate(habit.id, format(day, 'yyyy-MM-dd'))
  ).length;

  const completionRate = Math.round((completedDays / days.length) * 100);

  const getHabitColor = () => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
    };
    return colors[habit.color] || colors.blue;
  };

  const handleDelete = async () => {
    if (confirm('Möchtest du diese Gewohnheit wirklich löschen?')) {
      await deleteHabit(habit.id);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{habit.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{habit.name}</h1>
                {habit.description && (
                  <p className="text-gray-600">{habit.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {}} // TODO: Implement edit
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{completedDays}</div>
            <div className="text-sm text-gray-600">
              {selectedPeriod === 'week' ? 'Diese Woche' : 'Letzte 30 Tage'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
            <div className="text-sm text-gray-600">Erfolgsrate</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {habit.target_frequency === 'daily' ? 'Täglich' : 
               habit.target_frequency === 'weekly' ? 'Wöchentlich' : 
               `Alle ${habit.target_count} Tage`}
            </div>
            <div className="text-sm text-gray-600">Ziel</div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              selectedPeriod === 'week' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Woche
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              selectedPeriod === 'month' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Monat
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayString = format(day, 'yyyy-MM-dd');
              const isCompleted = isHabitCompletedOnDate(habit.id, dayString);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

              return (
                <button
                  key={dayString}
                  onClick={() => toggleHabitEntry(habit.id, dayString)}
                  className={`
                    h-12 rounded-lg transition-all hover:scale-105
                    ${isCompleted 
                      ? `${getHabitColor()} text-white` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}