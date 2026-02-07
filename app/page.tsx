'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SettingsPage } from '@/app/components/settings-page';
import { AnimatePresence, motion } from 'motion/react';
import { WorkoutPage } from './components/workout/workout-page';
import { MobileNav, Sidebar } from './components/navigation';
import { Spinner } from './components/ui';

const CalendarComponent = dynamic(() => import('@/app/components/calendar'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  )
});

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('workout');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setActiveTab('workout');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'workout':
        return <WorkoutPage initialDate={selectedDate} onDateChange={() => setSelectedDate(null)} />;
      case 'history':
        return <CalendarComponent onDateSelect={handleDateSelect} />;
      case 'progress':
        return <div>Progress coming soon</div>;
      case 'settings':
        return <SettingsPage />;
      default:
        return <WorkoutPage initialDate={selectedDate} onDateChange={() => setSelectedDate(null)} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-12 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
