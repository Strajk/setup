// 2021-11-13: Decided to switch to markdownlint
// Remark's modularity sounded good in theory, but was too painful to maintain

module.exports = {
  "plugins": [
    "frontmatter",
    ["remark-lint-list-item-indent", false],
    ["remark-lint-blockquote-indentation", 2],
    ["remark-lint-checkbox-character-style", {checked: 'x', unchecked: ' '}],
    ["remark-lint-checkbox-content-indent"],
    ["remark-lint-code-block-style", "fenced"],
    ["remark-lint-list-item-spacing", { checkBlanks: true }],
    ["remark-lint-definition-case"],
    ["remark-lint-definition-spacing"],
    ["remark-lint-emphasis-marker", "*"],
    ["remark-lint-fenced-code-flag", {allowEmpty: true, flags: ["js"]}],
    ["remark-lint-fenced-code-marker", "`"],
    ["remark-lint-final-newline"],
    // ["remark-lint-final-definition"], // Disabled on purpose
    // ["remark-lint-first-heading-level", 1], // Disabled cause it doesn't work with frontmatter
    ["remark-lint-hard-break-spaces"],
    // ["remark-lint-heading-increment"], // Disabled on purpose
    ["remark-lint-heading-style", "atx"],
    // ["remark-lint-linebreak-style"], // Done with EditorConfig
    ["remark-lint-link-title-style", "\""],
    ["remark-lint-list-item-bullet-indent"],
    ["remark-lint-list-item-content-indent"],
    ["remark-lint-list-item-indent", "space"],
    // ["remark-lint-file-extension"], Disabled as I use MDX and the rule is not configuranoble
    ["remark-lint-maximum-heading-length", 80],
    // ["remark-lint-maximum-line-length"], Disabled on purpose
    ["remark-lint-no-auto-link-without-protocol"],
    ["remark-lint-no-blockquote-without-marker"],
    ["remark-lint-no-consecutive-blank-lines"],
    ["remark-lint-no-duplicate-definitions"],
    // ["remark-lint-no-duplicate-headings"], // Disabled on purposed, I wanna unique **structured** headings
    ["remark-lint-no-duplicate-headings-in-section"], // Note: probably doesn't work
    ["remark-lint-no-emphasis-as-heading"],
    ["remark-lint-no-empty-url"],
    ["remark-lint-no-heading-content-indent"],
    ["remark-lint-no-heading-indent"],
    ["remark-lint-no-heading-like-paragraph"],
    ["remark-lint-no-heading-punctuation", "?"],
    ["remark-lint-no-inline-padding"],
    ["remark-lint-no-literal-urls"],
    ["remark-lint-no-missing-blank-lines", {exceptTightLists: true}],
    // ["remark-lint-no-multiple-toplevel-headings"], // Disabled on purpose
    ["remark-lint-no-table-indentation"],
    ["remark-lint-no-tabs"],
    ["remark-lint-unordered-list-marker-style", "-"],
    ["remark-lint-ordered-list-marker-style", "."],
    ["remark-lint-no-undefined-references"], // TODO: Breaks
    ["remark-lint-no-unused-definitions"], // TODO: Breaks
    ["remark-lint-ordered-list-marker-value", "one"],
    ["remark-lint-rule-style", "---"],
    ["remark-lint-strong-marker", "*"],
    // ["remark-lint-table-cell-padding", "consistent"],
    // ["remark-lint-table-pipe-alignment", ""],
    // ["remark-lint-table-pipes", ""],
  ]
}
