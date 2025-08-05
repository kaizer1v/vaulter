export default {
  input: './scripts/index.js',
  output: {
    file: 'popup.js',
    format: 'iife', // Immediately Invoked Function Expression
    name: 'vaulter' // Global variable name for the bundle
  },
  plugins: [
    // Add any Rollup plugins here if needed
  ]
}