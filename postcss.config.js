module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // CSS Minification für Production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          colormin: true,
          minifyFontValues: true,
          minifySelectors: true,
          mergeLonghand: true,
          mergeRules: true,
          minifyGradients: true,
          normalizeUrl: true,
          orderedValues: true,
          reduceIdents: true,
          zindex: false,
        }],
      },
    }),
  },
};