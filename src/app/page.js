'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full text-center">
        <div className="flex justify-center mb-4 sm:mb-6">
          <Logo className="scale-125 sm:scale-150" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-kittens-red via-kittens-orange to-kittens-yellow bg-clip-text text-transparent">
          🐱 Exploding Kittens
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-movato-secondary mb-6 sm:mb-8">
          Championship Tracker
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Link href="/record" className="btn-primary text-base sm:text-lg py-3 sm:py-4">
            📝 Record Game
          </Link>
          <Link href="/analytics" className="btn-secondary text-base sm:text-lg py-3 sm:py-4">
            📊 Analytics & Leaderboard
          </Link>
          <Link href="/history" className="bg-kittens-purple hover:bg-opacity-90 text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-base sm:text-lg">
            📜 Game History
          </Link>
          <Link href="/import" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-base sm:text-lg">
            📥 Import Games
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Track your Exploding Kittens rounds, record actions, and see who's winning the championship!
          </p>
        </div>
      </div>
    </div>
  );
}
