'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { WorkoutPage } from '@/app/components/workout/WorkoutPage';
import { SettingsPage } from '@/app/components/SettingsPage';
import { Sidebar, MobileNav } from '@/app/components/Navigation';
import { AnimatePresence, motion } from 'motion/react';

const Calendar = dynamic(() => import('@/app/components/Calendar'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('workout');

  const renderView = () => {
    switch (activeTab) {
      case 'workout':
        return <WorkoutPage />;
      case 'history':
        return <Calendar />;
      case 'progress':
        return <div>Progress coming soon</div>;
      case 'settings':
        return <SettingsPage />;
      default:
        return <WorkoutPage />;
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
