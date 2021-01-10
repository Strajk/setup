function MD5(a) {
  function k(m, n) {
    var p, r, s, q, o;
    s = m & 2147483648;
    q = n & 2147483648;
    p = m & 1073741824;
    r = n & 1073741824;
    o = (m & 1073741823) + (n & 1073741823);
    if (p & r) return o ^ 2147483648 ^ s ^ q;
    return p | r ? o & 1073741824 ? o ^ 3221225472 ^ s ^ q : o ^ 1073741824 ^ s ^ q : o ^ s ^ q
  }

  function b(m, n, p, r, s, q, o) {
    m = k(m, k(k(n & p | ~n & r, s), o));
    return k(m << q | m >>> 32 - q, n)
  }

  function c(m, n, p, r, s, q, o) {
    m = k(m, k(k(n & r | p & ~r, s), o));
    return k(m << q | m >>> 32 - q, n)
  }

  function d(m, n, p, r, s, q, o) {
    m = k(m, k(k(n ^ p ^ r, s), o));
    return k(m << q | m >>> 32 - q, n)
  }

  function e(m, n, p, r, s, q, o) {
    m = k(m, k(k(p ^
      (n | ~r), s), o));
    return k(m << q | m >>> 32 - q, n)
  }

  function j(m) {
    var n = "", p = "", r;
    for (r = 0; r <= 3; r++) {
      p = m >>> r * 8 & 255;
      p = "0" + p.toString(16);
      n += p.substr(p.length - 2, 2)
    }
    return n
  }

  var l = [], t, u, v, w, f, g, h, i;
  l = function (m) {
    var n, p = m.length;
    n = p + 8;
    for (var r = ((n - n % 64) / 64 + 1) * 16, s = Array(r - 1), q = 0, o = 0; o < p;) {
      n = (o - o % 4) / 4;
      q = o % 4 * 8;
      s[n] |= m.charCodeAt(o) << q;
      o++
    }
    n = (o - o % 4) / 4;
    q = o % 4 * 8;
    s[n] |= 128 << q;
    s[r - 2] = p << 3;
    s[r - 1] = p >>> 29;
    return s
  }(a);
  f = 1732584193;
  g = 4023233417;
  h = 2562383102;
  i = 271733878;
  for (a = 0; a < l.length; a += 16) {
    t = f;
    u = g;
    v = h;
    w = i;
    f = b(f, g, h, i,
      l[a + 0], 7, 3614090360);
    i = b(i, f, g, h, l[a + 1], 12, 3905402710);
    h = b(h, i, f, g, l[a + 2], 17, 606105819);
    g = b(g, h, i, f, l[a + 3], 22, 3250441966);
    f = b(f, g, h, i, l[a + 4], 7, 4118548399);
    i = b(i, f, g, h, l[a + 5], 12, 1200080426);
    h = b(h, i, f, g, l[a + 6], 17, 2821735955);
    g = b(g, h, i, f, l[a + 7], 22, 4249261313);
    f = b(f, g, h, i, l[a + 8], 7, 1770035416);
    i = b(i, f, g, h, l[a + 9], 12, 2336552879);
    h = b(h, i, f, g, l[a + 10], 17, 4294925233);
    g = b(g, h, i, f, l[a + 11], 22, 2304563134);
    f = b(f, g, h, i, l[a + 12], 7, 1804603682);
    i = b(i, f, g, h, l[a + 13], 12, 4254626195);
    h = b(h, i, f, g, l[a + 14], 17, 2792965006);
    g = b(g,
      h, i, f, l[a + 15], 22, 1236535329);
    f = c(f, g, h, i, l[a + 1], 5, 4129170786);
    i = c(i, f, g, h, l[a + 6], 9, 3225465664);
    h = c(h, i, f, g, l[a + 11], 14, 643717713);
    g = c(g, h, i, f, l[a + 0], 20, 3921069994);
    f = c(f, g, h, i, l[a + 5], 5, 3593408605);
    i = c(i, f, g, h, l[a + 10], 9, 38016083);
    h = c(h, i, f, g, l[a + 15], 14, 3634488961);
    g = c(g, h, i, f, l[a + 4], 20, 3889429448);
    f = c(f, g, h, i, l[a + 9], 5, 568446438);
    i = c(i, f, g, h, l[a + 14], 9, 3275163606);
    h = c(h, i, f, g, l[a + 3], 14, 4107603335);
    g = c(g, h, i, f, l[a + 8], 20, 1163531501);
    f = c(f, g, h, i, l[a + 13], 5, 2850285829);
    i = c(i, f, g, h, l[a + 2], 9, 4243563512);
    h = c(h,
      i, f, g, l[a + 7], 14, 1735328473);
    g = c(g, h, i, f, l[a + 12], 20, 2368359562);
    f = d(f, g, h, i, l[a + 5], 4, 4294588738);
    i = d(i, f, g, h, l[a + 8], 11, 2272392833);
    h = d(h, i, f, g, l[a + 11], 16, 1839030562);
    g = d(g, h, i, f, l[a + 14], 23, 4259657740);
    f = d(f, g, h, i, l[a + 1], 4, 2763975236);
    i = d(i, f, g, h, l[a + 4], 11, 1272893353);
    h = d(h, i, f, g, l[a + 7], 16, 4139469664);
    g = d(g, h, i, f, l[a + 10], 23, 3200236656);
    f = d(f, g, h, i, l[a + 13], 4, 681279174);
    i = d(i, f, g, h, l[a + 0], 11, 3936430074);
    h = d(h, i, f, g, l[a + 3], 16, 3572445317);
    g = d(g, h, i, f, l[a + 6], 23, 76029189);
    f = d(f, g, h, i, l[a + 9], 4, 3654602809);
    i = d(i, f, g, h, l[a + 12], 11, 3873151461);
    h = d(h, i, f, g, l[a + 15], 16, 530742520);
    g = d(g, h, i, f, l[a + 2], 23, 3299628645);
    f = e(f, g, h, i, l[a + 0], 6, 4096336452);
    i = e(i, f, g, h, l[a + 7], 10, 1126891415);
    h = e(h, i, f, g, l[a + 14], 15, 2878612391);
    g = e(g, h, i, f, l[a + 5], 21, 4237533241);
    f = e(f, g, h, i, l[a + 12], 6, 1700485571);
    i = e(i, f, g, h, l[a + 3], 10, 2399980690);
    h = e(h, i, f, g, l[a + 10], 15, 4293915773);
    g = e(g, h, i, f, l[a + 1], 21, 2240044497);
    f = e(f, g, h, i, l[a + 8], 6, 1873313359);
    i = e(i, f, g, h, l[a + 15], 10, 4264355552);
    h = e(h, i, f, g, l[a + 6], 15, 2734768916);
    g = e(g, h, i, f, l[a + 13], 21,
      1309151649);
    f = e(f, g, h, i, l[a + 4], 6, 4149444226);
    i = e(i, f, g, h, l[a + 11], 10, 3174756917);
    h = e(h, i, f, g, l[a + 2], 15, 718787259);
    g = e(g, h, i, f, l[a + 9], 21, 3951481745);
    f = k(f, t);
    g = k(g, u);
    h = k(h, v);
    i = k(i, w)
  }
  return (j(f) + j(g) + j(h) + j(i)).toLowerCase()
}

