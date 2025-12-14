'use client';

import { useState, useRef, useEffect } from 'react';

export default function ColorPalette({ selectedColor = '#FF6B35', onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#fbbf24',
    '#84cc16', '#06b6d4', '#6366f1', '#a855f7',
    '#f43f5e', '#eab308', '#22c55e', '#0ea5e9',
    '#FF6B35', '#004E89', '#FFA500', '#FF4444',
    '#FF8800', '#FFD700', '#FF69B4', '#9B59B6'
  ];

  const handleColorSelect = (color) => {
    onSelect(color);
    setIsExpanded(false);
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isExpanded) return;
      
      const target = event.target;
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      
      setIsExpanded(false);
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [isExpanded]);

  return (
    <div ref={containerRef} className="w-full">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-300 hover:border-movato-primary transition-colors bg-white"
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm text-gray-700 flex-1 text-left">
          {isExpanded ? 'Select a color' : 'Click to change color'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform text-gray-600 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-8 gap-2">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded-full transition-all min-h-[32px] min-w-[32px] ${
                  selectedColor === color 
                    ? 'ring-2 ring-movato-primary ring-offset-2 scale-110' 
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
