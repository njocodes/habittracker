// Main Habit Tracker Page - Komplett neu implementiert

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Plus, Calendar, List, Grid } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/HabitCard';
import { Habit } from '@/types/habits';
import { AddHabitModal } from '@/components/AddHabitModal';
import { EditHabitModal } from '@/components/EditHabitModal';
import { CalendarView } from '@/components/CalendarView';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { format, subDays } from 'date-fns';

type ViewMode = 'list' | 'grid' | 'calendar';
type TimeFilter = 'today' | 'week' | 'month';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const {
    habits,
    entries,
    isLoading,
    addHabit,
    deleteHabit,
    updateHabit,
    toggleHabitEntry,
    isHabitCompletedOnDate,
    getHabitStats,
  } = useHabits();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const getProgressDots = (habitId: string, days: number) => {
    const dots = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      dots.unshift(isHabitCompletedOnDate(habitId, format(date, 'yyyy-MM-dd')));
    }
    return dots;
  };

  // Memoize habit completion status to ensure re-render when entries change
  const habitCompletionStatus = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const status: Record<string, boolean> = {};
    habits.forEach(habit => {
      status[habit.id] = isHabitCompletedOnDate(habit.id, today);
    });
    return status;
  }, [habits, entries, isHabitCompletedOnDate]);

  const getDaysForTimeFilter = () => {
    switch (timeFilter) {
      case 'today':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      default:
        return 7;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const stats = getHabitStats();
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black shadow-2xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Habits</h1>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300 mt-1">
              <span>{stats.total_habits} Gewohnheiten</span>
              <span>•</span>
              <span>{stats.completed_today} heute erledigt</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0">
            <ProfileDropdown user={session.user} />
          </div>
        </div>
        
        {/* Mobile Stats - Only visible on small screens */}
        <div className="sm:hidden mt-3 flex items-center space-x-4 text-sm text-gray-300">
          <span>{stats.total_habits} Gewohnheiten</span>
          <span>•</span>
          <span>{stats.completed_today} heute erledigt</span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-6">
          <div className="bg-black shadow-xl rounded-xl p-3 sm:p-4 border border-gray-800 hover:shadow-2xl transition-shadow">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.total_habits}</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Gewohnheiten</div>
          </div>
          <div className="bg-black shadow-xl rounded-xl p-3 sm:p-4 border border-gray-800 hover:shadow-2xl transition-shadow">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.completed_today}</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Heute erledigt</div>
          </div>
          <div className="bg-black shadow-xl rounded-xl p-3 sm:p-4 border border-gray-800 hover:shadow-2xl transition-shadow">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.completion_rate}%</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium">Erfolgsrate</div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between mt-6 sm:mt-8">
          <div className="flex space-x-1 bg-black shadow-xl rounded-xl p-1 border border-gray-800">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-gray-600 shadow-sm text-white' : 'hover:bg-gray-600 text-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-gray-600 shadow-sm text-white' : 'hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'calendar' ? 'bg-gray-600 shadow-sm text-white' : 'hover:bg-gray-600 text-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          <div className="flex space-x-1 bg-black shadow-xl rounded-xl p-1 border border-gray-800">
            {(['today', 'week', 'month'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  timeFilter === filter ? 'bg-gray-600 shadow-sm text-white' : 'hover:bg-gray-600 text-gray-300'
                }`}
              >
                {filter === 'today' ? 'Heute' : filter === 'week' ? 'Woche' : 'Monat'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 sm:py-8">
        {habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-black shadow-lg rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Noch keine Gewohnheiten</h3>
            <p className="text-gray-300 mb-6">Starte deine Reise zu besseren Gewohnheiten</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Erste Gewohnheit hinzufügen
            </button>
          </motion.div>
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <CalendarView
                habits={habits}
                isHabitCompletedOnDate={isHabitCompletedOnDate}
                onToggleHabit={toggleHabitEntry}
              />
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : 'space-y-4'
              }>
                {habits.map((habit) => {
                  const isCompletedToday = habitCompletionStatus[habit.id] || false;
                  const progressDots = getProgressDots(habit.id, getDaysForTimeFilter());
                  
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={isCompletedToday}
                      onToggle={() => toggleHabitEntry(habit.id, today)}
                      onEdit={() => {
                        setEditingHabit(habit);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={() => deleteHabit(habit.id)}
                      progressDots={progressDots}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button */}
      {habits.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 bg-white text-black w-14 h-14 rounded-full shadow-lg hover:bg-gray-200 transition-colors flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHabit={addHabit}
      />

      {/* Edit Habit Modal */}
      <EditHabitModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHabit(null);
        }}
        onUpdateHabit={updateHabit}
        habit={editingHabit}
      />
    </div>
  );
}