var hexcase = 0;

function hex_md5(a) {
  return rstr2hex(rstr_md5(str2rstr_utf8(a)))
}

function hex_hmac_md5(a, k) {
  return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(k)))
}

function md5_vm_test() {
  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72"
}

function rstr_md5(a) {
  return binl2rstr(binl_md5(rstr2binl(a), a.length * 8))
}

function rstr_hmac_md5(a, k) {
  var b = rstr2binl(a);
  if (b.length > 16) b = binl_md5(b, a.length * 8);
  for (var c = Array(16), d = Array(16), e = 0; e < 16; e++) {
    c[e] = b[e] ^ 909522486;
    d[e] = b[e] ^ 1549556828
  }
  b = binl_md5(c.concat(rstr2binl(k)), 512 + k.length * 8);
  return binl2rstr(binl_md5(d.concat(b), 640))
}

function rstr2hex(a) {
  for (var k = hexcase ? "0123456789ABCDEF" : "0123456789abcdef", b = "", c, d = 0; d < a.length; d++) {
    c = a.charCodeAt(d);
    b += k.charAt(c >>> 4 & 15) + k.charAt(c & 15)
  }
  return b
}

function str2rstr_utf8(a) {
  for (var k = "", b = -1, c, d; ++b < a.length;) {
    c = a.charCodeAt(b);
    d = b + 1 < a.length ? a.charCodeAt(b + 1) : 0;
    if (55296 <= c && c <= 56319 && 56320 <= d && d <= 57343) {
      c = 65536 + ((c & 1023) << 10) + (d & 1023);
      b++
    }
    if (c <= 127) k += String.fromCharCode(c); else if (c <= 2047) k += String.fromCharCode(192 | c >>> 6 & 31, 128 | c & 63); else if (c <= 65535) k += String.fromCharCode(224 | c >>> 12 & 15, 128 | c >>> 6 & 63, 128 | c & 63); else if (c <= 2097151) k += String.fromCharCode(240 | c >>> 18 & 7, 128 | c >>> 12 & 63, 128 | c >>> 6 & 63, 128 | c & 63)
  }
  return k
}

