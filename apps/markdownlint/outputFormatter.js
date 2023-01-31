// Modified markdownlint-cli2-formatter-pretty

process.env.FORCE_COLOR = "2" // Needed for WebStorm, otherwise https://github.com/chalk/supports-color will not recognize the terminal

const { "default": chalk } = require("chalk")

const outputFormatter = async (options, params) => {
  const { results, logError } = options
  const { appendLink } = (params || {})
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  // const { "default": chalk } = await import("chalk");
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  for (const errorInfo of results) {
    // eslint-disable-next-line no-unused-vars
    const { fileName, lineNumber, ruleNames, ruleDescription, ruleInformation, errorDetail, errorContext, errorRange } = errorInfo
    const ruleName = ruleNames.join("/")

    const detailsAndContext =
      (errorDetail ? ` [${errorDetail}]` : "") +
      (errorContext ? ` ${errorContext}` : "")
    const appendText = appendLink && ruleInformation
      ? ` ${ruleInformation}`
      : ""
    const column = (errorRange && errorRange[0]) || 0
    logError(
      // eslint-disable-next-line prefer-template
      chalk.magenta(fileName) +
      chalk.cyan(":") +
      chalk.green(lineNumber) +
      (column ? chalk.cyan(":") + chalk.green(column) : "") +
      " " +
      chalk.gray(ruleName) +
      // " " +
      // ruleDescription +
      chalk.gray(detailsAndContext) +
      (appendText.length > 0 ? chalk.blueBright(appendText) : ""),
    )
  }
}

module.exports = outputFormatter
