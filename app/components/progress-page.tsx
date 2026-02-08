import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useWorkout } from '@/app/hooks/use-workout';
import { Category, Exercise } from '@/app/lib/schema';
import { SectionHeader, Card } from './ui';
import { ExerciseProgress } from './workout/exercise-progress';
import { Analytics } from './workout/analytics';

export function ProgressPage() {
  const { categories, exercises, loading } = useWorkout();
  const [activeTab, setActiveTab] = useState<'progress' | 'analytics'>(
    'progress'
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    null
  );
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  const filteredExercises = selectedCategory
    ? exercises.filter(e => e.category === selectedCategory)
    : [];

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setSelectedExercise(null);
  };

  const handleExerciseChange = (exerciseId: number) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    setSelectedExercise(exercise || null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-primary 
          border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Progress"
        subtitle="Track your improvements over time"
      />

      <Card className="p-0 overflow-hidden">
        <div className="flex border-b border-border-primary">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'progress'
                ? 'text-accent-secondary border-b-2 border-accent-primary'
                : 'text-text-dim hover:text-text-secondary hover:cursor-pointer'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'analytics'
                ? 'text-accent-secondary border-b-2 border-accent-primary'
                : 'text-text-dim hover:text-text-secondary hover:cursor-pointer'
            }`}
          >
            Analytics
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-text-dim 
                      uppercase tracking-wider mb-2"
                    >
                      Category
                    </label>
                    <select
                      value={selectedCategory || ''}
                      onChange={(e) => handleCategoryChange(Number(e.target.value))}
                      className="w-full bg-bg-tertiary border border-border-primary 
                        rounded-xl px-4 py-3 text-text-primary focus:border-accent-primary 
                        outline-none transition-all"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-bold text-text-dim 
                      uppercase tracking-wider mb-2"
                    >
                      Exercise
                    </label>
                    <select
                      value={selectedExercise?.id || ''}
                      onChange={(e) => handleExerciseChange(Number(e.target.value))}
                      disabled={!selectedCategory}
                      className="w-full bg-bg-tertiary border border-border-primary 
                        rounded-xl px-4 py-3 text-text-primary focus:border-accent-primary 
                        outline-none transition-all disabled:opacity-50 
                        disabled:cursor-not-allowed"
                    >
                      <option value="">Select an exercise</option>
                      {filteredExercises.map(ex => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              {selectedExercise ? (
                <ExerciseProgress
                  exerciseId={selectedExercise.id}
                  measurementType={selectedExercise.measurement_type?.name}
                />
              ) : (
                <Card className="p-12">
                  <div className="text-center">
                    <TrendingUp size={48} className="mx-auto text-text-dim mb-4" />
                    <p className="text-text-muted">
                      Select a category and exercise to view progress
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'analytics' && <Analytics />}
        </div>
      </Card>
    </div>
  );
}
