import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Outfit, Fraunces } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { AuthInitializer } from '@/components/AuthInitializer';
import { NotificationNavigator } from '@/components/NotificationNavigator';
import { ReportButton } from '@/components/ReportButton';
import { ReportModal } from '@/components/ReportModal';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ISTQB Study App',
  description: 'Progressive Web App para preparación ISTQB Foundation Level',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ISTQB Study',
  },
  formatDetection: {
    telephone: false,
  },
  other: {},
};

const themeInitScript = `
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('ui-storage') || '{}');
    var t = (s.state && s.state.theme) || 'light';
    var d = t === 'dark';
    if (d) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = d ? 'dark' : 'light';
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${outfit.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="theme-color" content="#fafaf9" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#030712" media="(prefers-color-scheme: dark)" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://pygermjcpomedeyujiut.supabase.co" />
        <link rel="dns-prefetch" href="https://pygermjcpomedeyujiut.supabase.co" />
      </head>
      <body className="bg-stone-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <AuthInitializer>
            <ServiceWorkerRegistration />
            <NotificationNavigator />
            <ReportModal />
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
              <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
                {children}
              </Suspense>
            </main>
            <ReportButton />
            <Footer />
          </AuthInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
