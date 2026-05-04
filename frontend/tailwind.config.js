module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'glass': 'rgba(15, 23, 42, 0.5)',
        'glass-light': 'rgba(51, 65, 85, 0.3)',
        'primary': '#0066FF',
        'primary-dark': '#0052CC',
      },
      backdropFilter: {
        'glass': 'blur(10px)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(0, 102, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
