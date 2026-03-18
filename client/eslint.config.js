// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      'react-native': require('eslint-plugin-react-native'),
    },
    rules: {
      'react-native/no-raw-text': ['warn', { skip: ['ThemedText', 'Text'] }],
    },
    ignores: ['dist/*'],
  },
]);
