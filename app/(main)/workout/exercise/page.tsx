'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExerciseSelector } from '@/app/components/exercise-selector';
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { CenteredSpinner } from '@/app/components/ui/spinner';

function ExercisePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exercises, categories, loading } = useWorkoutData();
  
  const categoryId = searchParams.get('categoryId');
  const category = categories.find(c => c.id === Number(categoryId));

  useEffect(() => {
    // Only redirect if data is loaded and category still not found
    if (!loading && !categoryId) {
      router.push('/workout/category');
    }
  }, [categoryId, loading, router]);

  // Show loading while data is being fetched
  if (loading || !category) {
    return <CenteredSpinner size="lg" />;
  }

  return (
    <ExerciseSelector
      exercises={exercises}
      category={category}
      onBack={() => router.push('/workout/category')}
      onClose={() => router.push('/workout')}
      onSelect={(exercise) => {
        router.push(`/workout?exerciseId=${exercise.id}`);
      }}
    />
  );
}

export default function ExercisePage() {
  return (
    <Suspense fallback={<CenteredSpinner size="lg" />}>
      <ExercisePageContent />
    </Suspense>
  );
}
