/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",   // пути к твоим файлам
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        agile: ['ZeroPrimeALILE', 'sans-serif'], // добавляем наш шрифт
      },
    },
  },
  plugins: [],
}