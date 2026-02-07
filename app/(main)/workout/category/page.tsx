'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategorySelector } from '@/app/components/category-selector';
import { useWorkoutData } from '@/app/contexts/workout-data-context';

export default function CategoryPage() {
  const router = useRouter();
  const { categories } = useWorkoutData();

  const handleSelect = (category: any) => {
    console.log('Category selected:', category);
    router.push(`/workout/exercise?categoryId=${category.id}`);
  };

  return (
    <CategorySelector
      categories={categories}
      onSelect={handleSelect}
      onClose={() => router.push('/workout')}
    />
  );
}
