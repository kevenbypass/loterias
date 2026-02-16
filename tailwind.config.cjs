/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Dynamic game color classes (built from constants.ts color names).
    { pattern: /^(bg)-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-(100|500)$/ },
    { pattern: /^bg-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-500\/20$/, variants: ["dark"] },
    { pattern: /^bg-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-900\/40$/, variants: ["dark"] },

    { pattern: /^text-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-(200|300|400|500|600|700)$/ },
    { pattern: /^text-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-(200|300|400|500|600|700)$/, variants: ["dark", "md:group-hover", "dark:md:group-hover"] },

    { pattern: /^from-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-500$/ },
    { pattern: /^to-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-(600|700)$/ },

    { pattern: /^to-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-100\/80$/ },
    { pattern: /^to-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-900\/40$/, variants: ["dark"] },

    { pattern: /^via-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-500\/10$/ },

    { pattern: /^shadow-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-500\/30$/ },
    { pattern: /^shadow-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-500\/50$/, variants: ["dark"] },
    { pattern: /^shadow-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-500\/70$/, variants: ["md:group-hover"] },

    { pattern: /^border-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-200\/60$/ },
    { pattern: /^border-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-400$/, variants: ["md:group-hover"] },
    { pattern: /^border-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-500\/30$/, variants: ["dark"] },
    { pattern: /^border-(emerald|purple|blue|orange|amber|rose|sky|lime|teal|indigo)-400\/80$/, variants: ["dark:md:group-hover"] },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        zoomIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "60%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        flashIn: {
          "0%": { opacity: "0", boxShadow: "inset 0 0 0 1px currentColor" },
          "40%": { opacity: "0.8", boxShadow: "inset 0 0 10px 4px currentColor" },
          "100%": { opacity: "0", boxShadow: "inset 0 0 0 0 transparent" },
        },
      },
      animation: {
        shine: "shine 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "slide-right": "slideRight 0.5s ease-out forwards",
        "zoom-in": "zoomIn 0.3s ease-out forwards",
        "pop-in": "popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "flash-in": "flashIn 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
