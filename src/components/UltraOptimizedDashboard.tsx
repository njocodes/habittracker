'use client';

import { memo, Suspense } from 'react';
import { useMinimalHabits } from '@/hooks/useMinimalHabits';
import OptimizedLoading from './OptimizedLoading';
import PerformanceOptimizedLayout from './PerformanceOptimizedLayout';

const DashboardContent = memo(function DashboardContent() {
  const {
    habits,
    entries,
    isLoading,
    error,
    addHabit,
    deleteHabit,
    updateHabit,
    toggleHabitEntry,
    isHabitCompletedOnDate,
    getHabitStats,
    forceRefresh,
    cacheInfo
  } = useMinimalHabits();

  const stats = getHabitStats('week');

  const handleAddHabit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name.trim()) return;

    await addHabit({
      name,
      description: description || '',
      color: '#3B82F6',
      icon: '📝',
      target_frequency: 'daily',
      target_count: 1,
      user_id: '',
    });

    e.currentTarget.reset();
  };

  const getDateRange = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Fehler beim Laden der Daten</div>
          <button
            onClick={forceRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header mit Cache Info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">
              Cache: {cacheInfo.cached ? '✅ Aktiv' : '❌ Inaktiv'} | 
              Letzter Request: {new Date(cacheInfo.lastRequest).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={forceRefresh}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Gesamt Habits</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_habits}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Heute erledigt</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed_today}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Erfolgsrate</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.completion_rate}%</p>
          </div>
        </div>

        {/* Add Habit Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold mb-4">Neuen Habit hinzufügen</h3>
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 10.000 Schritte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <input
                  type="text"
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Hinzufügen
            </button>
          </form>
        </div>

        {/* Habits List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Meine Habits</h3>
          {habits.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Noch keine Habits vorhanden</p>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => (
                <div key={habit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{habit.name}</h4>
                      {habit.description && (
                        <p className="text-sm text-gray-600">{habit.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateHabit(habit.id, { 
                          name: prompt('Neuer Name:', habit.name) || habit.name 
                        })}
                        className="text-blue-500 hover:text-blue-700 text-sm transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {/* Weekly Calendar */}
                  <div className="grid grid-cols-7 gap-2">
                    {getDateRange().map((date) => {
                      const isCompleted = isHabitCompletedOnDate(habit.id, date);
                      const isToday = date === new Date().toISOString().split('T')[0];
                      
                      return (
                        <button
                          key={date}
                          onClick={() => toggleHabitEntry(habit.id, date)}
                          className={`h-8 w-8 rounded text-xs font-medium transition-all duration-200 ${
                            isCompleted
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : isToday
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {new Date(date).getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const UltraOptimizedDashboard = memo(function UltraOptimizedDashboard() {
  return (
    <PerformanceOptimizedLayout>
      <Suspense fallback={<OptimizedLoading size="lg" text="Dashboard wird geladen..." />}>
        <DashboardContent />
      </Suspense>
    </PerformanceOptimizedLayout>
  );
});

export default UltraOptimizedDashboard;
