module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'spellcheck'
  ],
  extends: [
    'standard-with-typescript',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": 2
  },
};
