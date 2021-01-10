(function (a) {
  var c = "object" == typeof window && window || "object" == typeof self && self;
  "undefined" != typeof exports ? a(exports) : c && (c.hljs = a({}), "function" == typeof define && define.amd && define([], function () {
    return c.hljs
  }))
})(function (a) {
  function c(d) {
    return d.replace(/[&<>]/gm, function (g) {
      return S[g]
    })
  }

  function i(d, g) {
    var f = d && d.exec(g);
    return f && 0 === f.index
  }

  function m(d, g) {
    var f, j = {};
    for (f in d) j[f] = d[f];
    if (g) for (f in g) j[f] = g[f];
    return j
  }

  function o(d) {
    var g = [];
    return function f(j, b) {
      for (var h = j.firstChild; h; h =
        h.nextSibling) 3 === h.nodeType ? b += h.nodeValue.length : 1 === h.nodeType && (g.push({event: "start", offset: b, node: h}), b = f(h, b), h.nodeName.toLowerCase().match(/br|hr|img|input/) || g.push({event: "stop", offset: b, node: h}));
      return b
    }(d, 0), g
  }

  function x(d, g, f) {
    function j() {
      return d.length && g.length ? d[0].offset !== g[0].offset ? d[0].offset < g[0].offset ? d : g : "start" === g[0].event ? d : g : d.length ? d : g
    }

    function b(t) {
      y += "<" + t.nodeName.toLowerCase() + N.map.call(t.attributes, function (q) {
          return " " + q.nodeName + '="' + c(q.value) + '"'
        }).join("") +
        ">"
    }

    function h(t) {
      y += "</" + t.nodeName.toLowerCase() + ">"
    }

    function v(t) {
      ("start" === t.event ? b : h)(t.node)
    }

    for (var z = 0, y = "", u = []; d.length || g.length;) {
      var e = j();
      if (y += c(f.substr(z, e[0].offset - z)), z = e[0].offset, e === d) {
        u.reverse().forEach(h);
        do {
          v(e.splice(0, 1)[0]);
          e = j()
        } while (e === d && e.length && e[0].offset === z);
        u.reverse().forEach(b)
      } else {
        "start" === e[0].event ? u.push(e[0].node) : u.pop();
        v(e.splice(0, 1)[0])
      }
    }
    return y + c(f.substr(z))
  }

  function r(d) {
    function g(b) {
      return b && b.source || b
    }

    function f(b, h) {
      return RegExp(g(b),
        "m" + (d.cI ? "i" : "") + (h ? "g" : ""))
    }

    function j(b, h) {
      if (!b.compiled) {
        if (b.compiled = true, b.k = b.k || b.bK, b.k) {
          var v = {}, z = function (e, t) {
            d.cI && (t = t.toLowerCase());
            t.split(" ").forEach(function (q) {
              q = q.split("|");
              v[q[0]] = [e, q[1] ? Number(q[1]) : 1]
            })
          };
          "string" == typeof b.k ? z("keyword", b.k) : J(b.k).forEach(function (e) {
            z(e, b.k[e])
          });
          b.k = v
        }
        b.lR = f(b.l || /\w+/, true);
        h && (b.bK && (b.b = "\\b(" + b.bK.split(" ").join("|") + ")\\b"), b.b || (b.b = /\B|\b/), b.bR = f(b.b), b.e || b.eW || (b.e = /\B|\b/), b.e && (b.eR = f(b.e)), b.tE = g(b.e) || "", b.eW && h.tE &&
        (b.tE += (b.e ? "|" : "") + h.tE));
        b.i && (b.iR = f(b.i));
        null == b.r && (b.r = 1);
        b.c || (b.c = []);
        var y = [];
        b.c.forEach(function (e) {
          e.v ? e.v.forEach(function (t) {
            y.push(m(e, t))
          }) : y.push("self" === e ? b : e)
        });
        b.c = y;
        b.c.forEach(function (e) {
          j(e, b)
        });
        b.starts && j(b.starts, h);
        var u = b.c.map(function (e) {
          return e.bK ? "\\.?(" + e.b + ")\\.?" : e.b
        }).concat([b.tE, b.i]).map(g).filter(Boolean);
        b.t = u.length ? f(u.join("|"), true) : {
          exec: function () {
            return null
          }
        }
      }
    }

    j(d)
  }

  function w(d, g, f, j) {
    function b(p, k) {
      if (i(p.eR, k)) {
        for (; p.endsParent && p.parent;) p =
          p.parent;
        return p
      }
      return p.eW ? b(p.parent, k) : void 0
    }

    function h(p, k, l, n) {
      n = '<span class="' + (n ? "" : A.classPrefix);
      l = l ? "" : K;
      return n += p + '">', n + k + l
    }

    function v() {
      var p = q, k;
      if (null != e.sL) if ((k = "string" == typeof e.sL) && !C[e.sL]) k = c(s); else {
        var l = k ? w(e.sL, s, true, t[e.sL]) : D(s, e.sL.length ? e.sL : void 0);
        k = (e.r > 0 && (I += l.r), k && (t[e.sL] = l.top), h(l.language, l.value, false, true))
      } else {
        var n;
        if (e.k) {
          l = "";
          n = 0;
          e.lR.lastIndex = 0;
          for (k = e.lR.exec(s); k;) {
            l += c(s.substr(n, k.index - n));
            n = e;
            var B = k;
            B = u.cI ? B[0].toLowerCase() : B[0];
            (n = n.k.hasOwnProperty(B) && n.k[B]) ? (I += n[1], l += h(n[0], c(k[0]))) : l += c(k[0]);
            n = e.lR.lastIndex;
            k = e.lR.exec(s)
          }
          k = l + c(s.substr(n))
        } else k = c(s)
      }
      q = p + k;
      s = ""
    }

    function z(p) {
      q += p.cN ? h(p.cN, "", true) : "";
      e = Object.create(p, {parent: {value: e}})
    }

    function y(p, k) {
      if (s += p, null == k) return v(), 0;
      var l;
      a:{
        l = e;
        var n, B;
        n = 0;
        for (B = l.c.length; B > n; n++) if (i(l.c[n].bR, k)) {
          l = l.c[n];
          break a
        }
        l = void 0
      }
      if (l) return l.skip ? s += k : (l.eB && (s += k), v(), l.rB || l.eB || (s = k)), z(l, k), l.rB ? 0 : k.length;
      if (l = b(e, k)) {
        n = e;
        n.skip ? s += k : (n.rE || n.eE || (s += k), v(),
        n.eE && (s = k));
        do {
          e.cN && (q += K);
          e.skip || (I += e.r);
          e = e.parent
        } while (e !== l.parent);
        return l.starts && z(l.starts, ""), n.rE ? 0 : k.length
      }
      if (!f && i(e.iR, k)) throw Error('Illegal lexeme "' + k + '" for mode "' + (e.cN || "<unnamed>") + '"');
      return s += k, k.length || 1
    }

    var u = E(d);
    if (!u) throw Error('Unknown language: "' + d + '"');
    r(u);
    var e = j || u, t = {}, q = "";
    for (j = e; j !== u; j = j.parent) j.cN && (q = h(j.cN, "", true) + q);
    var s = "", I = 0;
    try {
      for (var F, O, G = 0; ;) {
        if (e.t.lastIndex = G, F = e.t.exec(g), !F) break;
        O = y(g.substr(G, F.index - G), F[0]);
        G = F.index + O
      }
      y(g.substr(G));
      for (j = e; j.parent; j = j.parent) j.cN && (q += K);
      return {r: I, value: q, language: d, top: e}
    } catch (L) {
      if (L.message && -1 !== L.message.indexOf("Illegal")) return {r: 0, value: c(g)};
      throw L;
    }
  }

  function D(d, g) {
    g = g || A.languages || J(C);
    var f = {r: 0, value: c(d)}, j = f;
    return g.filter(E).forEach(function (b) {
      var h = w(b, d, false);
      h.language = b;
      h.r > j.r && (j = h);
      h.r > f.r && (j = f, f = h)
    }), j.language && (f.second_best = j), f
  }

  function P(d) {
    return A.tabReplace || A.useBR ? d.replace(T, function (g, f) {
      return A.useBR && "\n" === g ? "<br>" : A.tabReplace ? f.replace(/\t/g,
        A.tabReplace) : void 0
    }) : d
  }

  function Q(d) {
    var g, f, j, b, h;
    a:{
      var v;
      h = d.className + " ";
      if (h += d.parentNode ? d.parentNode.className : "", b = U.exec(h)) h = E(b[1]) ? b[1] : "no-highlight"; else {
        h = h.split(/\s+/);
        b = 0;
        for (v = h.length; v > b; b++) if (f = h[b], R.test(f) || E(f)) {
          h = f;
          break a
        }
        h = void 0
      }
    }
    if (!R.test(h)) {
      A.useBR ? (g = document.createElementNS("http://www.w3.org/1999/xhtml", "div"), g.innerHTML = d.innerHTML.replace(/\n/g, "").replace(/<br[ \/]*>/g, "\n")) : g = d;
      b = g.textContent;
      f = h ? w(h, b, true) : D(b);
      g = o(g);
      g.length && (j = document.createElementNS("http://www.w3.org/1999/xhtml",
        "div"), j.innerHTML = f.value, f.value = x(g, o(j), b));
      f.value = P(f.value);
      d.innerHTML = f.value;
      j = d.className;
      g = h ? M[h] : f.language;
      h = [j.trim()];
      j = (j.match(/\bhljs\b/) || h.push("hljs"), -1 === j.indexOf(g) && h.push(g), h.join(" ").trim());
      d.className = j;
      d.result = {language: f.language, re: f.r};
      f.second_best && (d.second_best = {language: f.second_best.language, re: f.second_best.r})
    }
  }

  function H() {
    if (!H.called) {
      H.called = true;
      var d = document.querySelectorAll("pre code");
      N.forEach.call(d, Q)
    }
  }

  function E(d) {
    return d = (d || "").toLowerCase(),
    C[d] || C[M[d]]
  }

  var N = [], J = Object.keys, C = {}, M = {}, R = /^(no-?highlight|plain|text)$/i, U = /\blang(?:uage)?-([\w-]+)\b/i, T = /((^(<[^>]+>|\t|)+|(?:\n)))/gm, K = "</span>", A = {classPrefix: "hljs-", tabReplace: null, useBR: false, languages: void 0}, S = {"&": "&amp;", "<": "&lt;", ">": "&gt;"};
  return a.highlight = w, a.highlightAuto = D, a.fixMarkup = P, a.highlightBlock = Q, a.configure = function (d) {
    A = m(A, d)
  }, a.initHighlighting = H, a.initHighlightingOnLoad = function () {
    addEventListener("DOMContentLoaded", H, false);
    addEventListener("load", H, false)
  },
    a.registerLanguage = function (d, g) {
      var f = C[d] = g(a);
      f.aliases && f.aliases.forEach(function (j) {
        M[j] = d
      })
    }, a.listLanguages = function () {
    return J(C)
  }, a.getLanguage = E, a.inherit = m, a.IR = "[a-zA-Z]\\w*", a.UIR = "[a-zA-Z_]\\w*", a.NR = "\\b\\d+(\\.\\d+)?", a.CNR = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", a.BNR = "\\b(0b[01]+)", a.RSR = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", a.BE = {
    b: "\\\\[\\s\\S]",
    r: 0
  }, a.ASM = {cN: "string", b: "'", e: "'", i: "\\n", c: [a.BE]}, a.QSM = {cN: "string", b: '"', e: '"', i: "\\n", c: [a.BE]}, a.PWM = {b: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|like)\b/}, a.C = function (d, g, f) {
    d = a.inherit({cN: "comment", b: d, e: g, c: []}, f || {});
    return d.c.push(a.PWM), d.c.push({cN: "doctag", b: "(?:TODO|FIXME|NOTE|BUG|XXX):", r: 0}), d
  }, a.CLCM = a.C("//", "$"), a.CBCM = a.C("/\\*", "\\*/"), a.HCM = a.C("#", "$"), a.NM = {cN: "number", b: a.NR, r: 0}, a.CNM = {
    cN: "number",
    b: a.CNR, r: 0
  }, a.BNM = {cN: "number", b: a.BNR, r: 0}, a.CSSNM = {cN: "number", b: a.NR + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?", r: 0}, a.RM = {cN: "regexp", b: /\//, e: /\/[gimuy]*/, i: /\n/, c: [a.BE, {b: /\[/, e: /\]/, r: 0, c: [a.BE]}]}, a.TM = {cN: "title", b: a.IR, r: 0}, a.UTM = {cN: "title", b: a.UIR, r: 0}, a.METHOD_GUARD = {b: "\\.\\s*" + a.UIR, r: 0}, a
});
hljs.registerLanguage("php", function (a) {
  var c = {b: "\\$+[a-zA-Z_-\u00ff][a-zA-Z0-9_-\u00ff]*"}, i = {cN: "meta", b: /<\?(php)?|\?>/}, m = {cN: "string", c: [a.BE, i], v: [{b: 'b"', e: '"'}, {b: "b'", e: "'"}, a.inherit(a.ASM, {i: null}), a.inherit(a.QSM, {i: null})]}, o = {v: [a.BNM, a.CNM]};
  return {
    aliases: ["php3", "php4", "php5", "php6"], cI: true, k: "and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",
    c: [a.HCM, a.C("//", "$", {c: [i]}), a.C("/\\*", "\\*/", {c: [{cN: "doctag", b: "@[A-Za-z]+"}]}), a.C("__halt_compiler.+?;", false, {eW: true, k: "__halt_compiler", l: a.UIR}), {cN: "string", b: /<<<['"]?\w+['"]?$/, e: /^\w+;?$/, c: [a.BE, {cN: "subst", v: [{b: /\$\w+/}, {b: /\{\$/, e: /\}/}]}]}, i, {cN: "keyword", b: /\$this\b/}, c, {b: /(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/}, {cN: "function", bK: "function", e: /[;{]/, eE: true, i: "\\$|\\[|%", c: [a.UTM, {cN: "params", b: "\\(", e: "\\)", c: ["self", c, a.CBCM, m, o]}]}, {
      cN: "class", bK: "class interface",
      e: "{", eE: true, i: /[:\(\$"]/, c: [{bK: "extends implements"}, a.UTM]
    }, {bK: "namespace", e: ";", i: /[\.']/, c: [a.UTM]}, {bK: "use", e: ";", c: [a.UTM]}, {b: "=>"}, m, o]
  }
});
hljs.registerLanguage("http", function () {
  return {aliases: ["https"], i: "\\S", c: [{b: "^HTTP/[0-9\\.]+", e: "$", c: [{cN: "number", b: "\\b\\d{3}\\b"}]}, {b: "^[A-Z]+ (.*?) HTTP/[0-9\\.]+$", rB: true, e: "$", c: [{cN: "string", b: " ", e: " ", eB: true, eE: true}, {b: "HTTP/[0-9\\.]+"}, {cN: "keyword", b: "[A-Z]+"}]}, {cN: "attribute", b: "^\\w", e: ": ", eE: true, i: "\\n|\\s|=", starts: {e: "$", r: 0}}, {b: "\\n\\n", starts: {sL: [], eW: true}}]}
});
hljs.registerLanguage("ruby", function (a) {
  var c = {keyword: "and then defined module in return redo if BEGIN retry end for self when next until do begin unless END rescue else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor", literal: "true false nil"}, i = {cN: "doctag", b: "@[A-Za-z]+"}, m = {b: "#<", e: ">"};
  i = [a.C("#", "$", {c: [i]}), a.C("^\\=begin", "^\\=end", {c: [i], r: 10}), a.C("^__END__", "\\n$")];
  var o = {cN: "subst", b: "#\\{", e: "}", k: c}, x = {
    cN: "string",
    c: [a.BE, o], v: [{b: /'/, e: /'/}, {b: /"/, e: /"/}, {b: /`/, e: /`/}, {b: "%[qQwWx]?\\(", e: "\\)"}, {b: "%[qQwWx]?\\[", e: "\\]"}, {b: "%[qQwWx]?{", e: "}"}, {b: "%[qQwWx]?<", e: ">"}, {b: "%[qQwWx]?/", e: "/"}, {b: "%[qQwWx]?%", e: "%"}, {b: "%[qQwWx]?-", e: "-"}, {b: "%[qQwWx]?\\|", e: "\\|"}, {b: /\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/}]
  }, r = {cN: "params", b: "\\(", e: "\\)", endsParent: true, k: c};
  a = [x, m, {
    cN: "class", bK: "class module", e: "$|;", i: /=/, c: [a.inherit(a.TM, {b: "[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?"}), {
      b: "<\\s*", c: [{
        b: "(" +
          a.IR + "::)?" + a.IR
      }]
    }].concat(i)
  }, {cN: "function", bK: "def", e: "$|;", c: [a.inherit(a.TM, {b: "[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?"}), r].concat(i)}, {b: a.IR + "::"}, {cN: "symbol", b: a.UIR + "(\\!|\\?)?:", r: 0}, {cN: "symbol", b: ":(?!\\s)", c: [x, {b: "[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?"}], r: 0}, {cN: "number", b: "(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b", r: 0}, {b: "(\\$\\W)|((\\$|\\@\\@?)(\\w+))"}, {
    cN: "params",
    b: /\|/, e: /\|/, k: c
  }, {b: "(" + a.RSR + ")\\s*", c: [m, {cN: "regexp", c: [a.BE, o], i: /\n/, v: [{b: "/", e: "/[a-z]*"}, {b: "%r{", e: "}[a-z]*"}, {b: "%r\\(", e: "\\)[a-z]*"}, {b: "%r!", e: "![a-z]*"}, {b: "%r\\[", e: "\\][a-z]*"}]}].concat(i), r: 0}].concat(i);
  o.c = a;
  r.c = a;
  return {aliases: ["rb", "gemspec", "podspec", "thor", "irb"], k: c, i: /\/\*/, c: i.concat([{b: /^\s*=>/, starts: {e: "$", c: a}}, {cN: "meta", b: "^([>?]>|[\\w#]+\\(\\w+\\):\\d+:\\d+>|(\\w+-)?\\d+\\.\\d+\\.\\d(p\\d+)?[^>]+>)", starts: {e: "$", c: a}}]).concat(a)}
});
hljs.registerLanguage("cpp", function (a) {
  var c = {cN: "keyword", b: "\\b[a-z\\d_]*_t\\b"}, i = {cN: "string", v: [{b: '(u8?|U)?L?"', e: '"', i: "\\n", c: [a.BE]}, {b: '(u8?|U)?R"', e: '"', c: [a.BE]}, {b: "'\\\\?.", e: "'", i: "."}]}, m = {cN: "number", v: [{b: "\\b(0b[01'_]+)"}, {b: "\\b([\\d'_]+(\\.[\\d'_]*)?|\\.[\\d'_]+)(u|U|l|L|ul|UL|f|F|b|B)"}, {b: "(-?)(\\b0[xX][a-fA-F0-9'_]+|(\\b[\\d'_]+(\\.[\\d'_]*)?|\\.[\\d'_]+)([eE][-+]?[\\d'_]+)?)"}], r: 0}, o = {
    cN: "meta", b: /#\s*[a-z]+\b/, e: /$/, k: {"meta-keyword": "if else elif endif define undef warning error line pragma ifdef ifndef include"},
    c: [{b: /\\\n/, r: 0}, a.inherit(i, {cN: "meta-string"}), {cN: "meta-string", b: "<", e: ">", i: "\\n"}, a.CLCM, a.CBCM]
  }, x = a.IR + "\\s*\\(", r = {
    keyword: "int float while private char catch import module export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using class asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue inline delete alignof constexpr decltype noexcept static_assert thread_local restrict _Bool complex _Complex _Imaginary atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong new throw return",
    built_in: "std string cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr",
    literal: "true false nullptr NULL"
  }, w = [c, a.CLCM, a.CBCM, m, i];
  return {
    aliases: ["c", "cc", "h", "c++", "h++", "hpp"], k: r, i: "</", c: w.concat([o, {b: "\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<", e: ">", k: r, c: ["self", c]}, {b: a.IR + "::", k: r}, {v: [{b: /=/, e: /;/}, {b: /\(/, e: /\)/}, {bK: "new throw return else", e: /;/}], k: r, c: w.concat([{b: /\(/, e: /\)/, k: r, c: w.concat(["self"]), r: 0}]), r: 0}, {
      cN: "function", b: "(" + a.IR + "[\\*&\\s]+)+" +
        x, rB: true, e: /[{;=]/, eE: true, k: r, i: /[^\w\s\*&]/, c: [{b: x, rB: true, c: [a.TM], r: 0}, {cN: "params", b: /\(/, e: /\)/, k: r, r: 0, c: [a.CLCM, a.CBCM, i, m, c]}, a.CLCM, a.CBCM, o]
    }]), exports: {preprocessor: o, strings: i, k: r}
  }
});
hljs.registerLanguage("makefile", function (a) {
  var c = {cN: "variable", b: /\$\(/, e: /\)/, c: [a.BE]};
  return {aliases: ["mk", "mak"], c: [a.HCM, {b: /^\w+\s*\W*=/, rB: true, r: 0, starts: {e: /\s*\W*=/, eE: true, starts: {e: /$/, r: 0, c: [c]}}}, {cN: "section", b: /^[\w]+:\s*$/}, {cN: "meta", b: /^\.PHONY:/, e: /$/, k: {"meta-keyword": ".PHONY"}, l: /[\.\w]+/}, {b: /^\t+/, e: /$/, r: 0, c: [a.QSM, c]}]}
});
hljs.registerLanguage("objectivec", function (a) {
  var c = /[a-zA-Z@][a-zA-Z0-9_]*/;
  return {
    aliases: ["mm", "objc", "obj-c"], k: {
      keyword: "int float while char export sizeof typedef const struct for union unsigned long volatile static bool mutable if do return goto void enum else break extern asm case short default double register explicit signed typename this switch continue wchar_t inline readonly assign readwrite self @synchronized id typeof nonatomic super unichar IBOutlet IBAction strong weak copy in out inout bycopy byref oneway __strong __weak __block __autoreleasing @private @protected @public @try @property @end @throw @catch @finally @autoreleasepool @synthesize @dynamic @selector @optional @required @encode @package @import @defs @compatibility_alias __bridge __bridge_transfer __bridge_retained __bridge_retain __covariant __contravariant __kindof _Nonnull _Nullable _Null_unspecified __FUNCTION__ __PRETTY_FUNCTION__ __attribute__ getter setter retain unsafe_unretained nonnull nullable null_unspecified null_resettable class instancetype NS_DESIGNATED_INITIALIZER NS_UNAVAILABLE NS_REQUIRES_SUPER NS_RETURNS_INNER_POINTER NS_INLINE NS_AVAILABLE NS_DEPRECATED NS_ENUM NS_OPTIONS NS_SWIFT_UNAVAILABLE NS_ASSUME_NONNULL_BEGIN NS_ASSUME_NONNULL_END NS_REFINED_FOR_SWIFT NS_SWIFT_NAME NS_SWIFT_NOTHROW NS_DURING NS_HANDLER NS_ENDHANDLER NS_VALUERETURN NS_VOIDRETURN",
      literal: "false true FALSE TRUE nil YES NO NULL",
      built_in: "BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once"
    }, l: c, i: "</", c: [{cN: "built_in", b: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"}, a.CLCM, a.CBCM, a.CNM, a.QSM, {cN: "string", v: [{b: '@"', e: '"', i: "\\n", c: [a.BE]}, {b: "'", e: "[^\\\\]'", i: "[^\\\\][^']"}]}, {cN: "meta", b: "#", e: "$", c: [{cN: "meta-string", v: [{b: '"', e: '"'}, {b: "<", e: ">"}]}]}, {
      cN: "class", b: "(" + "@interface @class @protocol @implementation".split(" ").join("|") + ")\\b", e: "({|$)", eE: true, k: "@interface @class @protocol @implementation",
      l: c, c: [a.UTM]
    }, {b: "\\." + a.UIR, r: 0}]
  }
});
hljs.registerLanguage("coffeescript", function (a) {
  var c = {keyword: "in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super then unless until loop of by when and or is isnt not", literal: "true false null undefined yes no on off", built_in: "npm require console print module global window document"}, i = {cN: "subst", b: /#\{/, e: /}/, k: c}, m = [a.BNM, a.inherit(a.CNM, {starts: {e: "(\\s*/)?", r: 0}}), {
    cN: "string", v: [{b: /'''/, e: /'''/, c: [a.BE]}, {
      b: /'/, e: /'/,
      c: [a.BE]
    }, {b: /"""/, e: /"""/, c: [a.BE, i]}, {b: /"/, e: /"/, c: [a.BE, i]}]
  }, {cN: "regexp", v: [{b: "///", e: "///", c: [i, a.HCM]}, {b: "//[gim]*", r: 0}, {b: /\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/}]}, {b: "@[A-Za-z$_][0-9A-Za-z$_]*"}, {b: "`", e: "`", eB: true, eE: true, sL: "javascript"}];
  i.c = m;
  i = a.inherit(a.TM, {b: "[A-Za-z$_][0-9A-Za-z$_]*"});
  var o = {cN: "params", b: "\\([^\\(]", rB: true, c: [{b: /\(/, e: /\)/, k: c, c: ["self"].concat(m)}]};
  return {
    aliases: ["coffee", "cson", "iced"], k: c, i: /\/\*/, c: m.concat([a.C("###", "###"), a.HCM, {
      cN: "function", b: "^\\s*[A-Za-z$_][0-9A-Za-z$_]*\\s*=\\s*(\\(.*\\))?\\s*\\B[-=]>",
      e: "[-=]>", rB: true, c: [i, o]
    }, {b: /[:\(,=]\s*/, r: 0, c: [{cN: "function", b: "(\\(.*\\))?\\s*\\B[-=]>", e: "[-=]>", rB: true, c: [o]}]}, {cN: "class", bK: "class", e: "$", i: /[:="\[\]]/, c: [{bK: "extends", eW: true, i: /[:="\[\]]/, c: [i]}, i]}, {b: "[A-Za-z$_][0-9A-Za-z$_]*:", e: ":", rB: true, rE: true, r: 0}])
  }
});
hljs.registerLanguage("css", function (a) {
  return {
    cI: true, i: /[=\/|'\$]/, c: [a.CBCM, {cN: "selector-id", b: /#[A-Za-z0-9_-]+/}, {cN: "selector-class", b: /\.[A-Za-z0-9_-]+/}, {cN: "selector-attr", b: /\[/, e: /\]/, i: "$"}, {cN: "selector-pseudo", b: /:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/}, {b: "@(font-face|page)", l: "[a-z-]+", k: "font-face page"}, {b: "@", e: "[{;]", i: /:/, c: [{cN: "keyword", b: /\w+/}, {b: /\s/, eW: true, eE: true, r: 0, c: [a.ASM, a.QSM, a.CSSNM]}]}, {cN: "selector-tag", b: "[a-zA-Z-][a-zA-Z0-9_-]*", r: 0}, {
      b: "{", e: "}", i: /\S/, c: [a.CBCM, {
        b: /[A-Z\_\.\-]+\s*:/,
        rB: true, e: ";", eW: true, c: [{cN: "attribute", b: /\S/, e: ":", eE: true, starts: {eW: true, eE: true, c: [{b: /[\w-]+\(/, rB: true, c: [{cN: "built_in", b: /[\w-]+/}, {b: /\(/, e: /\)/, c: [a.ASM, a.QSM]}]}, a.CSSNM, a.QSM, a.ASM, a.CBCM, {cN: "number", b: "#[0-9A-Fa-f]+"}, {cN: "meta", b: "!important"}]}}]
      }]
    }]
  }
});
hljs.registerLanguage("xml", function (a) {
  var c = {eW: true, i: /</, r: 0, c: [{cN: "attr", b: "[A-Za-z0-9\\._:-]+", r: 0}, {b: /=\s*/, r: 0, c: [{cN: "string", endsParent: true, v: [{b: /"/, e: /"/}, {b: /'/, e: /'/}, {b: /[^\s"'=<>`]+/}]}]}]};
  return {
    aliases: ["html", "xhtml", "rss", "atom", "xjb", "xsd", "xsl", "plist"], cI: true, c: [{cN: "meta", b: "<!DOCTYPE", e: ">", r: 10, c: [{b: "\\[", e: "\\]"}]}, a.C("<!--", "--\>", {r: 10}), {b: "<\\!\\[CDATA\\[", e: "\\]\\]>", r: 10}, {b: /<\?(php)?/, e: /\?>/, sL: "php", c: [{b: "/\\*", e: "\\*/", skip: true}]}, {
      cN: "tag", b: "<style(?=\\s|>|$)",
      e: ">", k: {name: "style"}, c: [c], starts: {e: "</style>", rE: true, sL: ["css", "xml"]}
    }, {cN: "tag", b: "<script(?=\\s|>|$)", e: ">", k: {name: "script"}, c: [c], starts: {e: "<\/script>", rE: true, sL: ["actionscript", "javascript", "handlebars", "xml"]}}, {cN: "meta", v: [{b: /<\?xml/, e: /\?>/, r: 10}, {b: /<\?\w+/, e: /\?>/}]}, {cN: "tag", b: "</?", e: "/?>", c: [{cN: "name", b: /[^\/><\s]+/, r: 0}, c]}]
  }
});
hljs.registerLanguage("python", function (a) {
  var c = {cN: "meta", b: /^(>>>|\.\.\.) /}, i = {cN: "string", c: [a.BE], v: [{b: /(u|b)?r?'''/, e: /'''/, c: [c], r: 10}, {b: /(u|b)?r?"""/, e: /"""/, c: [c], r: 10}, {b: /(u|r|ur)'/, e: /'/, r: 10}, {b: /(u|r|ur)"/, e: /"/, r: 10}, {b: /(b|br)'/, e: /'/}, {b: /(b|br)"/, e: /"/}, a.ASM, a.QSM]}, m = {cN: "number", r: 0, v: [{b: a.BNR + "[lLjJ]?"}, {b: "\\b(0o[0-7]+)[lLjJ]?"}, {b: a.CNR + "[lLjJ]?"}]};
  return {
    aliases: ["py", "gyp"], k: {
      keyword: "and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda async await nonlocal|10 None True False",
      built_in: "Ellipsis NotImplemented"
    }, i: /(<\/|->|\?)/, c: [c, m, i, a.HCM, {v: [{cN: "function", bK: "def", r: 10}, {cN: "class", bK: "class"}], e: /:/, i: /[${=;\n,]/, c: [a.UTM, {cN: "params", b: /\(/, e: /\)/, c: ["self", c, m, i]}, {b: /->/, eW: true, k: "None"}]}, {cN: "meta", b: /^[\t ]*@/, e: /$/}, {b: /\b(print|exec)\(/}]
  }
});
hljs.registerLanguage("bash", function (a) {
  var c = {cN: "variable", v: [{b: /\$[\w\d#@][\w\d_]*/}, {b: /\$\{(.*?)}/}]}, i = {cN: "string", b: /"/, e: /"/, c: [a.BE, c, {cN: "variable", b: /\$\(/, e: /\)/, c: [a.BE]}]};
  return {
    aliases: ["sh", "zsh"], l: /-?[a-z\._]+/, k: {
      keyword: "if then else elif fi for while in do done case esac function", literal: "true false", built_in: "break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",
      _: "-ne -eq -lt -gt -f -d -e -s -l -a"
    }, c: [{cN: "meta", b: /^#![^\n]+sh\s*$/, r: 10}, {cN: "function", b: /\w[\w\d_]*\s*\(\s*\)\s*\{/, rB: true, c: [a.inherit(a.TM, {b: /\w[\w\d_]*/})], r: 0}, a.HCM, i, {cN: "string", b: /'/, e: /'/}, c]
  }
});
hljs.registerLanguage("apache", function (a) {
  var c = {cN: "number", b: "[\\$%]\\d+"};
  return {aliases: ["apacheconf"], cI: true, c: [a.HCM, {cN: "section", b: "</?", e: ">"}, {cN: "attribute", b: /\w+/, r: 0, k: {nomarkup: "order deny allow setenv rewriterule rewriteengine rewritecond documentroot sethandler errordocument loadmodule options header listen serverroot servername"}, starts: {e: /$/, r: 0, k: {literal: "on off all"}, c: [{cN: "meta", b: "\\s\\[", e: "\\]$"}, {cN: "variable", b: "[\\$%]\\{", e: "\\}", c: ["self", c]}, c, a.QSM]}}], i: /\S/}
});
hljs.registerLanguage("ini", function (a) {
  var c = {cN: "string", c: [a.BE], v: [{b: "'''", e: "'''", r: 10}, {b: '"""', e: '"""', r: 10}, {b: '"', e: '"'}, {b: "'", e: "'"}]};
  return {aliases: ["toml"], cI: true, i: /\S/, c: [a.C(";", "$"), a.HCM, {cN: "section", b: /^\s*\[+/, e: /\]+/}, {b: /^[a-z0-9\[\]_-]+\s*=\s*/, e: "$", rB: true, c: [{cN: "attr", b: /[a-z0-9\[\]_-]+/}, {b: /=/, eW: true, r: 0, c: [{cN: "literal", b: /\bon|off|true|false|yes|no\b/}, {cN: "variable", v: [{b: /\$[\w\d"][\w\d_]*/}, {b: /\$\{(.*?)}/}]}, c, {cN: "number", b: /([\+\-]+)?[\d]+_[\d_]+/}, a.NM]}]}]}
});
hljs.registerLanguage("java", function (a) {
  var c = a.UIR + "(<" + a.UIR + "(\\s*,\\s*" + a.UIR + ")*>)?";
  return {
    aliases: ["jsp"], k: "false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private module requires exports", i: /<\/|#/, c: [a.C("/\\*\\*", "\\*/", {
      r: 0,
      c: [{b: /\w+@/, r: 0}, {cN: "doctag", b: "@[A-Za-z]+"}]
    }), a.CLCM, a.CBCM, a.ASM, a.QSM, {cN: "class", bK: "class interface", e: /[{;=]/, eE: true, k: "class interface", i: /[:"\[\]]/, c: [{bK: "extends implements"}, a.UTM]}, {bK: "new throw return else", r: 0}, {
      cN: "function", b: "(" + c + "\\s+)+" + a.UIR + "\\s*\\(", rB: true, e: /[{;=]/, eE: true, k: "false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private module requires exports",
      c: [{b: a.UIR + "\\s*\\(", rB: true, r: 0, c: [a.UTM]}, {cN: "params", b: /\(/, e: /\)/, k: "false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private module requires exports", r: 0, c: [a.ASM, a.QSM, a.CNM, a.CBCM]}, a.CLCM, a.CBCM]
    }, {
      cN: "number", b: "\\b(0[bB]([01]+[01_]+[01]+|[01]+)|0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)|(([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?|\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))([eE][-+]?\\d+)?)[lLfF]?",
      r: 0
    }, {cN: "meta", b: "@[A-Za-z]+"}]
  }
});
hljs.registerLanguage("diff", function () {
  return {aliases: ["patch"], c: [{cN: "meta", r: 10, v: [{b: /^@@ +\-\d+,\d+ +\+\d+,\d+ +@@$/}, {b: /^\*\*\* +\d+,\d+ +\*\*\*\*$/}, {b: /^\-\-\- +\d+,\d+ +\-\-\-\-$/}]}, {cN: "comment", v: [{b: /Index: /, e: /$/}, {b: /={3,}/, e: /$/}, {b: /^\-{3}/, e: /$/}, {b: /^\*{3} /, e: /$/}, {b: /^\+{3}/, e: /$/}, {b: /\*{5}/, e: /\*{5}$/}]}, {cN: "addition", b: "^\\+", e: "$"}, {cN: "deletion", b: "^\\-", e: "$"}, {cN: "addition", b: "^\\!", e: "$"}]}
});
hljs.registerLanguage("sql", function (a) {
  var c = a.C("--", "$");
  return {
    cI: true, i: /[<>{}*#]/, c: [{
      bK: "begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke comment", e: /;/, eW: true, l: /[\w\.]+/, k: {
        keyword: "abort abs absolute acc acce accep accept access accessed accessible account acos action activate add addtime admin administer advanced advise aes_decrypt aes_encrypt after agent aggregate ali alia alias allocate allow alter always analyze ancillary and any anydata anydataset anyschema anytype apply archive archived archivelog are as asc ascii asin assembly assertion associate asynchronous at atan atn2 attr attri attrib attribu attribut attribute attributes audit authenticated authentication authid authors auto autoallocate autodblink autoextend automatic availability avg backup badfile basicfile before begin beginning benchmark between bfile bfile_base big bigfile bin binary_double binary_float binlog bit_and bit_count bit_length bit_or bit_xor bitmap blob_base block blocksize body both bound buffer_cache buffer_pool build bulk by byte byteordermark bytes cache caching call calling cancel capacity cascade cascaded case cast catalog category ceil ceiling chain change changed char_base char_length character_length characters characterset charindex charset charsetform charsetid check checksum checksum_agg child choose chr chunk class cleanup clear client clob clob_base clone close cluster_id cluster_probability cluster_set clustering coalesce coercibility col collate collation collect colu colum column column_value columns columns_updated comment commit compact compatibility compiled complete composite_limit compound compress compute concat concat_ws concurrent confirm conn connec connect connect_by_iscycle connect_by_isleaf connect_by_root connect_time connection consider consistent constant constraint constraints constructor container content contents context contributors controlfile conv convert convert_tz corr corr_k corr_s corresponding corruption cos cost count count_big counted covar_pop covar_samp cpu_per_call cpu_per_session crc32 create creation critical cross cube cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime customdatum cycle data database databases datafile datafiles datalength date_add date_cache date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts day day_to_second dayname dayofmonth dayofweek dayofyear days db_role_change dbtimezone ddl deallocate declare decode decompose decrement decrypt deduplicate def defa defau defaul default defaults deferred defi defin define degrees delayed delegate delete delete_all delimited demand dense_rank depth dequeue des_decrypt des_encrypt des_key_file desc descr descri describ describe descriptor deterministic diagnostics difference dimension direct_load directory disable disable_all disallow disassociate discardfile disconnect diskgroup distinct distinctrow distribute distributed div do document domain dotnet double downgrade drop dumpfile duplicate duration each edition editionable editions element ellipsis else elsif elt empty enable enable_all enclosed encode encoding encrypt end end-exec endian enforced engine engines enqueue enterprise entityescaping eomonth error errors escaped evalname evaluate event eventdata events except exception exceptions exchange exclude excluding execu execut execute exempt exists exit exp expire explain export export_set extended extent external external_1 external_2 externally extract failed failed_login_attempts failover failure far fast feature_set feature_value fetch field fields file file_name_convert filesystem_like_logging final finish first first_value fixed flash_cache flashback floor flush following follows for forall force form forma format found found_rows freelist freelists freepools fresh from from_base64 from_days ftp full function general generated get get_format get_lock getdate getutcdate global global_name globally go goto grant grants greatest group group_concat group_id grouping grouping_id groups gtid_subtract guarantee guard handler hash hashkeys having hea head headi headin heading heap help hex hierarchy high high_priority hosts hour http id ident_current ident_incr ident_seed identified identity idle_time if ifnull ignore iif ilike ilm immediate import in include including increment index indexes indexing indextype indicator indices inet6_aton inet6_ntoa inet_aton inet_ntoa infile initial initialized initially initrans inmemory inner innodb input insert install instance instantiable instr interface interleaved intersect into invalidate invisible is is_free_lock is_ipv4 is_ipv4_compat is_not is_not_null is_used_lock isdate isnull isolation iterate java join json json_exists keep keep_duplicates key keys kill language large last last_day last_insert_id last_value lax lcase lead leading least leaves left len lenght length less level levels library like like2 like4 likec limit lines link list listagg little ln load load_file lob lobs local localtime localtimestamp locate locator lock locked log log10 log2 logfile logfiles logging logical logical_reads_per_call logoff logon logs long loop low low_priority lower lpad lrtrim ltrim main make_set makedate maketime managed management manual map mapping mask master master_pos_wait match matched materialized max maxextents maximize maxinstances maxlen maxlogfiles maxloghistory maxlogmembers maxsize maxtrans md5 measures median medium member memcompress memory merge microsecond mid migration min minextents minimum mining minus minute minvalue missing mod mode model modification modify module monitoring month months mount move movement multiset mutex name name_const names nan national native natural nav nchar nclob nested never new newline next nextval no no_write_to_binlog noarchivelog noaudit nobadfile nocheck nocompress nocopy nocycle nodelay nodiscardfile noentityescaping noguarantee nokeep nologfile nomapping nomaxvalue nominimize nominvalue nomonitoring none noneditionable nonschema noorder nopr nopro noprom nopromp noprompt norely noresetlogs noreverse normal norowdependencies noschemacheck noswitch not nothing notice notrim novalidate now nowait nth_value nullif nulls num numb numbe nvarchar nvarchar2 object ocicoll ocidate ocidatetime ociduration ociinterval ociloblocator ocinumber ociref ocirefcursor ocirowid ocistring ocitype oct octet_length of off offline offset oid oidindex old on online only opaque open operations operator optimal optimize option optionally or oracle oracle_date oradata ord ordaudio orddicom orddoc order ordimage ordinality ordvideo organization orlany orlvary out outer outfile outline output over overflow overriding package pad parallel parallel_enable parameters parent parse partial partition partitions pascal passing password password_grace_time password_lock_time password_reuse_max password_reuse_time password_verify_function patch path patindex pctincrease pctthreshold pctused pctversion percent percent_rank percentile_cont percentile_disc performance period period_add period_diff permanent physical pi pipe pipelined pivot pluggable plugin policy position post_transaction pow power pragma prebuilt precedes preceding precision prediction prediction_cost prediction_details prediction_probability prediction_set prepare present preserve prior priority private private_sga privileges procedural procedure procedure_analyze processlist profiles project prompt protection public publishingservername purge quarter query quick quiesce quota quotename radians raise rand range rank raw read reads readsize rebuild record records recover recovery recursive recycle redo reduced ref reference referenced references referencing refresh regexp_like register regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy reject rekey relational relative relaylog release release_lock relies_on relocate rely rem remainder rename repair repeat replace replicate replication required reset resetlogs resize resource respect restore restricted result result_cache resumable resume retention return returning returns reuse reverse revoke right rlike role roles rollback rolling rollup round row row_count rowdependencies rowid rownum rows rtrim rules safe salt sample save savepoint sb1 sb2 sb4 scan schema schemacheck scn scope scroll sdo_georaster sdo_topo_geometry search sec_to_time second section securefile security seed segment select self sequence sequential serializable server servererror session session_user sessions_per_user set sets settings sha sha1 sha2 share shared shared_pool short show shrink shutdown si_averagecolor si_colorhistogram si_featurelist si_positionalcolor si_stillimage si_texture siblings sid sign sin size size_t sizes skip slave sleep smalldatetimefromparts smallfile snapshot some soname sort soundex source space sparse spfile split sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_small_result sql_variant_property sqlcode sqldata sqlerror sqlname sqlstate sqrt square standalone standby start starting startup statement static statistics stats_binomial_test stats_crosstab stats_ks_test stats_mode stats_mw_test stats_one_way_anova stats_t_test_ stats_t_test_indep stats_t_test_one stats_t_test_paired stats_wsr_test status std stddev stddev_pop stddev_samp stdev stop storage store stored str str_to_date straight_join strcmp strict string struct stuff style subdate subpartition subpartitions substitutable substr substring subtime subtring_index subtype success sum suspend switch switchoffset switchover sync synchronous synonym sys sys_xmlagg sysasm sysaux sysdate sysdatetimeoffset sysdba sysoper system system_user sysutcdatetime table tables tablespace tan tdo template temporary terminated tertiary_weights test than then thread through tier ties time time_format time_zone timediff timefromparts timeout timestamp timestampadd timestampdiff timezone_abbr timezone_minute timezone_region to to_base64 to_date to_days to_seconds todatetimeoffset trace tracking transaction transactional translate translation treat trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse type ub1 ub2 ub4 ucase unarchived unbounded uncompress under undo unhex unicode uniform uninstall union unique unix_timestamp unknown unlimited unlock unpivot unrecoverable unsafe unsigned until untrusted unusable unused update updated upgrade upped upper upsert url urowid usable usage use use_stored_outlines user user_data user_resources users using utc_date utc_timestamp uuid uuid_short validate validate_password_strength validation valist value values var var_samp varcharc vari varia variab variabl variable variables variance varp varraw varrawc varray verify version versions view virtual visible void wait wallet warning warnings week weekday weekofyear wellformed when whene whenev wheneve whenever where while whitespace with within without work wrapped xdb xml xmlagg xmlattributes xmlcast xmlcolattval xmlelement xmlexists xmlforest xmlindex xmlnamespaces xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltype xor year year_to_month years yearweek",
        literal: "true false null", built_in: "array bigint binary bit blob boolean char character date dec decimal float int int8 integer interval number numeric real record serial serial8 smallint text varchar varying void"
      }, c: [{cN: "string", b: "'", e: "'", c: [a.BE, {b: "''"}]}, {cN: "string", b: '"', e: '"', c: [a.BE, {b: '""'}]}, {cN: "string", b: "`", e: "`", c: [a.BE]}, a.CNM, a.CBCM, c]
    }, a.CBCM, c]
  }
});
hljs.registerLanguage("perl", function (a) {
  var c = {
    cN: "subst",
    b: "[$@]\\{",
    e: "\\}",
    k: "getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when"
  }, i =
    {b: "->{", e: "}"}, m = {v: [{b: /\$\d/}, {b: /[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/}, {b: /[\$%@][^\s\w{]/, r: 0}]}, o = [a.BE, c, m];
  a = [m, a.HCM, a.C("^\\=\\w", "\\=cut", {eW: true}), i, {cN: "string", c: o, v: [{b: "q[qwxr]?\\s*\\(", e: "\\)", r: 5}, {b: "q[qwxr]?\\s*\\[", e: "\\]", r: 5}, {b: "q[qwxr]?\\s*\\{", e: "\\}", r: 5}, {b: "q[qwxr]?\\s*\\|", e: "\\|", r: 5}, {b: "q[qwxr]?\\s*\\<", e: "\\>", r: 5}, {b: "qw\\s+q", e: "q", r: 5}, {b: "'", e: "'", c: [a.BE]}, {b: '"', e: '"'}, {b: "`", e: "`", c: [a.BE]}, {b: "{\\w+}", c: [], r: 0}, {b: "-?\\w+\\s*\\=\\>", c: [], r: 0}]},
    {cN: "number", b: "(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b", r: 0}, {b: "(\\/\\/|" + a.RSR + "|\\b(split|return|print|reverse|grep)\\b)\\s*", k: "split return print reverse grep", r: 0, c: [a.HCM, {cN: "regexp", b: "(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*", r: 10}, {cN: "regexp", b: "(m|qr)?/", e: "/[a-z]*", c: [a.BE], r: 0}]}, {cN: "function", bK: "sub", e: "(\\s*\\(.*?\\))?[;{]", eE: true, r: 5, c: [a.TM]}, {b: "-\\w\\b", r: 0}, {b: "^__DATA__$", e: "^__END__$", sL: "mojolicious", c: [{b: "^@@.*", e: "$", cN: "comment"}]}];
  return c.c = a, i.c = a, {
    aliases: ["pl", "pm"],
    l: /[\w\.]+/,
    k: "getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when",
    c: a
  }
});
hljs.registerLanguage("markdown", function () {
  return {
    aliases: ["md", "mkdown", "mkd"], c: [{cN: "section", v: [{b: "^#{1,6}", e: "$"}, {b: "^.+?\\n[=-]{2,}$"}]}, {b: "<", e: ">", sL: "xml", r: 0}, {cN: "bullet", b: "^([*+-]|(\\d+\\.))\\s+"}, {cN: "strong", b: "[*_]{2}.+?[*_]{2}"}, {cN: "emphasis", v: [{b: "\\*.+?\\*"}, {b: "_.+?_", r: 0}]}, {cN: "quote", b: "^>\\s+", e: "$"}, {cN: "code", v: [{b: "^```w*s*$", e: "^```s*$"}, {b: "`.+?`"}, {b: "^( {4}|\t)", e: "$", r: 0}]}, {b: "^[-\\*]{3,}", e: "$"}, {
      b: "\\[.+?\\][\\(\\[].*?[\\)\\]]", rB: true, c: [{
        cN: "string", b: "\\[",
        e: "\\]", eB: true, rE: true, r: 0
      }, {cN: "link", b: "\\]\\(", e: "\\)", eB: true, eE: true}, {cN: "symbol", b: "\\]\\[", e: "\\]", eB: true, eE: true}], r: 10
    }, {b: /^\[[^\n]+\]:/, rB: true, c: [{cN: "symbol", b: /\[/, e: /\]/, eB: true, eE: true}, {cN: "link", b: /:\s*/, e: /$/, eB: true}]}]
  }
});
hljs.registerLanguage("nginx", function (a) {
  var c = {cN: "variable", v: [{b: /\$\d+/}, {b: /\$\{/, e: /}/}, {b: "[\\$\\@]" + a.UIR}]};
  return {
    aliases: ["nginxconf"], c: [a.HCM, {b: a.UIR + "\\s+{", rB: true, e: "{", c: [{cN: "section", b: a.UIR}], r: 0}, {
      b: a.UIR + "\\s", e: ";|{", rB: true, c: [{
        cN: "attribute", b: a.UIR, starts: {
          eW: true, l: "[a-z/_]+", k: {literal: "on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"}, r: 0, i: "=>", c: [a.HCM, {
            cN: "string", c: [a.BE,
              c], v: [{b: /"/, e: /"/}, {b: /'/, e: /'/}]
          }, {b: "([a-z]+):/", e: "\\s", eW: true, eE: true, c: [c]}, {cN: "regexp", c: [a.BE, c], v: [{b: "\\s\\^", e: "\\s|{|;", rE: true}, {b: "~\\*?\\s+", e: "\\s|{|;", rE: true}, {b: "\\*(\\.[a-z\\-]+)+"}, {b: "([a-z\\-]+\\.)+\\*"}]}, {cN: "number", b: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"}, {cN: "number", b: "\\b\\d+[kKmMgGdshdwy]*\\b", r: 0}, c]
        }
      }], r: 0
    }], i: "[^\\s\\}]"
  }
});
hljs.registerLanguage("json", function (a) {
  var c = {literal: "true false null"}, i = [a.QSM, a.CNM], m = {e: ",", eW: true, eE: true, c: i, k: c}, o = {b: "{", e: "}", c: [{cN: "attr", b: /"/, e: /"/, c: [a.BE], i: "\\n"}, a.inherit(m, {b: /:/})], i: "\\S"};
  a = {b: "\\[", e: "\\]", c: [a.inherit(m)], i: "\\S"};
  return i.splice(i.length, 0, o, a), {c: i, k: c, i: "\\S"}
});
hljs.registerLanguage("javascript", function (a) {
  return {
    aliases: ["js", "jsx"], k: {keyword: "in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await static import from as", literal: "true false null undefined NaN Infinity", built_in: "eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},
    c: [{cN: "meta", r: 10, b: /^\s*['"]use (strict|asm)['"]/}, {cN: "meta", b: /^#!/, e: /$/}, a.ASM, a.QSM, {cN: "string", b: "`", e: "`", c: [a.BE, {cN: "subst", b: "\\$\\{", e: "\\}"}]}, a.CLCM, a.CBCM, {cN: "number", v: [{b: "\\b(0[bB][01]+)"}, {b: "\\b(0[oO][0-7]+)"}, {b: a.CNR}], r: 0}, {b: "(" + a.RSR + "|\\b(case|return|throw)\\b)\\s*", k: "return throw case", c: [a.CLCM, a.CBCM, a.RM, {b: /</, e: /(\/\w+|\w+\/)>/, sL: "xml", c: [{b: /<\w+\s*\/>/, skip: true}, {b: /<\w+/, e: /(\/\w+|\w+\/)>/, skip: true, c: ["self"]}]}], r: 0}, {
      cN: "function", bK: "function", e: /\{/, eE: true,
      c: [a.inherit(a.TM, {b: /[A-Za-z$_][0-9A-Za-z$_]*/}), {cN: "params", b: /\(/, e: /\)/, eB: true, eE: true, c: [a.CLCM, a.CBCM]}], i: /\[|%/
    }, {b: /\$[(.]/}, a.METHOD_GUARD, {cN: "class", bK: "class", e: /[{;=]/, eE: true, i: /[:"\[\]]/, c: [{bK: "extends"}, a.UTM]}, {bK: "constructor", e: /\{/, eE: true}], i: /#(?!!)/
  }
});
hljs.registerLanguage("cs", function (a) {
  var c = {keyword: "abstract as base bool break byte case catch char checked const continue decimal dynamic default delegate do double else enum event explicit extern finally fixed float for foreach goto if implicit in int interface internal is lock long when object operator out override params private protected public readonly ref sbyte sealed short sizeof stackalloc static string struct switch this try typeof uint ulong unchecked unsafe ushort using virtual volatile void while async nameof ascending descending from get group into join let orderby partial select set value var where yield", literal: "null false true"},
    i = {cN: "string", b: '@"', e: '"', c: [{b: '""'}]}, m = a.inherit(i, {i: /\n/}), o = {cN: "subst", b: "{", e: "}", k: c}, x = a.inherit(o, {i: /\n/}), r = {cN: "string", b: /\$"/, e: '"', i: /\n/, c: [{b: "{{"}, {b: "}}"}, a.BE, x]}, w = {cN: "string", b: /\$@"/, e: '"', c: [{b: "{{"}, {b: "}}"}, {b: '""'}, o]}, D = a.inherit(w, {i: /\n/, c: [{b: "{{"}, {b: "}}"}, {b: '""'}, x]});
  o.c = [w, r, i, a.ASM, a.QSM, a.CNM, a.CBCM];
  x.c = [D, r, m, a.ASM, a.QSM, a.CNM, a.inherit(a.CBCM, {i: /\n/})];
  i = {v: [w, r, i, a.ASM, a.QSM]};
  m = a.IR + "(<" + a.IR + ">)?(\\[\\])?";
  return {
    aliases: ["csharp"], k: c, i: /::/, c: [a.C("///",
      "$", {rB: true, c: [{cN: "doctag", v: [{b: "///", r: 0}, {b: "<!--|--\>"}, {b: "</?", e: ">"}]}]}), a.CLCM, a.CBCM, {cN: "meta", b: "#", e: "$", k: {"meta-keyword": "if else elif endif define undef warning error line region endregion pragma checksum"}}, i, a.CNM, {bK: "class interface", e: /[{;=]/, i: /[^\s:]/, c: [a.TM, a.CLCM, a.CBCM]}, {bK: "namespace", e: /[{;=]/, i: /[^\s:]/, c: [a.inherit(a.TM, {b: "[a-zA-Z](\\.?\\w)*"}), a.CLCM, a.CBCM]}, {bK: "new return throw await", r: 0}, {
      cN: "function", b: "(" + m + "\\s+)+" + a.IR + "\\s*\\(", rB: true, e: /[{;=]/, eE: true,
      k: c, c: [{b: a.IR + "\\s*\\(", rB: true, c: [a.TM], r: 0}, {cN: "params", b: /\(/, e: /\)/, eB: true, eE: true, k: c, r: 0, c: [i, a.CNM, a.CBCM]}, a.CLCM, a.CBCM]
    }]
  }
});
