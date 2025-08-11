export default [
  {
    input: './scripts/popup.js',
    output: {
      file: './build/popup.js',
      format: 'iife', // Immediately Invoked Function Expression
      name: 'vaulter' // Global variable name for the bundle
    },
    plugins: [
      // Add any Rollup plugins here if needed
    ]
  }, {
    input: './scripts/options.js',
    output: {
      file: './build/options.js',
      format: 'iife', // Immediately Invoked Function Expression
      name: 'vaulter' // Global variable name for the bundle
    },
    plugins: [
      // Add any Rollup plugins here if needed
    ]
  }
]