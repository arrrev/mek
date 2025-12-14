/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Movato branding colors (adjust based on actual brand colors)
        movato: {
          primary: '#FF6B35',
          secondary: '#004E89',
          accent: '#FFA500',
        },
        // Exploding Kittens theme colors
        kittens: {
          red: '#FF4444',
          orange: '#FF8800',
          yellow: '#FFD700',
          pink: '#FF69B4',
          purple: '#9B59B6',
        },
      },
    },
  },
  plugins: [],
};
