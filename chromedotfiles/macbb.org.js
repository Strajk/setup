(() => {
  const ID = "__INJECTED_BY_DOTJS__"
  if (!document.getElementById(ID)) {
    const script = document.createElement("script")
    script.setAttribute("id", ID)
    script.text = `(${main.toString()})();`
    document.documentElement.appendChild(script)
  }
})()

function main () {
  window.jQuery(
    [
      ".structItem-parts li:nth-child(3):contains('Apple News & Updates')",
      ".structItem-parts li:nth-child(3):contains('General Discussion')",
      ".structItem-parts li:nth-child(3):contains('Fun, Games & Jokes')",
      ".structItem-parts li:nth-child(3):contains('Tinderbox')",
      ".structItem-parts li:nth-child(3):contains('Audiophiles area')",
      ".structItem-parts li:nth-child(3):contains('Movie/TV Shows Corner')",
      ".structItem-parts li:nth-child(3):contains('Movie/TV Shows Corner')",
    ].join(", "),
  )
    .parents(".structItem")
    .css("opacity", 0.2)
}
