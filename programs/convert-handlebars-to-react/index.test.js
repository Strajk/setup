/* eslint-env jest */
const fn = require("./index")

const SRC = `
{{>inputText
    id=(concat _id '-foo')
    captionCells=3
    gridCells=9
    isEditing=false
    value=requestUrl
    field=webhookSchema.requestUrl
    reloadWith=requestUrl
}}
`.trimStart()

const DST = `
<inputText
    id={(concat _id '-foo')}
    isEditing={false}
    value={requestUrl}
    field={webhookSchema.requestUrl}
    reloadWith={requestUrl}
/>`.trimStart()

test("convert-handlebars-to-react", () => {
  expect(fn(SRC)).toBe(DST)
})
