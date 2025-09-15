'use client'

import { memo, useMemo } from 'react'
import { useOptimizedHabits } from '@/hooks/useOptimizedHabits'
import { HabitCard } from './HabitCard'
import { AddHabitModal } from './AddHabitModal'
import { CalendarView } from './CalendarView'
import { ProfileDropdown } from './ProfileDropdown'
import { SettingsModal } from './SettingsModal'
import { EditHabitModal } from './EditHabitModal'

interface OptimizedDashboardProps {
  timeFilter: 'today' | 'week' | 'month'
  onTimeFilterChange: (filter: 'today' | 'week' | 'month') => void
}

function OptimizedDashboardComponent({ timeFilter, onTimeFilterChange }: OptimizedDashboardProps) {
  const { habits, entries, isLoading, getHabitStats } = useOptimizedHabits()

  // Memoized stats calculation
  const stats = useMemo(() => {
    return getHabitStats(timeFilter)
  }, [getHabitStats, timeFilter])

  // Memoized filtered habits
  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const habitCreatedDate = new Date(habit.created_at).toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]
      
      // Only show habits that existed during the selected time period
      return habitCreatedDate <= today
    })
  }, [habits])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Lade Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Habit Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Filter Buttons */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                {(['today', 'week', 'month'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => onTimeFilterChange(filter)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      timeFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    {filter === 'today' ? 'Heute' : filter === 'week' ? 'Woche' : 'Monat'}
                  </button>
                ))}
              </div>
              
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Gesamt Habits</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.total_habits}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              {timeFilter === 'today' ? 'Heute abgeschlossen' : 
               timeFilter === 'week' ? 'Diese Woche abgeschlossen' : 
               'Diesen Monat abgeschlossen'}
            </h3>
            <p className="text-3xl font-bold text-green-400">{stats.completed_today}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Erfolgsrate</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.completion_rate}%</p>
          </div>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              timeFilter={timeFilter}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredHabits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {habits.length === 0 ? 'Noch keine Habits erstellt' : 'Keine Habits für diesen Zeitraum'}
            </div>
            <AddHabitModal />
          </div>
        )}
      </main>

      {/* Modals */}
      <AddHabitModal />
      <SettingsModal />
      <EditHabitModal />
    </div>
  )
}

export const OptimizedDashboard = memo(OptimizedDashboardComponent)
