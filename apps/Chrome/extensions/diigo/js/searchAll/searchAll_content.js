var HOST = "", URL = "", ISSEARCH, OPTION;
HOST = window.location.host;
var TEXT = "", googleSites = ["www.google.com.hk", "www.google.com.tw", "www.google.co.jp", "www.google.cn", "www.google.co.kr", "www.google.co.th", "www.google.de", "www.google.fr", "www.google.co.uk", "www.google.com.gr", "www.google.com.au", "www.google.ca", "www.google.co.il", "www.google.it", "www.google.ch", "www.google.cl", "www.google.nl", "www.google.be", "www.google.at", "www.google.com.pa", "www.google.pl", "www.google.com.ru", "www.google.com.br", "www.google.co.nz", "www.google.lt", "www.google.com.ar", "www.google.bi",
  "http://paoniu8.blogbus.com", "www.google.pn", "www.google.li", "www.google.com.nf", "www.google.vg", "www.google.mw", "www.google.fm", "www.google.sh", "www.google.cd", "www.google.ms", "www.google.co.cr", "www.google.lv", "www.google.ie", "www.google.co.gg", "www.google.co.je", "www.google.ae", "www.google.fi", "www.google.com.sg", "www.google.com.pe", "www.google.pr", "www.google.com.py", "www.google.gm", "www.google.td", "www.google.co.hu", "www.google.com.mx", "www.google.pt", "www.google.com.ua", "www.google.co.ve", "www.google.com.tr",
  "www.google.com.mt", "www.google.com.uy", "www.google.com.np", "www.google.hn", "www.google.com.ni", "www.google.gl", "www.google.kz", "www.google.sm", "www.google.co.mu", "www.google.as", "www.google.rw", "www.google.com.tj"], superfishBlacklist = ["www.interflora.co.uk"], Search = {
  specialurl: function (a) {
    var c = window.location.href, e;
    switch (a) {
      case "twitter.com":
        e = c.match(/\/search\/(.*?)(&|$)/);
        break;
      case "plus.google.com":
        e = c.match(/\/s\/(.*?)(&|$)/);
        break;
      case "www.shopping.com":
        e = c.match(/\/www.shopping.com\/(.*?)\/products/);
        break;
      case "www.tumblr.com":
        e = c.match(/\/tagged\/(.*?)(&|$)/);
        break;
      case "en.wikipedia.org":
        e = c.match(/\/wiki\/(.*?)(&|$)/);
        break;
      case "dictionary.reference.com":
        e = c.match(/\/browse\/(.*?)(&|$)/);
        break
    }
    return e
  }, showbar: function (a, c, e, j, g) {
    if (c == "special") c = Search.specialurl(e); else {
      c = RegExp("[&|?|#]" + c + "(.*?)(&|$|#)", "i");
      c = window.location.href.match(c)
    }
    if (c) {
      c = c[1];
      if (HOST == "www.google.com") {
        var d = document.getElementsByName("q")[0];
        if (d) c = d.value
      }
      $("body").addClass("searchbarshow");
      $("body").prepend('<div id="searchbar" class="searchbar"><div id="searchHistory">Keywords</div><ul id="searchHistory-list"></ul><div id="tab"><ul></ul><span class="button" title="Customize search engines"></span></div><div class="clear" style="clear:both;"></div></div>');
      j.length != 0 ? $("#searchHistory").show() : $("#searchHistory").hide();
      for (d = 0; d < j.length; d++) {
        var f = '<li><a href="' + g.replace("{%s}", j[d]) + '">' + j[d] + "</a></li>";
        $("#searchHistory-list").append(f)
      }
      $("#searchHistory").on("click", function (h) {
        h.preventDefault();
        h.stopPropagation();
        $("#searchHistory-list").is(":visible") ? $("#searchHistory-list").hide() : $("#searchHistory-list").show()
      });
      HOST == "www.facebook.com" && $("#blueBar").removeClass("fixed_elem");
      j = a.length > 10 ? 10 : a.length;
      for (d = 0; d < j; d++) {
        imgurl = a[d].icondataurl.slice(0,
          4) == "data" ? a[d].icondataurl : chrome.extension.getURL(a[d].icondataurl);
        var k = a[d].searchurl.replace("{%s}", c);
        g = a[d].searchurl.match(/\/\/(.*?)\//)[1];
        g = "<li " + (g == e ? 'class="current"' : "") + '><a href="' + k + '" onClick="return false;" target="_parent"><img src="' + imgurl + '" />' + a[d].name + "</a></li>";
        $("#searchbar #tab ul").append(g)
      }
      if (a.length > 10) {
        $("#searchbar #tab ul").append('<li id="switchbarmore"><a href="#" class="moreicon"></a></li>');
        $("#switchbarmore").append('<div id="moreswitchlist"></div>');
        for (d = 10; d < a.length; d++) {
          imgurl = a[d].icondataurl.slice(0, 4) == "data" ? a[d].icondataurl : chrome.extension.getURL(a[d].icondataurl);
          k = a[d].searchurl.replace("{%s}", c);
          g = a[d].searchurl.match(/\/\/(.*?)\//)[1];
          g = '<li><a href="' + k + '" target="_parent" title="' + a[d].name + '"><img src="' + imgurl + '" />' + a[d].name + "</a></li>";
          $("#moreswitchlist").append(g)
        }
      }
      $("#searchbar #tab ul li a").click(function (h) {
        if (h = $(h.target).attr("href")) {
          h.match(/\/\/(.*?)\//);
          k = h;
          window.location.href = k
        }
      });
      $("#searchbar .button").click(function () {
        var h =
          chrome.extension.getURL("options.html");
        chrome.extension.sendRequest({action: "newTab", url: h})
      });
      chrome.extension.sendRequest({action: "saveQuery", query: decodeURIComponent(c)})
    }
  }, addbar: function () {
    HOST = window.location.host;
    URL = window.location.href;
    OPTION.switchbar != "false" && chrome.extension.sendRequest({action: "getsearchs"}, function (a) {
      var c = a.searchs;
      console.log("searchs", c);
      a = a.querys;
      for (i = 0; i < c.length; i++) {
        var e = c[i].searchurl.match(/\/\/(.*?)\//)[1];
        if (HOST == e || $.inArray(HOST, googleSites) != -1) {
          if (/google\.(.*)\/maps/.test(URL)) return;
          var j = c[i].searchurl.match(/[&|\?]([-\=\w]+)\{%s\}/);
          j = j ? j[1] : "special";
          Search.removebar();
          Search.showbar(c, j, e, a, c[i].searchurl);
          break
        }
      }
    })
  }, removebar: function () {
    $(".searchbar") && $(".searchbar").remove()
  }, searchinsite: function () {
    if (!ISSEARCH) if (!($("#searchinsite").length > 0)) {
      var a = document.referrer;
      if (!(a.length < 1)) {
        a = Search.issearch(a, a);
        a.query && OPTION.searchsite != "false" && this.showsearchinsite(a.query)
      }
    }
  }, showsearchinsite: function (a) {
    var c = encodeURIComponent("site:" + window.location.host);
    a = '<div id="searchinsite"><div id="hidetool" style="display:none;"><span></span></div><div id="showtool"><h3>SearchO Extension<span class="hide"></span><span class="button"></span></h3><div class="searchbox">Search <b contentEditable="true">' +
      decodeURIComponent(a) + "</b> in this site<span></span></div>";
    $("body").append(a);
    $("#searchinsite #showtool .searchbox span").click(function () {
      var e = "http://www.searcho.com/search/google?q=" + c + "+" + encodeURIComponent($("#searchinsite #showtool .searchbox b").html()) + "&c=chromesearcho";
      window.open(e)
    });
    $("#searchinsite #showtool .searchbox b").keydown(function (e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        e = "http://www.searcho.com/search/google?q=" + c + "+" + encodeURIComponent($("#searchinsite #showtool .searchbox b").html()) +
          "&c=chromesearcho";
        window.open(e)
      }
    });
    $("#searchinsite #showtool h3 .hide").click(function () {
      $("#searchinsite #showtool").hide();
      $("#searchinsite #hidetool").show()
    });
    $("#searchinsite #hidetool span").click(function () {
      $("#searchinsite #showtool").show();
      $("#searchinsite #hidetool").hide()
    });
    $("#searchinsite #showtool h3 .button").click(function () {
      var e = chrome.extension.getURL("options.html");
      window.open(e)
    })
  }, modifysearchosite: function () {
    OPTION.switchbar == "false" ? $("#searchBar #tab li span.popup").show() :
      $("#searchBar li a").removeAttr("target")
  }, searchforselect: function () {
    $("#selectsearch").length > 0 || chrome.extension.sendRequest({action: "getsearchs"}, function (a) {
      function c(g, d) {
        if (g == "http://option/") window.open(chrome.extension.getURL("options.html")); else {
          var f = encodeURIComponent(TEXT);
          f = g.replace("{%s}", f);
          if (d == "www.ebay.com" || d == "www.newegg.com") f = Search.GetUrl(f);
          window.open(f)
        }
      }

      a = a.searchs;
      $("body").prepend('<div id="selectsearch" class="selectsearch"><div id="floaticon"></div><div id="list"></div><div id="searchlist"><ul></ul><ul><li data-url="http://option/">Options...</li></ul></div></div>');
      var e = a.length > 10 ? 10 : a.length;
      for (i = 0; i < e; i++) {
        imgurl = a[i].icondataurl.slice(0, 4) == "data" ? a[i].icondataurl : chrome.extension.getURL(a[i].icondataurl);
        var j = '<li data-url="' + a[i].searchurl + '"><img src="' + imgurl + '" />' + a[i].name + "</li>";
        $("#searchlist ul:eq(0)").append(j)
      }
      if (a.length > 10) {
        $("#searchlist ul:eq(0)").append('<li id="searchlistmore">More</li>');
        $("#searchlistmore").append('<div id="MoreSearchList"></div>');
        for (i = 10; i < a.length; i++) {
          imgurl = a[i].icondataurl.slice(0, 4) == "data" ? a[i].icondataurl :
            chrome.extension.getURL(a[i].icondataurl);
          j = '<li data-url="' + a[i].searchurl + '"><img src="' + imgurl + '" />' + a[i].name + "</li>";
          $("#MoreSearchList").append(j)
        }
      }
      $("body").mouseup(function (g) {
        var d = $(g.target).parent().attr("id");
        $(g.target).parent().parent().attr("id");
        if (!(d == "list" || d == "floaticon")) {
          sh = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          d = g.clientX - 40 < 0 ? g.clientX : g.clientX;
          var f = g.clientY - 40 < 0 ? g.clientY + sh + 10 : g.clientY + sh + 10, k = window.getSelection().toString();
          if (k.length > 5 && !$(g.target).is("input") && !$(g.target).is("textarea")) {
            TEXT = k;
            $("#searchlist").hide(0);
            $("#selectsearch").css({left: d + "px", top: f + "px"}).show();
            $("#searchlist ul li").unbind().click(function (h) {
              h = $(h.target).attr("data-url");
              c(h)
            })
          } else {
            $("#searchlist").hide(0);
            $("#selectsearch").hide(0)
          }
        }
      });
      $("#list").mouseover(function () {
        $("#searchlist").delay(500).show(0)
      });
      $("#floaticon").click(function () {
        $("#searchlist").hide(0);
        $("#selectsearch").hide(0);
        var g = $("#searchlist ul li:eq(0)").attr("data-url"),
          d = g.match(/\/\/(.*?)\//)[1];
        c(g, d)
      })
    })
  }, GetUrl: function (a) {
    return "http://go.redirectingat.com?id=18202X786788&xs=1&url=" + encodeURIComponent(a)
  }
};
chrome.extension.sendRequest({action: "getoption"}, function (a) {
  if (!(HOST == "docs.google.com" || HOST == "mail.google.com")) if (a.option.length > 0) {
    OPTION = a = JSON.parse(a.option);
    Search.removebar();
    document.getElementById("searchbar") == null && Search.addbar();
    a.searchselection == "true" && Search.searchforselect();
    if (a.bookmarks == "true" || a.history == "true") try {
      buildbookmartbar()
    } catch (c) {
    }
  }
});

function insertAfter(a, c) {
  var e = c.parentNode;
  e.lastChild == c ? e.appendChild(a) : e.insertBefore(a, c.nextSibling)
}

function buildbookmartbar() {
  var a = document.getElementsByName("q")[0];
  if (a && HOST != "www.bing.com") {
    var c = a.value;
    chrome.extension.getURL("");
    var e = c.toLowerCase(), j = document.createElement("div");
    j.id = "searchdiv";
    var g = document.getElementById("rhs"), d = function (f, k, h) {
      for (var l = f.length > 8 ? 8 : f.length, q = document.createDocumentFragment(), m = 0; m < l; m++) {
        var n;
        if (f[m].title == "") n = f[m].url; else {
          n = f[m].title;
          var o = c.replace(/[\.\$\^\{\[\(\|\)\*\+\?\\]/ig, "\\$1");
          o = RegExp("(" + o + ")", "ig");
          n = n.replace(o, '<span style="font-weight:bold">$1</span>')
        }
        n =
          n;
        o = f[m].url;
        f[m].url.replace(e, '<span style="text-decoration:none;font-weight:bold">' + e + "</span>");
        var p = document.createElement("div");
        p.className = "item";
        o.split("/");
        p.innerHTML = '<img class="icon" id="icon" src="' + k[m] + '"><a title="' + f[m].title + '" target="_blank" href="' + o + '">' + n + "</a>";
        q.appendChild(p)
      }
      $("#" + h).length > 0 && $("#" + h).append(q)
    };
    c.length >= 2 && chrome.extension.sendRequest({action: "getsearchbookmarks", keyword: c}, function (f) {
      if (f.bookmarkItems.length >= 1 || f.historyItems.length >= 1) {
        if (g) {
          var k =
            g.firstChild;
          if ($("#searchdiv").length > 0) return; else g.insertBefore(j, k)
        }
        k = document.getElementById("searchdiv");
        if (f.bookmarkItems.length >= 1 && f.ifBookmark == true) {
          var h = document.createElement("div");
          h.id = "searchdiv-bookmark-box";
          h.innerHTML = '<div id="searchdiv-bookmark-banner" class="searchdiv-banner">Results from bookmarks<div class="searchdiv-close"></div><ul id="bookmark-close-action" class="searchdiv-close-action"><li class="searchdiv-close-t">Dismiss for now</li><li class="searchdiv-close-f">Disable forever</li><li class="searchdiv-tip">Enabled by Search All</li></ul></div><div id="searchdiv-bookmark-container" class="searchdiv-container"><a class="viewAllLink">view all bookmark results</a></div>';
          k && k.appendChild(h);
          d(f.bookmarkItems, f.bIcons, "searchdiv-bookmark-container")
        }
        if (f.historyItems.length >= 1 && f.ifHistory == true) {
          h = document.createElement("div");
          h.id = "searchdiv-history-box";
          h.innerHTML = '<div id="searchdiv-history-banner" class="searchdiv-banner">Results from browsing history<div class="searchdiv-close"></div><ul id="history-close-action" class="searchdiv-close-action"><li class="searchdiv-close-t">Dismiss for now</li><li class="searchdiv-close-f">Disable forever</li><li class="searchdiv-tip">Enabled by Search All</li></ul></div><div id="searchdiv-history-container" class="searchdiv-container"><a class="viewAllLink">view all history results</a></div>';
          k && k.appendChild(h);
          d(f.historyItems, f.hIcons, "searchdiv-history-container")
        }
        k = f.bookmarkItems.length == 1 ? "result" : "results";
        h = f.historyItems.length == 1 ? "result" : "results";
        $("#searchdiv-bookmark-container").find(".viewAllLink").text("View all " + f.bookmarkItems.length + " " + k).on("click", function () {
          chrome.extension.sendRequest({action: "newTab", url: "chrome://bookmarks/#q=" + c})
        });
        $("#searchdiv-history-container").find(".viewAllLink").text("View all " + f.historyItems.length + " " + h).on("click", function () {
          chrome.extension.sendRequest({
            action: "newTab",
            url: "chrome://history/#q=" + c
          })
        });
        $("#searchdiv-history-banner").find("a");
        $(".searchdiv-close").on("click", function (l) {
          l.preventDefault();
          l.stopPropagation();
          $(this).parent().find(".searchdiv-close-action").show()
        });
        $(".searchdiv-close-action").on("click", "li", function (l) {
          l = l.target;
          if ($(l).hasClass("searchdiv-close-t")) if (l.parentNode.id == "bookmark-close-action") $("#searchdiv-bookmark-box").hide(); else l.parentNode.id == "history-close-action" && $("#searchdiv-history-box").hide(); else if ($(l).hasClass("searchdiv-close-f")) if (confirm("Want to disable this feature? You can enable it in the Search All extension options again.") ==
            true) if (l.parentNode.id == "bookmark-close-action") {
            $("#searchdiv-bookmark-box").hide();
            chrome.extension.sendRequest({action: "closeBookmarkSearch"})
          } else {
            if (l.parentNode.id == "history-close-action") {
              $("#searchdiv-history-box").hide();
              chrome.extension.sendRequest({action: "closeHistorySearch"})
            }
          } else return;
          $("#searchdiv-close-action").hide()
        });
        $("#option").click(function () {
          var l = chrome.extension.getURL("options.html");
          window.open(l)
        })
      }
    })
  }
}

function rmbookmartbar() {
  $("#searchdiv") && $("#searchdiv").remove()
}

function myReplace(a, c) {
  var e = a.replace(/[\.\$\^\{\[\(\|\)\*\+\?\\]/ig, "\\$1");
  e = RegExp("(" + e + ")", "ig");
  return c.replace(e, '<span style="font-weight:bold">$1</span>')
}

function addAD() {
  var a = $("#gbqfq").val();
  chrome.extension.sendRequest({action: "getAD", query: a, url: window.location.href}, function (c) {
    console.log(c);
    c = c.data;
    var e = c.length;
    if (!document.getElementById("sa-admanage-box")) {
      var j = document.createElement("div");
      j.id = "sa-admanage-box";
      j.innerHTML = "<h2><span>Ads</span></h2>";
      for (var g = document.createElement("ol"), d = 0; d < e; d++) {
        var f = myReplace(a, c[d].title["#cdata"]), k = myReplace(a, c[d].descr["#cdata"]), h = myReplace(a, c[d].host["#cdata"]);
        g.innerHTML += '<li class="Admanage-li"><h3><a target="_blank" href="' +
          c[d].url["#cdata"] + '">' + f + "</a></h3><div><cite>" + h + "</cite></div><span>" + k + "</span></li>"
      }
      j.appendChild(g);
      $("#rhs").prepend(j)
    }
  })
}

$(document).on("click", function () {
  $(".searchdiv-close-action").hide();
  $("#searchHistory-list").hide()
});
chrome.extension.onRequest.addListener(function (a) {
  switch (a.action) {
    case "tabupdate":
      rmbookmartbar();
      buildbookmartbar(event);
      Search.addbar();
      break;
    case "startdetect":
      detectOpensearch();
      break;
    case "insertChango":
      break
  }
});
detectOpensearch();
window.onload = function () {
  try {
    buildbookmartbar()
  } catch (a) {
  }
};
var b = document.getElementsByName("q")[0];
b && b.addEventListener("input", function (a) {
  rmbookmartbar();
  buildbookmartbar(a)
});

function detectOpensearch() {
  chrome.extension.sendRequest({action: "resetBadge"});
  if ($('link[type="application/opensearchdescription+xml"]')[0]) {
    var a = $('link[type="application/opensearchdescription+xml"]')[0].getAttribute("href");
    a = a.substring(0, 4) != "http" ? document.location.protocol + "//" + document.location.host + a : a;
    chrome.extension.sendRequest({action: "opensearch", path: a})
  } else chrome.extension.sendRequest({action: "refreshtabid"})
}

function insertChango() {
  var a = document.createElement("script");
  a.type = "text/javascript";
  a.innerHTML = 'var __chd__ = {"aid":10623,"chaid":"diigo"};';
  var c = document.getElementsByTagName("head")[0];
  c.appendChild(a);
  a = document.createElement("script");
  a.type = "text/javascript";
  a.async = true;
  a.src = ("https:" == document.location.protocol ? "https://z" : "http://p") + ".chango.com/static/c.js";
  c = document.getElementsByTagName("head")[0];
  c.appendChild(a)
}

function insertSkimlink() {
  var a = document.createElement("script");
  a.type = "text/javascript";
  a.src = "//s.skimresources.com/js/18202X824369.skimlinks.js";
  document.head.appendChild(a)
}

function getAffiate() {
  Array.prototype.slice.call(document.getElementsByTagName("a")).forEach(function (a, c, e) {
    if (/www.amazon.com/.test(a.href) && !/(&|\?)tag=([^&]*)(&|$)/.test(a.href)) e[c].href += /\?.*=/.test(a.href) ? "&tag=diigo0c-20" : "?tag=diigo0c-20"
  })
}
