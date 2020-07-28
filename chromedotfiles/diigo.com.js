/* TODO: Nicer */
function injectJs (what) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script")

    if (what.startsWith("//")) { // Only for local development, CWS disallows remote code
      el.src = what
    } else {
      el.textContent = what
    }

    el.onerror = reject
    el.onload = resolve

    document.head.appendChild(el)
  })
}

(async () => {
  const ID = "__INJECTED_BY_DOTJS__"
  await injectJs("//cdn.jsdelivr.net/npm/arrive@2.4.1/minified/arrive.min.js")
  if (!document.getElementById(ID)) {
    const script = document.createElement("script")
    script.setAttribute("id", ID)
    script.text = `(${main.toString()})();`
    document.documentElement.appendChild(script)
  }
})()

function main () {
  // Autoconfirm deletion
  document.arrive(".ModalWindow .deleteItem button.confirm", (el) => {
    window.$(el).click()
  })
}
