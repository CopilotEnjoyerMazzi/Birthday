/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f14",
        card: "#171722",
        muted: "#9aa2b1",
        text: "#e8e8f2",
        accent: {
          DEFAULT: "#7c3aed",
          light: "#a78bfa",
          dark: "#6d28d9"
        },
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444"
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'pulse-slow': 'pulse 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shine': 'shine 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shine: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}

