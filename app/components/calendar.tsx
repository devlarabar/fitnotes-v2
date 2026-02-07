'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { motion } from 'motion/react';
import { Button, Card, SectionHeader } from './ui';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface Props {
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ onDateSelect }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { workouts, loading } = useWorkoutData();

  const getWorkoutDates = (): Set<string> => {
    return new Set(workouts.map(w => w.date));
  };

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
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    onDateSelect(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
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

          <div className="text-center flex flex-col justify-center items-center">
            <h2 className="text-2xl font-black text-text-primary">
              {MONTHS[month]} {year}
            </h2>
            <Button
              variant="ghost"
              onClick={goToToday}
              className="text-xs text-text-primary0 hover:text-accent-secondary mt-1 mx-auto"
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
            <div key={day} className="text-center text-xs font-black text-text-subtle uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((item, idx) => {
            const todayDate = isToday(item.date);
            const workout = hasWorkout(item.date);

            return (
              <motion.button
                key={idx}
                onClick={() => handleDateClick(item.date, item.isCurrentMonth)}
                className={`
                  aspect-square rounded-xl p-2 text-sm font-bold transition-all relative
                  hover:cursor-pointer
                  ${!item.isCurrentMonth ? 'text-text-faint cursor-default' : 'text-text-secondary hover:bg-bg-tertiary'}
                  ${todayDate && item.isCurrentMonth ? 'ring-2 ring-accent-primary' : ''}
                  ${workout && item.isCurrentMonth ? 'bg-accent-primary/20 text-accent-secondary' : ''}
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
    </div>
  );
}
