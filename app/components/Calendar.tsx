'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { Button, Card, SectionHeader } from './ui';
import { useWorkoutHistory } from '@/app/hooks/useWorkoutHistory';
import { useWorkout } from '@/app/hooks/useWorkout';
import { WorkoutDayView } from './WorkoutDayView';
import { motion, AnimatePresence } from 'motion/react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { workouts, loading, getWorkoutDates, refetch } = useWorkoutHistory();
  const { exercises, weightUnits, distanceUnits } = useWorkout();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const workoutDates = getWorkoutDates();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Build calendar grid
  const calendarDays = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month - 1, day)
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day)
    });
  }

  // Next month days to fill grid
  const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day)
    });
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasWorkout = (date: Date): boolean => {
    return workoutDates.has(formatDate(date));
  };

  // Group workouts by exercise for a given date
  const getGroupedWorkouts = (date: string) => {
    const dayWorkouts = workouts.filter(w => w.date === date);
    const grouped = new Map<number, { exercise: any; sets: any[] }>();

    dayWorkouts.forEach(workout => {
      if (!grouped.has(workout.exercise)) {
        grouped.set(workout.exercise, {
          exercise: {
            id: workout.exercise,
            name: workout.exercises?.name || 'Unknown',
            category: workout.categories?.name || 'Unknown'
          },
          sets: []
        });
      }
      grouped.get(workout.exercise)!.sets.push(workout);
    });

    return Array.from(grouped.values());
  };

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const dateStr = formatDate(date);
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Calendar" 
        subtitle="Track your workout history"
      />

      <Card className="p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={goToPreviousMonth} className="p-2">
            <ChevronLeft size={24} />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">
              {MONTHS[month]} {year}
            </h2>
            <Button 
              variant="ghost" 
              onClick={goToToday} 
              className="text-xs text-slate-500 hover:text-violet-400 mt-1"
            >
              Today
            </Button>
          </div>

          <Button variant="ghost" onClick={goToNextMonth} className="p-2">
            <ChevronRight size={24} />
          </Button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-black text-slate-600 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((item, idx) => {
            const dateStr = formatDate(item.date);
            const isSelected = selectedDate === dateStr;
            const todayDate = isToday(item.date);
            const workout = hasWorkout(item.date);

            return (
              <motion.button
                key={idx}
                onClick={() => handleDateClick(item.date, item.isCurrentMonth)}
                className={`
                  aspect-square rounded-xl p-2 text-sm font-bold transition-all relative
                  ${!item.isCurrentMonth ? 'text-slate-700 cursor-default' : 'text-slate-300 hover:bg-slate-800'}
                  ${todayDate && item.isCurrentMonth ? 'ring-2 ring-violet-500' : ''}
                  ${isSelected ? 'bg-violet-500 text-white' : ''}
                  ${workout && item.isCurrentMonth && !isSelected ? 'bg-violet-500/20 text-violet-400' : ''}
                `}
                whileTap={item.isCurrentMonth ? { scale: 0.95 } : {}}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{item.day}</span>
                  {workout && item.isCurrentMonth && (
                    <Dumbbell size={12} className="mt-1 opacity-70" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Workouts */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <WorkoutDayView
            date={selectedDate}
            groupedWorkouts={getGroupedWorkouts(selectedDate)}
            exercises={exercises}
            weightUnits={weightUnits}
            distanceUnits={distanceUnits}
            onUpdate={refetch}
            showTitle={true}
          />
        </motion.div>
      )}
    </div>
  );
}
