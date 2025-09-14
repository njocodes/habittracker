'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, BarChart3, List, Grid } from 'lucide-react';
import { useHabitsDB } from '@/hooks/useHabitsDB';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitModal } from '@/components/AddHabitModal';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { useSession } from 'next-auth/react';
import { format, subDays } from 'date-fns';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'overall'>('overall');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    habits,
    isLoading,
    addHabit,
    deleteHabit,
    toggleHabitEntry,
    isHabitCompletedOnDate,
  } = useHabitsDB();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const today = format(new Date(), 'yyyy-MM-dd');

  const getProgressDots = (habitId: string, days: number) => {
    const dots = [];
    const startDate = subDays(new Date(), days - 1);
    
    for (let i = 0; i < days; i++) {
      const date = format(subDays(startDate, -i), 'yyyy-MM-dd');
      dots.push(isHabitCompletedOnDate(habitId, date));
    }
    
    return dots;
  };

  const getDaysForView = () => {
    switch (activeTab) {
      case 'today':
        return 1;
      case 'weekly':
        return 7;
      case 'overall':
        return 28; // 4 weeks
      default:
        return 28;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <BarChart3 className="w-5 h-5 text-gray-600" />
            </button>
            <ProfileDropdown user={session.user} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mt-6 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'today', label: 'Today' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'overall', label: 'Overall' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'today' | 'weekly' | 'overall')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-500 mb-6">Start building good habits by adding your first one</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const isCompletedToday = isHabitCompletedOnDate(habit.id, today);
              const progressDots = getProgressDots(habit.id, getDaysForView());
              
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompletedToday}
                  onToggle={() => toggleHabitEntry(habit.id, today)}
                  onEdit={() => {}} // TODO: Implement edit
                  onDelete={() => deleteHabit(habit.id)}
                  progressDots={progressDots}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add Habit Button */}
      {habits.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-center space-x-8">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-6 h-6" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHabit={addHabit}
      />
    </div>
  );
}