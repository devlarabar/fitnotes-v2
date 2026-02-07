'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '@/app/contexts/theme-context';

function ThemedToaster() {
  const { theme } = useTheme();
  
  return (
    <Toaster 
      position="top-right" 
      theme={theme}
      expand={false}
      richColors
      toastOptions={{
        style: {
          background: theme === 'dark' ? '#0f172a' : '#ffffff',
          border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e5e7eb',
          borderRadius: '20px',
          color: theme === 'dark' ? '#f8fafc' : '#111827'
        }
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemedToaster />
      {children}
    </ThemeProvider>
  );
}
