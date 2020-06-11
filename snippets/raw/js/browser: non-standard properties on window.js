document.body.appendChild(document.createElement("div")).innerHTML = "<iframe id='_INJECTED_' style='display:none'></iframe>"
Object.keys(window).filter(a => !(a in window.frames[window.frames.length - 1])).sort().forEach((a, i) => console.log(i, a, window[a]))
document.body.removeChild($$("#_INJECTED_")[0].parentNode)
