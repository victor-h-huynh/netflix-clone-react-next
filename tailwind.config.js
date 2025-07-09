/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "netflix-sans": ["Netflix Sans", "sans-serif"],
        // You can add other custom fonts here too
      },
      // You can also extend other theme properties like colors, spacing, etc.
    },
  },
  plugins: [],
};
