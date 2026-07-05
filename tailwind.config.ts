import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1E90FF",
          cyan: "#45D9FF",
          purple: "#7A3FFF",
          light: "#EAEFF5",
          navy: {
            900: "#121826",
            950: "#081321",
          },
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #29B6FF 0%, #2C7BFF 50%, #7A3FFF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
