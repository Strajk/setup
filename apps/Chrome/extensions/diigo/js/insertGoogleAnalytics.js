(function (a, e, f, g, b, c, d) {
  a.GoogleAnalyticsObject = b;
  a[b] = a[b] || function () {
    (a[b].q = a[b].q || []).push(arguments)
  };
  a[b].l = 1 * new Date;
  c = e.createElement(f);
  d = e.getElementsByTagName(f)[0];
  c.async = 1;
  c.src = g;
  d.parentNode.insertBefore(c, d)
})(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");
ga("create", "UA-295754-15", "auto");
ga("set", "checkProtocolTask", null);
