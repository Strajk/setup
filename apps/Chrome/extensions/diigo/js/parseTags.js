var ParseTags = {
  quoteTag: function (a) {
    a = a.replace(/"/g, "'").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    if (a.match(/\s+|,/)) a = '"' + a + '"';
    return a
  }, parseTags: function (a, c) {
    function d() {
      if (e.length > 0) {
        f.push(e.join(""));
        e.length = 0
      }
    }

    for (var e = [], f = [], g = false, h = 0, i = a.length, b; b = a.charAt(h), h < i; h++) if (b == '"') if (g) {
      g = false;
      d()
    } else g = true; else if (g) e.push(b); else /\s/.test(b) || b == "," ? d() : e.push(b);
    d();
    if (c) f = map2(unique(f), function (j) {
      return trim(j) || null
    });
    return f
  }, unparseTags: function (a, c) {
    c = c || " ";
    return map(a,
      function (d) {
        return this.quoteTag(d)
      }, this).join(c)
  }
};
