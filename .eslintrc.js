module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'prefer-object-spread': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'no-console': 0,
    'global-require': 0,
    'import/no-dynamic-require': 0,
    'no-plusplus': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'prefer-const':0,
    '@typescript-eslint/no-shadow': 0,
    'array-callback-return': 0,
    'default-case':0,
  },
  ignorePatterns: ['src/__tests__/**', 'rollup.config.js', 'commitlint.config.js'],
};
