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
  window.$ = window.jQuery

  // Play here
}
