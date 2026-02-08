'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MobileNav, Sidebar } from '@/app/components/navigation';
import { TabType } from '@/app/lib/tabs';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = (): TabType => {
    if (pathname.startsWith('/history')) return 'history';
    if (pathname.startsWith('/progress')) return 'progress';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/dev')) return 'dev';
    return 'workout';
  };

  const setActiveTab = (tab: TabType) => {
    const routes: Record<TabType, string> = {
      workout: '/workout',
      history: '/history',
      progress: '/progress',
      settings: '/settings',
      dev: '/dev',
    };
    router.push(routes[tab]);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-secondary">
      <Sidebar activeTab={getActiveTab()} setActiveTab={setActiveTab} />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-12 pb-32">
          {children}
        </main>
      </div>

      <MobileNav activeTab={getActiveTab()} setActiveTab={setActiveTab} />
    </div>
  );
}