function rstr2binl(a) {
  for (var k = Array(a.length >> 2), b = 0; b < k.length; b++) k[b] = 0;
  for (b = 0; b < a.length * 8; b += 8) k[b >> 5] |= (a.charCodeAt(b / 8) & 255) << b % 32;
  return k
}

function binl2rstr(a) {
  for (var k = "", b = 0; b < a.length * 32; b += 8) k += String.fromCharCode(a[b >> 5] >>> b % 32 & 255);
  return k
}

function binl_md5(a, k) {
  a[k >> 5] |= 128 << k % 32;
  a[(k + 64 >>> 9 << 4) + 14] = k;
  for (var b = 1732584193, c = -271733879, d = -1732584194, e = 271733878, j = 0; j < a.length; j += 16) {
    var l = b, t = c, u = d, v = e;
    b = md5_ff(b, c, d, e, a[j + 0], 7, -680876936);
    e = md5_ff(e, b, c, d, a[j + 1], 12, -389564586);
    d = md5_ff(d, e, b, c, a[j + 2], 17, 606105819);
    c = md5_ff(c, d, e, b, a[j + 3], 22, -1044525330);
    b = md5_ff(b, c, d, e, a[j + 4], 7, -176418897);
    e = md5_ff(e, b, c, d, a[j + 5], 12, 1200080426);
    d = md5_ff(d, e, b, c, a[j + 6], 17, -1473231341);
    c = md5_ff(c, d, e, b, a[j + 7], 22, -45705983);
    b = md5_ff(b, c, d, e, a[j + 8], 7,
      1770035416);
    e = md5_ff(e, b, c, d, a[j + 9], 12, -1958414417);
    d = md5_ff(d, e, b, c, a[j + 10], 17, -42063);
    c = md5_ff(c, d, e, b, a[j + 11], 22, -1990404162);
    b = md5_ff(b, c, d, e, a[j + 12], 7, 1804603682);
    e = md5_ff(e, b, c, d, a[j + 13], 12, -40341101);
    d = md5_ff(d, e, b, c, a[j + 14], 17, -1502002290);
    c = md5_ff(c, d, e, b, a[j + 15], 22, 1236535329);
    b = md5_gg(b, c, d, e, a[j + 1], 5, -165796510);
    e = md5_gg(e, b, c, d, a[j + 6], 9, -1069501632);
    d = md5_gg(d, e, b, c, a[j + 11], 14, 643717713);
    c = md5_gg(c, d, e, b, a[j + 0], 20, -373897302);
    b = md5_gg(b, c, d, e, a[j + 5], 5, -701558691);
    e = md5_gg(e, b, c, d, a[j +
    10], 9, 38016083);
    d = md5_gg(d, e, b, c, a[j + 15], 14, -660478335);
    c = md5_gg(c, d, e, b, a[j + 4], 20, -405537848);
    b = md5_gg(b, c, d, e, a[j + 9], 5, 568446438);
    e = md5_gg(e, b, c, d, a[j + 14], 9, -1019803690);
    d = md5_gg(d, e, b, c, a[j + 3], 14, -187363961);
    c = md5_gg(c, d, e, b, a[j + 8], 20, 1163531501);
    b = md5_gg(b, c, d, e, a[j + 13], 5, -1444681467);
    e = md5_gg(e, b, c, d, a[j + 2], 9, -51403784);
    d = md5_gg(d, e, b, c, a[j + 7], 14, 1735328473);
    c = md5_gg(c, d, e, b, a[j + 12], 20, -1926607734);
    b = md5_hh(b, c, d, e, a[j + 5], 4, -378558);
    e = md5_hh(e, b, c, d, a[j + 8], 11, -2022574463);
    d = md5_hh(d, e, b, c, a[j +
    11], 16, 1839030562);
    c = md5_hh(c, d, e, b, a[j + 14], 23, -35309556);
    b = md5_hh(b, c, d, e, a[j + 1], 4, -1530992060);
    e = md5_hh(e, b, c, d, a[j + 4], 11, 1272893353);
    d = md5_hh(d, e, b, c, a[j + 7], 16, -155497632);
    c = md5_hh(c, d, e, b, a[j + 10], 23, -1094730640);
    b = md5_hh(b, c, d, e, a[j + 13], 4, 681279174);
    e = md5_hh(e, b, c, d, a[j + 0], 11, -358537222);
    d = md5_hh(d, e, b, c, a[j + 3], 16, -722521979);
    c = md5_hh(c, d, e, b, a[j + 6], 23, 76029189);
    b = md5_hh(b, c, d, e, a[j + 9], 4, -640364487);
    e = md5_hh(e, b, c, d, a[j + 12], 11, -421815835);
    d = md5_hh(d, e, b, c, a[j + 15], 16, 530742520);
    c = md5_hh(c, d, e,
      b, a[j + 2], 23, -995338651);
    b = md5_ii(b, c, d, e, a[j + 0], 6, -198630844);
    e = md5_ii(e, b, c, d, a[j + 7], 10, 1126891415);
    d = md5_ii(d, e, b, c, a[j + 14], 15, -1416354905);
    c = md5_ii(c, d, e, b, a[j + 5], 21, -57434055);
    b = md5_ii(b, c, d, e, a[j + 12], 6, 1700485571);
    e = md5_ii(e, b, c, d, a[j + 3], 10, -1894986606);
    d = md5_ii(d, e, b, c, a[j + 10], 15, -1051523);
    c = md5_ii(c, d, e, b, a[j + 1], 21, -2054922799);
    b = md5_ii(b, c, d, e, a[j + 8], 6, 1873313359);
    e = md5_ii(e, b, c, d, a[j + 15], 10, -30611744);
    d = md5_ii(d, e, b, c, a[j + 6], 15, -1560198380);
    c = md5_ii(c, d, e, b, a[j + 13], 21, 1309151649);
    b = md5_ii(b,
      c, d, e, a[j + 4], 6, -145523070);
    e = md5_ii(e, b, c, d, a[j + 11], 10, -1120210379);
    d = md5_ii(d, e, b, c, a[j + 2], 15, 718787259);
    c = md5_ii(c, d, e, b, a[j + 9], 21, -343485551);
    b = safe_add(b, l);
    c = safe_add(c, t);
    d = safe_add(d, u);
    e = safe_add(e, v)
  }
  return Array(b, c, d, e)
}

function md5_cmn(a, k, b, c, d, e) {
  return safe_add(bit_rol(safe_add(safe_add(k, a), safe_add(c, e)), d), b)
}

function md5_ff(a, k, b, c, d, e, j) {
  return md5_cmn(k & b | ~k & c, a, k, d, e, j)
}

function md5_gg(a, k, b, c, d, e, j) {
  return md5_cmn(k & c | b & ~c, a, k, d, e, j)
}

function md5_hh(a, k, b, c, d, e, j) {
  return md5_cmn(k ^ b ^ c, a, k, d, e, j)
}

function md5_ii(a, k, b, c, d, e, j) {
  return md5_cmn(b ^ (k | ~c), a, k, d, e, j)
}

function safe_add(a, k) {
  var b = (a & 65535) + (k & 65535);
  return (a >> 16) + (k >> 16) + (b >> 16) << 16 | b & 65535
}

function bit_rol(a, k) {
  return a << k | a >>> 32 - k
};
