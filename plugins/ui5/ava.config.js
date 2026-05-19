export default {
  typescript: {
    rewritePaths: {
      'test/': 'dist/test/',
    },
    compile: false,
  },
  files: ['dist/test/**/*.test.js'],
  timeout: '2m',
  verbose: true,
  environmentVariables: {
    NODE_ENV: 'test',
  },
};
