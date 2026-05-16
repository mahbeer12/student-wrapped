import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Clash Display'", "sans-serif"],
        body: ["'Cabinet Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        bg: {
          DEFAULT: "#070710",
          card: "#0d0d1a",
          elevated: "#13132a",
        },
        accent: {
          violet: "#7c3aed",
          pink: "#ec4899",
          cyan: "#06b6d4",
          amber: "#f59e0b",
          emerald: "#10b981",
        },
        border: "rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "gradient-violet": "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
        "gradient-aurora": "linear-gradient(135deg, #06b6d4 0%, #7c3aed 50%, #ec4899 100%)",
        "gradient-warm": "linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)",
        "gradient-cool": "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
