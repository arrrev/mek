import './globals.css';
import { ToasterProvider } from '@/components/Toaster';

export const metadata = {
  title: 'MEK - Exploding Kittens Game Tracker',
  description: 'Track Exploding Kittens game rounds, player actions, and championship leaderboards',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body>
        <ToasterProvider>{children}</ToasterProvider>
      </body>
    </html>
  );
}
