/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B1AE5', // New primary purple
        secondary: '#6C1Bc5', // Amber for accents
        dark: '#212529', // A darker shade for text or backgrounds
        light: '#F8F9FA', // Light shade for backgrounds or text
        success: '#28A745', // Green for success messages
        info: '#17A2B8', // Blue for informational messages
        warning: '#FFC107', // Yellow for warnings
        danger: '#DC3545', // Red for errors or danger alerts
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  variants: {},
  plugins: [],
}