'use client';

import React, { useState } from 'react';
import { Sidebar, MobileNav } from '@/app/components/Navigation';
import { WorkoutLogger } from '@/app/components/WorkoutLogger';
import { WorkoutDayView } from '@/app/components/WorkoutDayView';
import dynamic from 'next/dynamic';

const Calendar = dynamic(() => import('@/app/components/Calendar').then(mod => ({ default: mod.Calendar })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});
import { CategorySelector } from '@/app/components/CategorySelector';
import { ExerciseSelectorWithSupabase } from '@/app/components/ExerciseSelectorWithSupabase';
import { useWorkout } from '@/app/hooks/useWorkout';
import { useWorkoutHistory } from '@/app/hooks/useWorkoutHistory';
import { Category } from '@/app/lib/schema';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button, Card } from '@/app/components/ui';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('workout');
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  
  const {
    currentWorkout,
    exercises,
    categories,
    weightUnits,
    distanceUnits,
    loading,
    addExercise,
    removeExercise,
    updateSet,
    addSet,
    removeSet,
    finishWorkout
  } = useWorkout();

  const { workouts, loading: historyLoading, refetch: refetchHistory } = useWorkoutHistory();

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const goToPreviousDay = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() - 1);
    setViewDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + 1);
    setViewDate(newDate);
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  const isToday = viewDate.toDateString() === new Date().toDateString();
  const viewDateStr = formatDate(viewDate);
  const hasWorkoutsForDay = getGroupedWorkouts(viewDateStr).length > 0;

  const handleFinish = async () => {
    const success = await finishWorkout();
    if (success) {
      toast.success("Workout saved to Supabase");
      refetchHistory(); // Refresh the history so it shows in today's view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("Add at least one exercise to finish session");
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'workout':
        return (
          <div className="space-y-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={goToPreviousDay} className="p-2">
                <ChevronLeft size={24} />
              </Button>
              
              <div className="text-center">
                <h2 className="text-2xl font-black text-white">
                  {viewDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h2>
                {!isToday && (
                  <Button 
                    variant="ghost" 
                    onClick={goToToday} 
                    className="text-xs text-slate-500 hover:text-violet-400 mt-1"
                  >
                    Go to Today
                  </Button>
                )}
              </div>

              <Button variant="ghost" onClick={goToNextDay} className="p-2">
                <ChevronRight size={24} />
              </Button>
            </div>

            {/* Show existing workouts for the day */}
            {hasWorkoutsForDay && (
              <WorkoutDayView
                date={viewDateStr}
                groupedWorkouts={getGroupedWorkouts(viewDateStr)}
                exercises={exercises}
                weightUnits={weightUnits}
                distanceUnits={distanceUnits}
                onUpdate={refetchHistory}
                showTitle={false}
              />
            )}

            {/* Add new exercises (only for today) */}
            {isToday && (
              <>
                <WorkoutLogger 
                  workout={currentWorkout}
                  exercises={exercises}
                  weightUnits={weightUnits}
                  distanceUnits={distanceUnits}
                  onAddSet={addSet}
                  onUpdateSet={updateSet}
                  onRemoveSet={removeSet}
                  onRemoveExercise={removeExercise}
                  onOpenSelector={() => setIsCategorySelectorOpen(true)}
                  showEmptyState={!hasWorkoutsForDay && currentWorkout.exercises.length === 0}
                />
                {currentWorkout.exercises.length > 0 && (
                  <Button variant="accent" size="lg" onClick={handleFinish} className="w-full">
                    Complete Session
                  </Button>
                )}
              </>
            )}

            {/* Empty state for any day with no workouts */}
            {!hasWorkoutsForDay && currentWorkout.exercises.length === 0 && (
              <Card className="py-20 flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent">
                <p className="text-slate-500 max-w-[200px]">No workouts recorded for this day</p>
                <Button variant="secondary" onClick={() => setIsCategorySelectorOpen(true)} className="mt-6">
                  Browse Exercises
                </Button>
              </Card>
            )}
          </div>
        );
      case 'history':
        return <Calendar />;
      case 'progress':
        return <div>Progress coming soon</div>;
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-700 border border-slate-800">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">App Settings</h2>
              <p className="text-slate-500 mt-2">v2.0.0 (Next.js)</p>
            </div>
            <Button variant="danger" onClick={() => { localStorage.clear(); window.location.reload(); }}>
              Clear Local Data
            </Button>
          </div>
        );
      default: return null;
    }
  };

  // Show setup message if no categories/exercises loaded
  if (!loading && categories.length === 0 && exercises.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-400">
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Supabase Not Configured</h2>
          <p className="text-slate-400 mb-6">
            Please set up your Supabase database and add your credentials to <code className="bg-slate-900 px-2 py-1 rounded text-violet-400">.env.local</code>
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left text-sm">
            <p className="text-slate-500 mb-2">See these guides:</p>
            <ul className="space-y-1 text-violet-400">
              <li>• SUPABASE_SETUP.md</li>
              <li>• .env.local.example</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-12 pb-32">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
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
          )}
        </main>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence>
        {isCategorySelectorOpen && !selectedCategory && (
          <CategorySelector
            categories={categories}
            onSelect={(category) => setSelectedCategory(category)}
            onClose={() => setIsCategorySelectorOpen(false)}
          />
        )}
        {isCategorySelectorOpen && selectedCategory && (
          <ExerciseSelectorWithSupabase 
            exercises={exercises}
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            onClose={() => {
              setIsCategorySelectorOpen(false);
              setSelectedCategory(null);
            }}
            onSelect={(ex) => {
              addExercise(ex);
              setIsCategorySelectorOpen(false);
              setSelectedCategory(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
