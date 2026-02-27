/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ── LIGHT THEME PALETTE ──────────────────────────────
                "brand-dark": "#ffffff",   // was #020617 → now pure white (page bg)
                "brand-card": "#f8fafc",   // was #0f172a → now light slate-50
                "brand-border": "#e2e8f0",   // was #1e293b → now slate-200
                "brand-slate": "#64748b",   // was #94a3b8 → now slate-500 (secondary text)
                // ── ACCENT COLORS (kept vibrant for badges/charts) ──
                "brand-indigo": "#4f46e5",   // slightly deeper indigo for light bg contrast
                "brand-violet": "#7c3aed",   // deeper violet
                "brand-emerald": "#059669",   // deeper emerald
                "brand-rose": "#e11d48",   // deeper rose
            },
            fontFamily: {
                sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "shimmer": "shimmer 2.5s infinite linear",
                "float": "float 6s ease-in-out infinite",
            },
            keyframes: {
                shimmer: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                }
            }
        },
    },
    plugins: [],
}
