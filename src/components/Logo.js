'use client';

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 ${className} max-w-full`}>
      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-movato-primary to-movato-secondary flex items-center justify-center text-white text-sm sm:text-base md:text-lg font-bold flex-shrink-0">
        💣
      </div>
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-movato-secondary leading-tight truncate">Movato's Kittens</span>
        <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 leading-tight truncate">Exploding Kittens</span>
      </div>
    </div>
  );
}
