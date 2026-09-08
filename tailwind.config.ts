import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Dark-premium design system.
 *
 * Every colour is an HSL triplet CSS variable so the shadcn primitives and the
 * bespoke archive components draw from one palette. Raw hex values do not
 * belong in components.
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2.5rem' },
      screens: { '2xl': '90rem' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Champagne-gold accent scale: the one warm note in a cool dark UI. */
        gold: {
          50: 'hsl(43 60% 92%)',
          100: 'hsl(43 55% 84%)',
          200: 'hsl(42 50% 74%)',
          300: 'hsl(41 46% 66%)',
          400: 'hsl(40 44% 58%)',
          500: 'hsl(39 42% 50%)',
          600: 'hsl(38 44% 42%)',
          700: 'hsl(36 46% 34%)',
          800: 'hsl(34 46% 26%)',
          900: 'hsl(32 44% 18%)',
          DEFAULT: 'hsl(var(--gold))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 10px)',
        '3xl': 'calc(var(--radius) + 18px)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)',
        'fluid-sm': 'clamp(0.875rem, 0.85rem + 0.15vw, 0.9375rem)',
        'fluid-base': 'clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)',
        'fluid-lg': 'clamp(1.125rem, 1.05rem + 0.35vw, 1.3125rem)',
        'fluid-xl': 'clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)',
        'fluid-2xl': 'clamp(1.75rem, 1.45rem + 1.4vw, 2.5rem)',
        'fluid-3xl': 'clamp(2.125rem, 1.6rem + 2.4vw, 3.5rem)',
        'fluid-4xl': 'clamp(2.5rem, 1.7rem + 3.8vw, 5rem)',
        'fluid-5xl': 'clamp(3rem, 1.8rem + 5.6vw, 7rem)',
      },
      maxWidth: {
        prose: '68ch',
        shell: '88rem',
        wide: '104rem',
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
      },
      boxShadow: {
        /* Elevation on dark surfaces comes from shadow plus a lit top edge. */
        elevated: '0 1px 0 0 hsl(0 0% 100% / 0.07) inset, 0 18px 40px -20px hsl(213 40% 3% / 0.8)',
        float: '0 1px 0 0 hsl(0 0% 100% / 0.09) inset, 0 30px 70px -28px hsl(213 40% 3% / 0.9)',
        'gold-glow': '0 0 0 1px hsl(var(--gold) / 0.35), 0 12px 40px -12px hsl(var(--gold) / 0.35)',
      },
      transitionTimingFunction: {
        heritage: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-rise': {
          from: { opacity: '0', transform: 'translate3d(0,14px,0)' },
          to: { opacity: '1', transform: 'translate3d(0,0,0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'sheet-up': {
          from: { transform: 'translate3d(0,100%,0)' },
          to: { transform: 'translate3d(0,0,0)' },
        },
        'drawer-in': {
          from: { transform: 'translate3d(-100%,0,0)' },
          to: { transform: 'translate3d(0,0,0)' },
        },
        'drawer-out': {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-100%,0,0)' },
        },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '0.55' },
          '50%': { transform: 'translate3d(3%,-4%,0) scale(1.08)', opacity: '0.75' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.16,1,0.3,1) both',
        /* Drawer opens on a decelerating curve and leaves a little faster. */
        'drawer-in': 'drawer-in 0.42s cubic-bezier(0.16,1,0.3,1) both',
        'drawer-out': 'drawer-out 0.28s cubic-bezier(0.4,0,1,1) both',
        'fade-out': 'fade-out 0.28s ease-out both',
        shimmer: 'shimmer 2.2s infinite',
        aurora: 'aurora-drift 22s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};
export default config;
