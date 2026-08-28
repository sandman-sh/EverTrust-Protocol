import type { Metadata } from 'next';
import './globals.css';
import { StarknetWalletProvider } from '@/context/StarknetWalletContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EverTrust Protocol — Confidential Wealth Succession & Dead Man\'s Switch on Starknet',
  description: 'Autonomous, confidential digital wealth succession and dead man\'s switch protocol powered by Starknet STRK20 shielded notes.',
  keywords: ['Starknet', 'STRK20', 'Privacy', 'Crypto Inheritance', 'Dead Mans Switch', 'ZK', 'Shielded Pool'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-black dark:text-white antialiased font-sans">
        <ThemeProvider>
          <StarknetWalletProvider>
            {children}
          </StarknetWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
