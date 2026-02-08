'use client';

import React, { useState } from 'react';
import { useUser } from '@/app/contexts/user-context';
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormInput } from '@/app/components/ui/form-input';
import { FormSelect } from '@/app/components/ui/form-select';
import { Button } from '@/app/components/ui';

export default function DevPage() {
  const { user } = useUser();
  const { categories, measurementTypes, refetch } = useWorkoutData();
  const router = useRouter();

  const [exerciseName, setExerciseName] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);
  const [selectedMeasurementType, setSelectedMeasurementType] =
    useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect non-dev users
  if (user && user.role !== 'dev') {
    router.push('/workout');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exerciseName.trim()) {
      toast.error('Exercise name is required');
      return;
    }

    if (!selectedCategory) {
      toast.error('Category is required');
      return;
    }

    if (!selectedMeasurementType) {
      toast.error('Measurement type is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: exerciseName.trim(),
          category: selectedCategory,
          measurement_type: selectedMeasurementType,
        })
        .select();

      if (error) throw error;

      toast.success(`Exercise "${exerciseName}" added successfully!`);
      
      // Reset form
      setExerciseName('');
      setSelectedCategory(null);
      setSelectedMeasurementType(null);

      // Refetch data to update context
      await refetch();
    } catch (err) {
      console.error('Error adding exercise:', err);
      toast.error('Failed to add exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-text-primary mb-2">
          Dev Tools
        </h1>
        <p className="text-text-muted">
          Add new exercises to the database
        </p>
      </div>

      <div
        className={`
          bg-bg-secondary rounded-3xl p-8 
          border border-border-secondary
        `}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Add New Exercise
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            id="exercise-name"
            label="Exercise Name"
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g., Bench Press"
          />

          <FormSelect
            id="category"
            label="Category"
            options={categories}
            value={selectedCategory ?? ''}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            placeholder="Select a category"
          />

          <FormSelect
            id="measurement-type"
            label="Measurement Type"
            options={measurementTypes}
            value={selectedMeasurementType ?? ''}
            onChange={(e) =>
              setSelectedMeasurementType(Number(e.target.value))
            }
            placeholder="Select a measurement type"
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isSubmitting ? 'Adding...' : 'Add Exercise'}
          </Button>
        </form>
      </div>
    </div>
  );
}
