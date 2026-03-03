import daisyui from "daisyui";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [daisyui],
  daisyui: {
    themes: ["dark"],
  },
};

export default config;
