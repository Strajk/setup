/* eslint-env jest */
const markdownlint = require("markdownlint")
const rule = require("../rules/referenced-assets-must-exist")

test("rule", () => {
  const src = `${__dirname}/assets/referenced-assets-must-exist/test.md`
  const results = markdownlint.sync({
    customRules: rule,
    files: [src],
  })

  expect(results[src].length).toEqual(2)
})
