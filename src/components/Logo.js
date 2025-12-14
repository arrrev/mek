'use client';

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-movato-primary to-movato-secondary flex items-center justify-center text-white text-base sm:text-lg font-bold flex-shrink-0">
        💣
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-base sm:text-lg md:text-xl font-bold text-movato-secondary leading-tight truncate">Movato's Kittens</span>
        <span className="text-[10px] sm:text-xs text-gray-500 leading-tight truncate">Exploding Kittens</span>
      </div>
    </div>
  );
}
