import React from 'react';
import { Dumbbell, Calendar, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'history', label: 'Calendar', icon: Calendar },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: Props) {
  return (
    <nav className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-slate-950 border-r border-slate-900 p-8 z-[100]">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-violet-900/30">
          F
        </div>
        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 tracking-tight">
          FitNotes
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold",
              activeTab === item.id 
                ? "text-violet-400 bg-violet-400/10 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]" 
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id && "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]")} />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function MobileNav({ activeTab, setActiveTab }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 flex justify-around items-center px-4 py-3 md:hidden z-[100] pb-safe">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-2xl flex-1 transition-all duration-300",
            activeTab === item.id ? "text-violet-400" : "text-slate-600"
          )}
        >
          <item.icon size={22} className={cn(activeTab === item.id && "scale-110")} />
          <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
