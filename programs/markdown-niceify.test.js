/* eslint-env jest */
const main = require("./markdown-niceify")

const SRC = `
- https://www.reddit.com/r/Fire
- https://www.reddit.com/user/straaajk
- [/r/investing](https://www.reddit.com/r/investing)
- https://reactjs.org/docs/hooks-reference.html
`.trimStart()

const DST = `
- [/r/Fire](https://www.reddit.com/r/Fire)
- [/u/straaajk](https://www.reddit.com/user/straaajk)
- [/r/investing](https://www.reddit.com/r/investing)
- [reactjs.org/docs/hooks-reference](https://reactjs.org/docs/hooks-reference.html)
`.trimStart()

describe("Hygiene", () => {
  test("Basics", () => {
    // expect(main("a")).toBe("b")
  })

  test("Examples", () => {
    expect(main(SRC)).toEqual(DST)
  })
})
