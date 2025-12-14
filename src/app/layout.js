import './globals.css';

export const metadata = {
  title: 'Mek - Exploding Kittens Championship Tracker',
  description: 'Track your Exploding Kittens game rounds and championships',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
