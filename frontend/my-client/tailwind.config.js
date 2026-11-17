/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'accent-blue': '#0158c6',
        'accent-cyan': '#0199c6',
        'accent-green': '#4dbe51',
        'accent-green-light': '#81ce65',
        brand: {
          blue: '#0158c6',
          cyan: '#0199c6',
          green: '#4dbe51',
          'green-light': '#81ce65',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
        'brand-gradient-r': 'linear-gradient(90deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
        'green-gradient': 'linear-gradient(135deg, #4dbe51 0%, #81ce65 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'border-spin': 'borderSpin 2.5s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        borderSpin: {
          from: { '--gradient-angle': '0deg' },
          to: { '--gradient-angle': '360deg' },
        },
        marquee: {
          from: { transform: 'translateX(0%)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
