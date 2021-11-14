module.exports = (wallaby) => ({
  files: [
    // "**/*.js",
    "programs/markdown-niceify/markdown-niceify.js",
    { pattern: "**/*.test.js", ignore: true },
  ],
  tests: [
    // "**/*.test.js",
    "programs/markdown-niceify/markdown-niceify.test.js",
  ],
  env: {
    type: "node",
    runner: "node",
  },
  testFramework: "jest",
})
