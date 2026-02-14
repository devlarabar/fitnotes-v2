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
  const dateParam = searchParams.get('date');
  const category = categories.find(
    c => c.id === Number(categoryId)
  );

  useEffect(() => {
    if (!loading && !categoryId) {
      router.push('/workout/category');
    }
  }, [categoryId, loading, router]);

  if (loading || !category) {
    return <CenteredSpinner size="lg" />;
  }

  const buildBackUrl = () => {
    const params = new URLSearchParams();
    if (dateParam) params.set('date', dateParam);
    const qs = params.toString();
    return `/workout/category${qs ? `?${qs}` : ''}`;
  };

  const buildCloseUrl = () => {
    const params = new URLSearchParams();
    if (dateParam) params.set('date', dateParam);
    const qs = params.toString();
    return `/workout${qs ? `?${qs}` : ''}`;
  };

  return (
    <ExerciseSelector
      exercises={exercises}
      category={category}
      onBack={() => router.push(buildBackUrl())}
      onClose={() => router.push(buildCloseUrl())}
      onSelect={(exercise) => {
        const params = new URLSearchParams();
        params.set('exerciseId', String(exercise.id));
        if (dateParam) params.set('date', dateParam);
        router.push(`/workout?${params}`);
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
