import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import ServiceWorkerRegister from './components/ServiceWorkerRegister';
import { LanguageProvider } from './utils/LanguageContext';
import I18nClientProvider from './components/I18nClientProvider';

export const metadata: Metadata = {
  title: '中英同声传译 | Real-time Interpreter',
  description: '实时语音转录和翻译应用，支持中英文互译',
  manifest: '/manifest.json',
  appleWebApp: {
    title: '同声传译',
    statusBarStyle: 'black-translucent',
    capable: true,
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#121212',
  viewportFit: 'cover',
  userScalable: false,
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* iOS PWA specific tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
      </head>
      <body>
        <I18nClientProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </I18nClientProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
} 