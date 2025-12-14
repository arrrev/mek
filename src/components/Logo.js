'use client';

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-movato-primary to-movato-secondary flex items-center justify-center text-white text-lg font-bold">
        💣
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-movato-secondary leading-tight">Movato's Kittens</span>
        <span className="text-xs text-gray-500 leading-tight">Exploding Kittens</span>
      </div>
    </div>
  );
}
