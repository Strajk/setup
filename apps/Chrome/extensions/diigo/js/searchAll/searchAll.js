var SearchUrl = [], Opensearch = [], currentversion = chrome.app.getDetails().version, getTime = {
  getUTCString: function (a) {
    if (a == "now" || !a) {
      var b = new Date;
      b = Date.parse(b) / 1E3;
      return getTime.getUTCString(b)
    }
    var c, f, g, d;
    a = new Date(a * 1E3);
    c = a.getUTCFullYear();
    f = a.getUTCMonth() + 1;
    b = a.getUTCDate();
    g = a.getUTCHours();
    d = a.getUTCMinutes();
    a = a.getUTCSeconds();
    if (f < 10) f = "0" + f;
    if (b < 10) b = "0" + b;
    if (g < 10) g = "0" + g;
    if (d < 10) d = "0" + d;
    if (a < 10) a = "0" + a;
    return c + "-" + f + "-" + b + " " + g + ":" + d + ":" + a
  }, getUTCInt: function (a) {
    if (a == "now" || !a) {
      a =
        new Date;
      return Date.parse(a) / 1E3
    } else {
      a = a.split(" ");
      t0 = a[0].split("-");
      t1 = a[1].split(":");
      t0[1] -= 1;
      if (t0[1] < 10) t0[1] = "0" + t0[1];
      return Date.UTC(t0[0], t0[1], t0[2], t1[0], t1[1], t1[2]) / 1E3
    }
  }, localTimeFromUTC: function (a) {
    var b = -((new Date).getTimezoneOffset() / 60), c = a.split(" ");
    a = c[0].split("-");
    c = c[1].split(":");
    a = new Date(a[0], a[1] - 1, a[2], c[0], c[1]);
    c = a.getHours();
    c += b;
    a.setHours(c);
    return $.format.date(a, "yyyy/MM/dd/HH:mm")
  }
}, util = {
  contextmenus: function (a) {
    switch (a.menuItemId) {
      case 1:
        var b = util.GetGoogleUrl(a.selectionText);
        break;
      case 4:
        b = a.pageUrl.match(/\/\/(.*?)\//)[1];
        b = encodeURIComponent("site:" + b);
        b = localStorage.googlelocal == "true" ? "http://" + chrome.i18n.getMessage("google") + "/search?q=" + b + "+" + encodeURIComponent(a.selectionText) : "http://www.google.com/search?q=" + b + "+" + encodeURIComponent(a.selectionText);
        break;
      case 3:
        b = "http://www.bing.com/search?q=" + encodeURIComponent(a.selectionText);
        break;
      case 2:
        b = "http://search.yahoo.com/search?fr=chr-greentree_gc&ei=utf-8&ilc=12&type=890416&p=" + encodeURIComponent(a.selectionText);
        break;
      case 5:
        b = "http://en.wikipedia.org/wiki/" + encodeURIComponent(a.selectionText);
        break;
      case 6:
        b = util.GetAmazonUrl(a.selectionText);
        break;
      case 7:
        b = "https://twitter.com/#!/search/" + encodeURIComponent(a.selectionText);
        break;
      case 8:
        b = "http://www.youtube.com/results?search_query=" + encodeURIComponent(a.selectionText);
        break;
      case 9:
        b = util.GetEbayUrl(a.selectionText);
        break;
      case 10:
        b = "http://www.wolframalpha.com/input/?i=" + encodeURIComponent(a.selectionText);
        break
    }
    window.open(b)
  }, GetAmazonUrl: function (a) {
    return chrome.i18n.getMessage("amazon") ==
    "www.amazon.com" ? "http://www.amazon.com/gp/search?ie=UTF8&keywords=" + encodeURIComponent(a) + "&tag=diigo0c-20&index=aps&linkCode=ur2&camp=1789&creative=9325" : "http://go.redirectingat.com?id=18202X786788&xs=1&url=" + encodeURIComponent("http://" + chrome.i18n.getMessage("amazon") + "/s/field-keywords=" + encodeURIComponent(a))
  }, GetEbayUrl: function (a) {
    chrome.i18n.getMessage("ebay");
    return "http://go.redirectingat.com?id=18202X786788&xs=1&url=" + encodeURIComponent("http://" + chrome.i18n.getMessage("ebay") + "/sch/i.html?_sacat=See-All-Categories&_nkw=" +
      encodeURIComponent(a))
  }, GetGoogleUrl: function (a) {
    return localStorage.googlelocal == "true" ? "http://" + chrome.i18n.getMessage("google") + "/search?q=" + encodeURIComponent(a) : "http://www.google.com/search?q=" + encodeURIComponent(a)
  }, GetMySearch: function (a) {
    var b = [], c = [];
    LoadItemsByList(1, function (f, g) {
      var d = g.rows, e = d.length;
      for (i = 0; i < e; i++) {
        var h = d.item(i);
        b.push(h)
      }
      d = JSON.parse(localStorage.customize_sort_id);
      for (i = 0; i < d.length; i++) for (k in b) if (b[k].id == d[i]) {
        c.push(b[k]);
        break
      }
      a(c)
    })
  }, CreateContextMenu: function () {
    var a;
    chrome.contextMenus.removeAll(function () {
      util.GetMySearch(function (b) {
        for (i = 0; i < b.length; i++) {
          a = chrome.contextMenus.create({title: b[i].name, onclick: util.ContextMenuClick, contexts: ["selection"]});
          SearchUrl[a] = b[i].searchurl
        }
      })
    })
  }, ContextMenuClick: function (a) {
    console.log(a);
    var b = SearchUrl[a.menuItemId];
    a = encodeURIComponent(a.selectionText);
    b = b.replace("{%s}", a);
    window.open(b)
  }, GetUrl: function (a) {
    return "http://go.redirectingat.com?id=18202X786788&xs=1&url=" + encodeURIComponent(a)
  }, initUserId: function () {
    var a =
      getTime.getUTCInt(), b = parseInt(Math.random() * 10 + 1);
    a = hex_md5("" + a + b);
    console.log(a);
    localStorage.userID = a
  }
}, OPTIONS_TRUE = ["switchbar", "searchsite", "superfish", "bookmarks", "history"], OPTIONS_FALSE = ["googlelocal", "searchselection"];
for (i in OPTIONS_TRUE) localStorage[OPTIONS_TRUE[i]] || (localStorage[OPTIONS_TRUE[i]] = true);
for (i in OPTIONS_FALSE) localStorage[OPTIONS_FALSE[i]] || (localStorage[OPTIONS_FALSE[i]] = false);
chrome.tabs.onUpdated.addListener(function (a, b, c) {
  console.log("update", a, b, c);
  if (b.status != "loading") {
    b = c.url;
    c = b.match(/\.(.*?)\./);
    b = c == null ? b.match(/(.*?)\./)[1] : c[1];
    console.log(b);
    b == "google" && chrome.tabs.sendRequest(a, {action: "tabupdate"});
    chrome.tabs.sendRequest(a, {action: "startdetect"});
    chrome.tabs.sendRequest(a, {action: "insertChango"})
  }
});
Array.prototype.remove = function (a) {
  if (isNaN(a) || a > this.length) return false;
  for (var b = 0, c = 0; b < this.length; b++) if (this[b] != this[a]) this[c++] = this[b];
  this.length -= 1
};
chrome.extension.onRequest.addListener(function (a, b, c) {
  switch (a.action) {
    case "getoption":
      c({option: JSON.stringify(localStorage)});
      break;
    case "search":
      util.contextmenus(a.info, null);
      break;
    case "getsearchs":
      var f = localStorage.querys ? localStorage.querys.split(",") : [];
      util.GetMySearch(function (e) {
        c({searchs: e, querys: f})
      });
      break;
    case "getuserid":
      c({userid: localStorage.userID});
      break;
    case "getsearchbookmarks":
      chrome.bookmarks.search(a.keyword, function (e) {
        chrome.history.search({
          text: a.keyword, maxResults: 1E4,
          startTime: (new Date).getTime() - 15552E6
        }, function (h) {
          function m(p) {
            var o = "chrome://favicon/" + p;
            try {
              requestFile(o, function (r) {
                o = makeDataUrl(r.contentType, r.data)
              }, true)
            } catch (s) {
              o = "img/searchAll/favicon.png"
            }
            return o
          }

          console.log(h);
          for (var l = [], n = [], j = 0; j < e.length; j++) l[j] = m(e[j].url);
          for (j = 0; j < h.length; j++) n[j] = m(h[j].url);
          var q = j = false;
          if (localStorage.bookmarks == "true") j = true;
          if (localStorage.history == "true") q = true;
          c({bookmarkItems: e, historyItems: h, bIcons: l, hIcons: n, ifBookmark: j, ifHistory: q})
        })
      });
      break;
    case "opensearch":
      console.log(a.path);
      getSearchString(a.path);
      break;
    case "resetBadge":
      chrome.tabs.getSelected(null, function (e) {
        chrome.browserAction.getBadgeText({tabId: e.id}, function (h) {
          h != "New" && chrome.browserAction.setBadgeText({text: ""})
        })
      });
      break;
    case "refreshtabid":
      chrome.tabs.getSelected(null, function (e) {
        Opensearch[e.id] = null
      });
      break;
    case "addsearch":
      b = a.searchname;
      var g = a.searchurl, d = getFavicon(g);
      AddCustomizeSearch(b, g, d, function (e, h) {
        var m = h.insertId;
        console.log(m);
        var l = JSON.parse(localStorage.customize_sort_id);
        console.log(typeof l);
        l.push(m.toString());
        localStorage.customize_sort_id = JSON.stringify(l);
        console.log(l)
      });
      console.log(localStorage.customize_sort_id);
      chrome.extension.sendRequest({action: "addsuccess"});
      chrome.browserAction.setBadgeText({text: ""});
      chrome.tabs.getSelected(null, function (e) {
        Opensearch.remove(e.id);
        console.log(Opensearch)
      });
      break;
    case "newtip":
      if (!localStorage.version || localStorage.version != currentversion) {
        chrome.browserAction.setBadgeText({text: "New"});
        count = 1;
        window.open("https://www.diigo.com/searchAll/new-for-search-all.html?v=" +
          currentversion);
        localStorage.version = currentversion;
        chrome.extension.sendRequest({action: "shownew"})
      }
      break;
    case "getAD":
      $.get("http://api.hostip.info/get_json.php", function (e) {
        e = e.ip;
        var h = encodeURIComponent(a.url), m = a.query.replace(/\s/g, "+"), l = encodeURI(window.navigator.userAgent);
        $.get("http://65975.xml.premiumxml.com/xml/?fid=65975&keywords=" + m + "&user_ip=" + e + "&ua=" + l + "&serve_url=" + h, function (n) {
          n = n.getElementsByTagName("listing");
          var j = n.length;
          if (j) {
            for (var q = [], p = 0; p < j; p++) {
              var o = JSON.parse(xml2json(n[p],
                ""));
              q.push(o.listing)
            }
            c({data: q})
          }
        })
      });
      break;
    case "newTab":
      chrome.tabs.create({url: a.url});
      break;
    case "closeBookmarkSearch":
      localStorage.bookmarks = false;
      break;
    case "closeHistorySearch":
      localStorage.history = false;
      break;
    case "saveQuery":
      b = localStorage.querys ? localStorage.querys.split(",") : [];
      g = a.query;
      d = b.indexOf(g);
      if (g == "") return;
      b.length > 10 && b.splice(10, b.length - 10);
      if (d > -1) b.splice(d, 1); else b.length >= 10 && b.pop();
      b.unshift(g);
      localStorage.querys = b.join(",");
      break
  }
});

function getFavicon(a) {
  a = a.match(/\/\/(.*?)\//)[1];
  var b = "chrome://favicon/http://" + a;
  try {
    requestFile(b, function (f) {
      b = makeDataUrl(f.contentType, f.data)
    }, true)
  } catch (c) {
    b = "../style/favicon.png"
  }
  return b
}

localStorage.userID || util.initUserId();
try {
  util.CreateContextMenu()
} catch (e$$2) {
}

function getSearchString(a) {
  xmlhttp = new XMLHttpRequest;
  xmlhttp.open("GET", a, false);
  xmlhttp.send();
  xmlDoc = xmlhttp.responseXML;
  a = $(xmlDoc).find('Url[type="text/html"]');
  var b = xmlDoc.getElementsByTagName("ShortName")[0].childNodes[0].nodeValue;
  console.log(b);
  console.log(a);
  var c = a[0].getAttribute("template");
  a = a[0].getElementsByTagName("Param");
  if (a.length > 0) {
    c += "?";
    for (var f = 0; f < a.length; f++) {
      var g = a[f].getAttribute("name"), d = a[f].getAttribute("value");
      c = f == 0 ? c + g + "=" + d : c + "&" + g + "=" + d
    }
  } else c = c.replace(/searchTerms/,
    "%s");
  c = c.replace(/searchTerms/, "%s");
  console.log(c);
  console.log(Opensearch);
  c && LoadAllItems(function (e, h) {
    console.log(h.rows.length);
    console.log(h.rows.item(0));
    for (var m = 0; m < h.rows.length; m++) if (h.rows.item(m).searchurl.toString().match(/:\/\/([\w | .]+)/)[1] == c.match(/:\/\/([\w | .]+)/)[1]) return;
    chrome.tabs.getSelected(null, function (l) {
      Opensearch[l.id] = [c, b];
      chrome.browserAction.getBadgeText({tabId: l.id}, function (n) {
        n != "New" && chrome.browserAction.setBadgeText({text: "+"})
      })
    });
    chrome.extension.onRequest.addListener(function (l,
                                                     n, j) {
      l.action == "getopensearchurl" && j({searchurl: Opensearch[l.tabid][0], searchname: Opensearch[l.tabid][1]})
    })
  })
}

chrome.tabs.onActivated.addListener(function () {
  chrome.tabs.getSelected(null, function (a) {
    Opensearch[a.id] != null ? chrome.browserAction.setBadgeText({text: "+"}) : chrome.browserAction.getBadgeText({tabId: a.id}, function (b) {
      if (b != "New") {
        console.log("setnull");
        chrome.browserAction.setBadgeText({text: ""})
      }
    })
  })
});
chrome.contextMenus.create({title: "Google image search", contexts: ["image"], onclick: SearchImage});

function validateBase64(a) {
  for (var b = 0; b < a.length; b++) if (!(a[b] >= "a" && a[b] <= "z" || a[b] >= "A" && a[b] <= "Z" || a[b] >= "0" && a[b] <= "9" || a[b] == "+" || a[b] == "/" || a[b] == "." || a[b] == "=")) return false;
  return true
}

function newTab(a) {
  var b = localStorage.imagePreview, c = b.indexOf(",");
  b = 'var form = document.createElement("form");form.setAttribute("method","POST");form.setAttribute("action","http://www.google.com/searchbyimage/upload");form.setAttribute("enctype","multipart/form-data");function addInput(key,value){  var input = document.createElement("input");  input.setAttribute("type","hidden");  input.setAttribute("name",key);  input.setAttribute("value",value);  form.appendChild(input);};addInput("image_content","' + b.substring(c +
    1).replace(/\+/g, "-").replace(/\//g, "_").replace(/\./g, "=") + '");addInput("filename","");addInput("image_url","");addInput("sbisrc","");document.body.appendChild(form);form.submit();';
  chrome.tabs.executeScript(a.id, {code: b})
}

function SearchImage(a) {
  a = a.srcUrl;
  if (a.indexOf("data:") == 0) {
    lower_src = a.toLowerCase();
    if (!lower_src.indexOf("data:image/bmp;") || !lower_src.indexOf("data:image/gif;") || !lower_src.indexOf("data:image/jpeg;") || !lower_src.indexOf("data:image/jpg;") || !lower_src.indexOf("data:image/png;") || !lower_src.indexOf("data:image/tiff;") || !lower_src.indexOf("data:image/x-ico;") || !lower_src.indexOf("data:image/x-tiff;")) {
      var b = a.indexOf(",");
      if (b != -1 && validateBase64(a.substring(b + 1))) {
        localStorage.imagePreview = a;
        chrome.tabs.create({url: "http://images.google.com/imghp?sbi=1", selected: true}, newTab)
      }
    }
  } else {
    a = "http://www.google.com/searchbyimage?&image_url=" + encodeURIComponent(a);
    chrome.tabs.create({url: a, selected: true})
  }
  return true
}

localStorage.version = currentversion;
