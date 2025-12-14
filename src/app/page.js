'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-kittens-red via-kittens-orange to-kittens-yellow bg-clip-text text-transparent">
          🐱 Exploding Kittens
        </h1>
        <h2 className="text-2xl font-semibold text-movato-secondary mb-8">
          Championship Tracker
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Link href="/record" className="btn-primary text-lg py-4">
            📝 Record Game
          </Link>
          <Link href="/analytics" className="btn-secondary text-lg py-4">
            📊 Analytics & Leaderboard
          </Link>
          <Link href="/history" className="bg-kittens-purple hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-lg py-4">
            📜 Game History
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
