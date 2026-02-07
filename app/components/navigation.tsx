'use client';

import React from 'react';
import { Dumbbell, Calendar, TrendingUp, Settings, Sun, Moon } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { TabType } from '../lib/tabs';
import { useTheme } from '@/app/contexts/theme-context';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const NAV_ITEMS = [
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'history', label: 'Calendar', icon: Calendar },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className={`hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 
      bg-bg-primary border-r border-border-secondary p-8 z-100`}
    >
      <div className="flex items-center gap-4 mb-12">
        <div className={`w-12 h-12 rounded-2xl bg-linear-to-br from-accent-primary 
        to-accent-pink flex items-center justify-center text-white font-black 
        text-2xl shadow-lg shadow-accent-primary/30`}
        >
          F
        </div>
        <span className={`text-2xl font-black bg-clip-text text-transparent 
        bg-linear-to-r from-text-primary to-text-dim tracking-tight hover:cursor-pointer`}
          onClick={() => setActiveTab('workout')}
        >
          FitNotes
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all 
              duration-300 font-bold hover:cursor-pointer`,
              activeTab === item.id
                ? "text-accent-secondary bg-accent-secondary/10 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]"
                : "text-text-dim hover:text-text-secondary hover:bg-bg-secondary"
            )}
          >
            <item.icon
              size={20}
              className={cn(activeTab === item.id && "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]")}
            />
            {item.label}
          </button>
        ))}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold hover:cursor-pointer text-text-dim hover:text-text-secondary hover:bg-bg-secondary mt-4"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>
    </nav>
  );
}

export function MobileNav({ activeTab, setActiveTab }: Props) {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-bg-primary/80 backdrop-blur-xl 
      border-t border-border-secondary flex justify-around items-center 
      px-4 py-3 md:hidden z-100 pb-safe`}
    >
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            `flex flex-col items-center gap-1 p-2 rounded-2xl flex-1 transition-all
            duration-300 hover:cursor-pointer hover:text-accent-primary`,
            activeTab === item.id ? "text-accent-secondary" : "text-text-subtle"
          )}
        >
          <item.icon size={22} className={cn(activeTab === item.id && "scale-110")} />
          <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
