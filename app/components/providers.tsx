'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/app/contexts/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-center" 
        theme="dark" 
        expand={false}
        richColors
        toastOptions={{
          style: {
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '20px',
            color: '#f8fafc'
          }
        }}
      />
      {children}
    </ThemeProvider>
  );
}
