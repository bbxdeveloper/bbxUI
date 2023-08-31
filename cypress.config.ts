export default {
  component: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
    indexHtmlFile: "src/index.html",
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
