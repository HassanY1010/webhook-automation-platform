import './globals.css';
import React from 'react';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Webhook Automation Platform - Enterprise SaaS',
  description: 'Production-ready webhook and REST API automation engine with AST rule evaluation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
