/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  future: { hoverOnlyWhenSupported: true },
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Mapear tokens shadcn a nuestras CSS vars */
        background:  'var(--bg)',
        foreground:  'var(--text)',
        primary: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-fg)',
        },
        secondary: {
          DEFAULT:    'var(--surface-strong)',
          foreground: 'var(--text)',
        },
        muted: {
          DEFAULT:    'var(--surface-strong)',
          foreground: 'var(--muted)',
        },
        accent: {
          DEFAULT:    'var(--accent-soft)',
          foreground: 'var(--accent-text)',
        },
        destructive: {
          DEFAULT:    'var(--danger-fill)',
          foreground: '#ffffff',
        },
        brand: {
          DEFAULT: 'var(--brand)',
          soft:    'var(--brand-soft)',
        },
        success:   'var(--success)',
        whatsapp: {
          DEFAULT: 'var(--whatsapp)',
          fill:    'var(--whatsapp-fill)',
        },
        info: {
          DEFAULT: 'var(--info)',
          soft:    'var(--info-soft)',
          fill:    'var(--info-fill)',
        },
        highlight: {
          DEFAULT:    'var(--highlight)',
          foreground: 'var(--highlight-fg)',
        },
        border:  'var(--border)',
        'border-strong': 'var(--border-strong)',
        input:   'var(--border)',
        ring:    'var(--accent)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--text)',
        },
        popover: {
          DEFAULT:    'var(--surface)',
          foreground: 'var(--text)',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm:   'var(--radius-sm)',
        full: 'var(--radius-full)',
        lg:   'var(--radius)',
        md:   'var(--radius-sm)',
        xl:   '1.25rem',
        '2xl':'1.5rem',
        '3xl':'2rem',
      },
      boxShadow: {
        card:      'var(--shadow)',
      },
    },
  },
  plugins: [],
};
