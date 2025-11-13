module.exports = {
  printWidth: 130,
  semi: true,
  tabWidth: 4,
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: '*.less',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
