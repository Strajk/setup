function xml2json(h, i) {
  var d = {
    toObj: function (a) {
      var c = {};
      if (a.nodeType == 1) {
        if (a.attributes.length) for (var g = 0; g < a.attributes.length; g++) c["@" + a.attributes[g].nodeName] = (a.attributes[g].nodeValue || "").toString();
        if (a.firstChild) {
          for (var e = g = 0, f = false, b = a.firstChild; b; b = b.nextSibling) if (b.nodeType == 1) f = true; else if (b.nodeType == 3 && b.nodeValue.match(/[^ \f\n\r\t\v]/)) g++; else b.nodeType == 4 && e++;
          if (f) if (g < 2 && e < 2) {
            d.removeWhite(a);
            for (b = a.firstChild; b; b = b.nextSibling) if (b.nodeType == 3) c["#text"] = d.escape(b.nodeValue);
            else if (b.nodeType == 4) c["#cdata"] = d.escape(b.nodeValue); else if (c[b.nodeName]) if (c[b.nodeName] instanceof Array) c[b.nodeName][c[b.nodeName].length] = d.toObj(b); else c[b.nodeName] = [c[b.nodeName], d.toObj(b)]; else c[b.nodeName] = d.toObj(b)
          } else if (a.attributes.length) c["#text"] = d.escape(d.innerXml(a)); else c = d.escape(d.innerXml(a)); else if (g) if (a.attributes.length) c["#text"] = d.escape(d.innerXml(a)); else c = d.escape(d.innerXml(a)); else if (e) if (e > 1) c = d.escape(d.innerXml(a)); else for (b = a.firstChild; b; b = b.nextSibling) c["#cdata"] =
            d.escape(b.nodeValue)
        }
        if (!a.attributes.length && !a.firstChild) c = null
      } else if (a.nodeType == 9) c = d.toObj(a.documentElement); else alert("unhandled node type: " + a.nodeType);
      return c
    }, toJson: function (a, c, g) {
      var e = c ? '"' + c + '"' : "";
      if (a instanceof Array) {
        for (var f = 0, b = a.length; f < b; f++) a[f] = d.toJson(a[f], "", g + "\t");
        e += (c ? ":[" : "[") + (a.length > 1 ? "\n" + g + "\t" + a.join(",\n" + g + "\t") + "\n" + g : a.join("")) + "]"
      } else if (a == null) e += (c && ":") + "null"; else if (typeof a == "object") {
        f = [];
        for (b in a) f[f.length] = d.toJson(a[b], b, g + "\t");
        e += (c ? ":{" : "{") + (f.length > 1 ? "\n" + g + "\t" + f.join(",\n" + g + "\t") + "\n" + g : f.join("")) + "}"
      } else e += typeof a == "string" ? (c && ":") + '"' + a.toString() + '"' : (c && ":") + a.toString();
      return e
    }, innerXml: function (a) {
      var c = "";
      if ("innerHTML" in a) c = a.innerHTML; else {
        var g = function (e) {
          var f = "";
          if (e.nodeType == 1) {
            f += "<" + e.nodeName;
            for (var b = 0; b < e.attributes.length; b++) f += " " + e.attributes[b].nodeName + '="' + (e.attributes[b].nodeValue || "").toString() + '"';
            if (e.firstChild) {
              f += ">";
              for (b = e.firstChild; b; b = b.nextSibling) f += g(b);
              f += "</" +
                e.nodeName + ">"
            } else f += "/>"
          } else if (e.nodeType == 3) f += e.nodeValue; else if (e.nodeType == 4) f += "<![CDATA[" + e.nodeValue + "]]\>";
          return f
        };
        for (a = a.firstChild; a; a = a.nextSibling) c += g(a)
      }
      return c
    }, escape: function (a) {
      return a.replace(/[\\]/g, "\\\\").replace(/[\"]/g, '\\"').replace(/[\n]/g, "\\n").replace(/[\r]/g, "\\r")
    }, removeWhite: function (a) {
      a.normalize();
      for (var c = a.firstChild; c;) if (c.nodeType == 3) if (c.nodeValue.match(/[^ \f\n\r\t\v]/)) c = c.nextSibling; else {
        var g = c.nextSibling;
        a.removeChild(c);
        c = g
      } else {
        c.nodeType ==
        1 && d.removeWhite(c);
        c = c.nextSibling
      }
      return a
    }
  };
  if (h.nodeType == 9) h = h.documentElement;
  var j = d.toJson(d.toObj(d.removeWhite(h)), h.nodeName, "\t");
  return "{\n" + i + (i ? j.replace(/\t/g, i) : j.replace(/\t|\n/g, "")) + "\n}"
};
