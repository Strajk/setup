function insertScript(a) {
  var b = document.createElement("script");
  b.type = "text/javascript";
  if (a.file) {
    a = a.file;
    /^.+:\/\//.test(a) || (a = chrome.extension.getURL(a));
    b.src = a
  } else if (a.code) {
    var c = document.createTextNode();
    c.nodeValue = a.code;
    b.appendChild(c)
  }
  document.body.appendChild(b)
}

diigoletLaunchMode = 0;
insertScript({file: "js/content/diigolet.js?m=" + Math.random()});
