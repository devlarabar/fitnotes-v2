'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { CenteredSpinner } from '@/app/components/ui/spinner';

const CalendarComponent = dynamic(() => import('@/app/components/calendar'), {
  ssr: false,
  loading: () => <CenteredSpinner size="lg" />
});

export default function HistoryPage() {
  const router = useRouter();

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    router.push(`/workout?date=${dateStr}`);
  };

  return <CalendarComponent onDateSelect={handleDateSelect} />;
}
