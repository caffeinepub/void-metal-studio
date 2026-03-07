import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        gothic: ['Cinzel Decorative', 'Cinzel', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        sans: ['Cinzel', 'serif'],
      },
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))'
        },
        chart: {
          1: 'oklch(var(--chart-1))',
          2: 'oklch(var(--chart-2))',
          3: 'oklch(var(--chart-3))',
          4: 'oklch(var(--chart-4))',
          5: 'oklch(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          primary: 'oklch(var(--sidebar-primary))',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
          ring: 'oklch(var(--sidebar-ring))'
        },
        // Void Metal custom tokens
        'blood-red': 'oklch(0.45 0.22 25)',
        'ember-orange': 'oklch(0.62 0.2 42)',
        'stone-dark': 'oklch(0.08 0.005 20)',
        'stone-mid': 'oklch(0.14 0.01 20)',
        'stone-light': 'oklch(0.22 0.015 25)',
        'glow-red': 'oklch(0.55 0.25 25)',
        'glow-ember': 'oklch(0.7 0.22 45)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
        'glow-red': '0 0 20px oklch(0.55 0.25 25 / 0.5)',
        'glow-ember': '0 0 20px oklch(0.65 0.25 42 / 0.5)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'ignite-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px oklch(0.55 0.25 25 / 0.6), 0 0 40px oklch(0.55 0.22 40 / 0.4)'
          },
          '50%': {
            boxShadow: '0 0 35px oklch(0.65 0.28 25 / 0.9), 0 0 70px oklch(0.65 0.25 42 / 0.6)'
          }
        },
        'ember-flicker': {
          '0%, 100%': { opacity: '1' },
          '33%': { opacity: '0.8' },
          '66%': { opacity: '0.9' }
        },
        'crack-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px oklch(0.55 0.25 25 / 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 10px oklch(0.65 0.28 40 / 0.9))' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'ignite-pulse': 'ignite-pulse 2s ease-in-out infinite',
        'ember-flicker': 'ember-flicker 1.5s ease-in-out infinite',
        'crack-glow': 'crack-glow 2.5s ease-in-out infinite',
      }
    }
  },
  plugins: [typography, containerQueries, animate]
};
