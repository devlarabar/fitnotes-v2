'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategorySelector } from '@/app/components/category-selector';
import { useWorkoutData } from '@/app/contexts/workout-data-context';
import { CenteredSpinner } from '@/app/components/ui/spinner';

function CategoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories } = useWorkoutData();
  const dateParam = searchParams.get('date');

  const handleSelect = (category: any) => {
    const params = new URLSearchParams();
    params.set('categoryId', String(category.id));
    if (dateParam) params.set('date', dateParam);
    router.push(`/workout/exercise?${params}`);
  };

  const handleClose = () => {
    const params = new URLSearchParams();
    if (dateParam) params.set('date', dateParam);
    const qs = params.toString();
    router.push(`/workout${qs ? `?${qs}` : ''}`);
  };

  return (
    <CategorySelector
      categories={categories}
      onSelect={handleSelect}
      onClose={handleClose}
    />
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<CenteredSpinner size="lg" />}>
      <CategoryPageContent />
    </Suspense>
  );
}
