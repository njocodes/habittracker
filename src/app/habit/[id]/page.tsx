'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Check, X, Calendar, List, Target } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { Habit } from '@/types/habits';

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;
  
  const { habits, getHabitStats, isHabitCompletedOnDate, toggleHabitEntry } = useHabits();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [stats, setStats] = useState<{
    completedDays: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  } | null>(null);
  const [viewMode] = useState<'daily' | 'weekly' | 'yearly'>('daily');

  useEffect(() => {
    const foundHabit = habits.find(h => h.id === habitId);
    if (foundHabit) {
      setHabit(foundHabit);
      setStats(getHabitStats(habitId));
    } else {
      router.push('/');
    }
  }, [habits, habitId, getHabitStats, router]);

  if (!habit || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = isHabitCompletedOnDate(habitId, today);


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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{habit.name}</h1>
              <p className="text-sm text-gray-500">{habit.description}</p>
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-16 h-16 ${colors.light} rounded-full flex items-center justify-center`}>
            <span className="text-3xl">{habit.icon}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{stats.completedDays}</h2>
            <p className="text-gray-500">Abgeschlossene Aufgaben</p>
          </div>
        </div>

        {/* Streak Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
            <div className="text-sm text-gray-500">Aktuelle Serie</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.longestStreak}</div>
            <div className="text-sm text-gray-500">Längste Serie</div>
          </div>
        </div>
      </div>

      {/* Today's Action */}
      <div className="mx-4 mt-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Heute</h3>
              <p className="text-sm text-gray-500">Hast du heute {habit.name.toLowerCase()} gemacht?</p>
            </div>
            <button
              onClick={() => toggleHabitEntry(habitId, today)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCompletedToday
                  ? `${colors.dark} text-white`
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
            >
              {isCompletedToday ? (
                <Check className="w-6 h-6" />
              ) : (
                <X className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Frequency Options */}
      <div className="mx-4 mt-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Häufigkeit</h3>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              viewMode === 'daily' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Täglich</span>
              </div>
              <span className="text-sm text-gray-500">Jeden Tag</span>
            </div>
            
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              viewMode === 'weekly' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium">Wöchentlich</span>
              </div>
              <span className="text-sm text-gray-500">Pro Woche</span>
            </div>
            
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              viewMode === 'yearly' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <List className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Jährlich</span>
              </div>
              <span className="text-sm text-gray-500">Überblick</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="mx-4 mt-4 mb-20">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Fortschritt</h3>
          
          {/* Progress Dots Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (27 - i));
              const dateStr = date.toISOString().split('T')[0];
              const isCompleted = isHabitCompletedOnDate(habitId, dateStr);
              
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    isCompleted ? colors.dark : colors.light
                  }`}
                  title={date.toLocaleDateString()}
                />
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">
              Letzte 28 Tage • {stats.completionRate.toFixed(0)}% abgeschlossen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
