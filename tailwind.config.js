/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-ingresado': '#fef3c7', // yellow-100
        'status-revision': '#fde68a', // yellow-200
        'status-reparacion': '#ffedd5', // orange-100
        'status-repuesto': '#fed7aa', // orange-200
        'status-listo': '#dcfce7', // green-100
        'status-avisado': '#d1fae5', // emerald-100
        'status-entregado': '#e0f2fe', // blue-100
      }
    },
  },
  plugins: [],
}
