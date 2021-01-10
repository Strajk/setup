var Bg = chrome.extension.getBackgroundPage(), Prefs = Bg.Prefs;

function getSelectedTab(b) {
  chrome.tabs.query({active: true, currentWindow: true}, function (d) {
    b(d[0])
  })
}

var inList = inOutliner = inGroup = function () {
  return false
};

function buildSelect() {
  for (var b = $("<select></select>"), d = 48; d < 91; d++) if (!(d > 57 && d < 65)) {
    var e = String.fromCharCode(d);
    $("<option></option>").attr({value: e}).text(e).appendTo(b)
  }
  b.on("change", function () {
    var g = $(this).parents(".shortcut").attr("data-type"), f = {};
    f["prefs.shortcut" + g + "Key"] = $(this).val();
    Prefs.set(f)
  });
  b.appendTo($(".shortcut"));
  $(".shortcut[data-type=Bookmark]").find("select").val(Prefs.get("prefs.shortcutBookmarkKey") || "Q");
  $(".shortcut[data-type=Annotate]").find("select").val(Prefs.get("prefs.shortcutAnnotateKey") ||
    "D");
  $(".shortcut[data-type=Readlater]").find("select").val(Prefs.get("prefs.shortcutReadlaterKey") || "R");
  $(".shortcut[data-type=OpenOutlinerSidebar]").find("select").val(Prefs.get("prefs.shortcutOpenOutlinerSidebarKey") || "O");
  $(".shortcut[data-type=AnnotateArticle]").find("select").val(Prefs.get("prefs.shortcutAnnotateArticleKey") || "T");
  $(".shortcut[data-type=AnnotatePDF]").find("select").val(Prefs.get("prefs.shortcutAnnotatePDFKey") || "P");
  $(".shortcut[data-type=AnnotateScreenshot]").find("select").val(Prefs.get("prefs.shortcutAnnotateScreenshotKey") ||
    "S")
}

function shortcutSwitchState(b) {
  $("#check-shortcut-" + b).is(":checked") ? $("#check-shortcut-" + b + "-ctrl,#check-shortcut-" + b + "-alt,#shortcut-" + b + " select").removeAttr("disabled") : $("#check-shortcut-" + b + "-ctrl,#check-shortcut-" + b + "-alt,#shortcut-" + b + " select").attr("disabled", "true")
}

function initFocusResearch() {
  updateLists({list: Bg.GlobalData.myBmLists, outliners: Bg.GlobalData.outliners}, false);
  updateGroups(Bg.GlobalData.myGroups, false);
  $("#close-upgrade-info").on("click", function () {
    $("#upgrade-info").hide()
  });
  $("#btn-upgrade-info").on("click", function () {
    chrome.tabs.create({url: "https://www.diigo.com/premium?f=outliner"})
  });
  $("#diigobm-list-addBtn").on("click", function () {
    console.log("click");
    if (!$(this).parent().hasClass("processing")) if (Bg.GlobalData.permissions.createOutliner) {
      var b =
        $("#diigobm-list-addInput").val(), d = $("#diigobm-list-add .diigo-alert-tip"), e = [], g = Bg.GlobalData.myBmLists.length, f;
      for (f = 0; f < g; f++) e.push(Bg.GlobalData.myBmLists[f].title);
      if (b.match(/^\s*$/)) {
        d.show().find("span").text("Input a name");
        $("#diigobm-list-addInput").focus()
      } else if ($.inArray(b, e) !== -1) d.show().find("span").text("Name existed !"); else {
        $(this).parent().addClass("processing");
        Bg.WebAPI.createList(b, function (c) {
          updateLists({list: c.lists, outliners: c.outliners});
          c = c.newOutliner;
          var a = $("#diigobm-list");
          a.find(".content").text(c.title).attr("data-id", c.id);
          a.removeClass("focused");
          a.find(".add-box").hide().find("input").val("");
          a.find(".search-box").show();
          a.trigger("change")
        })
      }
    } else $("#upgrade-info").show()
  });
  $("#diigobm-list-addCancel").on("click", function () {
    $("#diigobm-list-add .diigo-alert-tip").hide();
    $("#diigobm-list-add").hide();
    $("#diigobm-list").show();
    $("#diigobm-list-addInput").val("")
  });
  $("#w-upgrade").on("click", function (b) {
    b.preventDefault();
    googleEvent("Chrome extension", "Click upgrade from outliner creation",
      "outliner");
    chrome.tabs.create({url: "https://www.diigo.com/premium?f=outliner"});
    $("#diigobm-list-add-tip").hide();
    $("#diigobm-list").show()
  });
  $("#w-cancel").on("click", function (b) {
    b.preventDefault();
    $("#diigobm-list-add-tip").hide();
    $("#diigobm-list").show()
  });
  chrome.storage.local.get(["researchMode", "researchModeData"], function (b) {
    if (b.researchMode == true) {
      $("#check-focusResearch").prop("checked", true);
      $("#focus-research-options").show()
    }
    if (b.researchModeData) {
      b = b.researchModeData;
      var d = ParseTags.unparseTags(b.tags ||
        []);
      $("#r-tag-input").val(d);
      if (b._private || Prefs.get("prefs.bookmark.privateByDefault") == "true") $("#f-private").prop("checked", true);
      b.unread && $("#f-read-later").prop("checked", true);
      b.cache && $("#f-cache").prop("checked", true);
      if (b.outliner) {
        var e = $("#diigobm-list");
        d = e.find(".menu-item[data-id=" + b.outliner + "]").text();
        e.find(".content").text(d).attr("data-id", b.outliner).end().addClass("inputed")
      }
      if (b.group) {
        e = $("#diigobm-group");
        d = e.find(".menu-item[data-id=" + b.group + "]").text();
        e.find(".content").text(d).attr("data-id",
          b.group).end().addClass("inputed")
      }
    }
  })
}

function perfs2UI() {
  $("#check-bmPrivateAsDefault").attr({checked: Prefs.get("prefs.bookmark.privateByDefault") == "true"});
  $("#check-bmUnreadAsDefault").attr({checked: Prefs.get("prefs.bookmark.unreadByDefault") == "true"});
  $("#check-autoloadBookmarkStatus").attr({checked: Prefs.get("prefs.autoloadBookmarkStatus") == "true"});
  $("#check-autoload").attr({checked: Prefs.get("prefs.autoload") == "true"});
  $("#check-contextMenu").attr({checked: Prefs.get("prefs.contextMenu") == "true"});
  $("#check-comboSearch").attr({
    checked: Prefs.get("prefs.comboSearch") ==
      "true"
  });
  $("#check-searcho").attr({checked: Prefs.get("prefs.SearchO") == "true"});
  $("#check-autoshowicon").attr({checked: Prefs.get("prefs.autoShowHighlightIcon") == "true"});
  $("#check-autoImageClipper").attr({checked: Prefs.get("prefs.autoImageClipper") == "true"});
  $("#check-autoCloseReadLater").attr({checked: Prefs.get("prefs.autoCloseReadLater") == "true"});
  $("#check-shortcut-annotate").attr({checked: Prefs.get("prefs.shortcutAnnotate") == "true"});
  $("#check-shortcut-bookmark").attr({
    checked: Prefs.get("prefs.shortcutBookmark") ==
      "true"
  });
  $("#check-shortcut-readlater").attr({checked: Prefs.get("prefs.shortcutReadlater") == "true"});
  $("#check-showSearchResultDirectly").attr({checked: Prefs.get("prefs.directlyShowSearchResults") == "true"});
  $("#check-shortcut-annotate-ctrl").attr({checked: Prefs.get("prefs.shortcutAnnotateCtrl") == "true"});
  $("#check-shortcut-annotate-alt").attr({checked: Prefs.get("prefs.shortcutAnnotateAlt") == "true"});
  $("#shortcut-annotate select").val(Prefs.get("prefs.shortcutAnnotateKey"));
  $("#check-shortcut-bookmark-ctrl").attr({
    checked: Prefs.get("prefs.shortcutBookmarkCtrl") ==
      "true"
  });
  $("#check-shortcut-bookmark-alt").attr({checked: Prefs.get("prefs.shortcutBookmarkAlt") == "true"});
  $("#shortcut-bookmark select").val(Prefs.get("prefs.shortcutBookmarkKey"));
  $("#check-shortcut-a-article-ctrl").attr({checked: Prefs.get("prefs.shortcutAnnotateArticleCtrl") == "true"});
  $("#check-shortcut-a-article-alt").attr({checked: Prefs.get("prefs.shortcutAnnotateArticleAlt") == "true"});
  $("#check-shortcut-a-article").attr({checked: Prefs.get("prefs.shortcutAnnotateArticle") == "true"});
  $("#check-shortcut-a-pdf-ctrl").attr({
    checked: Prefs.get("prefs.shortcutAnnotatePDFCtrl") ==
      "true"
  });
  $("#check-shortcut-a-pdf-alt").attr({checked: Prefs.get("prefs.shortcutAnnotatePDFAlt") == "true"});
  $("#check-shortcut-a-pdf").attr({checked: Prefs.get("prefs.shortcutAnnotatePDF") == "true"});
  $("#check-shortcut-a-screenshot-ctrl").attr({checked: Prefs.get("prefs.shortcutAnnotateScreenshotCtrl") == "true"});
  $("#check-shortcut-a-screenshot-alt").attr({checked: Prefs.get("prefs.shortcutAnnotateScreenshotAlt") == "true"});
  $("#check-shortcut-a-screenshot").attr({
    checked: Prefs.get("prefs.shortcutAnnotateScreenshot") ==
      "true"
  });
  $("#check-shortcut-readlater-ctrl").attr({checked: Prefs.get("prefs.shortcutReadlaterCtrl") == "true"});
  $("#check-shortcut-readlater-alt").attr({checked: Prefs.get("prefs.shortcutReadlaterAlt") == "true"});
  $("#check-shortcut-openOutlinerSidebar").attr({checked: Prefs.get("prefs.shortcutOpenOutlinerSidebar") == "true"});
  $("#check-shortcut-openOutlinerSidebar-ctrl").attr({checked: Prefs.get("prefs.shortcutOpenOutlinerSidebarCtrl") == "true"});
  $("#check-shortcut-openOutlinerSidebar-alt").attr({
    checked: Prefs.get("prefs.shortcutOpenOutlinerSidebarAlt") ==
      "true"
  });
  $("#shortcut-readlater select").val(Prefs.get("prefs.shortcutReadlaterKey"));
  $("#check-shortcut-openOutlinerSidebar select").val(Prefs.get("prefs.shortcutOpenOutlinerSidebarKey"));
  $("#check-showPdfButton").attr({checked: Prefs.get("prefs.showPdfButton") == "true"});
  $("#check-showVideoButton").attr({checked: Prefs.get("prefs.showVideoCapture") == "true"});
  shortcutSwitchState("bookmark");
  shortcutSwitchState("annotate");
  shortcutSwitchState("readlater");
  shortcutSwitchState("openOutlinerSidebar");
  initFocusResearch()
}

function updateLists(b, d) {
  console.trace();
  $("#refresh-outliner").removeClass("processing");
  var e = b.list, g = b.outliners, f = $("#diigobm-list").find(".item-container");
  f.empty();
  if (g.length) {
    $('<div class="menu-title">Outliners</div>').appendTo(f);
    forEach(g, function (a) {
      var h = inOutliner(a.id) ? a.title + " (added)" : a.title;
      $('<div class="menu-item" data-id="' + a.id + '">' + h + "</div>").appendTo(f)
    })
  }
  if (e.length) {
    $('<div class="menu-title">Lists</div>').appendTo(f);
    forEach(e, function (a) {
      var h = inList(a.id) ? a.title +
        " (added)" : a.title;
      $('<div class="menu-item" data-id="' + a.id + '">' + h + "</div>").appendTo(f)
    })
  }
  var c = $("#diigobm-list").find("select").empty().unbind().removeClass("processing");
  c.append(Utils.dom.buildOne("option", {value: 0}, ["Add to an Outliner"]));
  c.append(Utils.dom.buildOne("option", {value: -1}, [Array(20).join("-")]));
  $(Utils.dom.buildOne("option", {value: -2}, ["Create an Outliner..."])).appendTo(c);
  c.append(Utils.dom.buildOne("option", {value: -1}, [Array(20).join("-")]));
  forEach(g, function (a) {
    d ? c.append(Utils.dom.buildOne("option",
      {value: a.id}, [a.title])) : c.append(Utils.dom.buildOne("option", {value: a.id}, [a.title + (inList(a.id) ? " (added)" : "")]))
  });
  c.append(Utils.dom.buildOne("option", {value: -1}, [Array(20).join("-")]));
  if (e.length) {
    c.append(Utils.dom.buildOne("option", {value: -8}, ["Add to a List"]));
    c.append(Utils.dom.buildOne("option", {value: -1}, [Array(20).join("-")]));
    forEach(e, function (a) {
      d ? c.append(Utils.dom.buildOne("option", {value: a.id}, [a.title])) : c.append(Utils.dom.buildOne("option", {value: a.id}, [a.title + (inList(a.id) ?
        " (added)" : "")]))
    })
  }
  c.append(Utils.dom.buildOne("option", {value: -1}, [Array(20).join("-")]));
  $(Utils.dom.buildOne("option", {value: -3}, ["Refresh"])).appendTo(c);
  c.change(function () {
    var a = c.val();
    if (a == -2) {
      if (Bg.GlobalData.permissions.createOutliner === true) {
        $("#diigobm-list-add").show();
        $("#diigobm-list").hide();
        $("#diigobm-list-addInput").focus()
      } else {
        $("#diigobm-list-add-tip").show();
        $("#diigobm-list").hide()
      }
      c.val(0);
      c.remvoeClass("selected")
    } else if (a == -3) {
      $(this).addClass("processing");
      chrome.tabs.getSelected(null,
        function (h) {
          chrome.tabs.sendMessage(h.id, {name: "refreshMyStuff"})
        });
      c.val(-1)
    }
  });
  c.val(0).change()
}

function updateGroups(b, d) {
  $("#refresh-group").removeClass("processing");
  var e = b.filter(function (a) {
    return a.access_mode < 5
  }), g = b.filter(function (a) {
    console.log(a.access_mode);
    return a.access_mode >= 5
  }), f = $("#diigobm-group").find(".item-container");
  f.empty();
  if (g.length) {
    $('<div class="menu-title">Teams</div>').appendTo(f);
    forEach(g, function (a) {
      var h = inGroup(a.name) ? a.displayName + " (shared)" : a.displayName;
      $('<div class="menu-item" data-id="' + a.name + '">' + h + "</div>").on("click", function () {
        console.log("Click");
        var i = a.name;
        if (popCtx.groupTagsDict[i] != undefined) showTags("group", popCtx.groupTagsDict[i]); else {
          $("#diigobm-group-tag").show();
          getSelectedTab(function (j) {
            chrome.tabs.sendMessage(j.id, {name: "loadGroupTagsDictionary", groupName: i})
          })
        }
      }).appendTo(f)
    })
  }
  if (e.length) {
    $('<div class="menu-title">Groups</div>').appendTo(f);
    forEach(e, function (a) {
      var h = inGroup(a.name) ? a.displayName + " (shared)" : a.displayName;
      $('<div class="menu-item" data-id="' + a.name + '">' + h + "</div>").on("click", function () {
        console.log("Click");
        var i = a.name;
        if (popCtx.groupTagsDict[i] != undefined) showTags("group", popCtx.groupTagsDict[i]); else {
          $("#diigobm-group-tag").show();
          getSelectedTab(function (j) {
            chrome.tabs.sendMessage(j.id, {name: "loadGroupTagsDictionary", groupName: i})
          })
        }
      }).appendTo(f)
    })
  }
  var c = $("#diigobm-group").find("select").empty().unbind().removeClass("processing");
  if (g.length > 0) {
    c.append(Utils.dom.buildOne("option", {value: 0}, ["Share to a Team"]));
    c.append(Utils.dom.buildOne("option", {value: -5}, [Array(20).join("-")]));
    forEach(g, function (a) {
      d ?
        c.append(Utils.dom.buildOne("option", {value: a.name}, [a.displayName])) : c.append(Utils.dom.buildOne("option", {value: a.name}, [a.displayName + (inGroup(a.name) ? " (shared)" : "")]))
    });
    c.append(Utils.dom.buildOne("option", {value: -5}, [Array(20).join("-")]))
  }
  c.append(Utils.dom.buildOne("option", {value: 0}, ["Share to a Group"]));
  c.append(Utils.dom.buildOne("option", {value: -1}, [Array(20).join("-")]));
  $(Utils.dom.buildOne("option", {value: -2}, ["Create a Group..."])).appendTo(c);
  c.append(Utils.dom.buildOne("option",
    {value: -5}, [Array(20).join("-")]));
  forEach(e, function (a) {
    d ? c.append(Utils.dom.buildOne("option", {value: a.name}, [a.displayName])) : c.append(Utils.dom.buildOne("option", {value: a.name}, [a.displayName + (inGroup(a.name) ? " (shared)" : "")]))
  });
  c.append(Utils.dom.buildOne("option", {value: -5}, [Array(20).join("-")]));
  $(Utils.dom.buildOne("option", {value: -3}, ["Refresh"])).appendTo(c);
  c.change(function () {
    var a = c.val();
    if (a == -2) {
      chrome.tabs.create({url: "https://groups.diigo.com/create"});
      c.val(-1)
    } else if (a == -3) {
      $(this).addClass("processing");
      chrome.tabs.getSelected(null, function (h) {
        chrome.tabs.sendMessage(h.id, {name: "refreshMyStuff"})
      });
      c.val(-1)
    }
    if (a != 0 && a != -1 && a != -2 && a != -3) {
      $("#diigosc-group-tag").show();
      popCtx.isAnnotated && $("#bottom").find("div:first-child").show();
      $("#Diigo-Bookmark-checkShareExisting").show();
      console.log(popCtx);
      if (popCtx.groupTagsDict[a] != undefined) showTags("group", popCtx.groupTagsDict[a]); else {
        $("#diigobm-group-tag").show();
        chrome.tabs.getSelected(null, function (h) {
          chrome.tabs.sendMessage(h.id, {
            name: "loadGroupTagsDictionary",
            groupName: a
          })
        })
      }
    }
  });
  c.val(0).change()
}

var saveTimer = null;

function saveFocusResearchData() {
  saveTimer !== null && clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    var b = $("#r-tag-input").val();
    b = ParseTags.parseTags(b);
    var d = $("#f-private").prop("checked"), e = $("#f-read-later").prop("checked"), g = $("#f-cache").prop("checked"), f = $("#diigobm-list").find(".content").attr("data-id"), c = $("#diigobm-group").find(".content").attr("data-id");
    chrome.storage.local.set({researchModeData: {tags: b, _private: d, unread: e, cache: g, outliner: f, group: c}})
  }, 150)
}

$("label input[data-pref]").on("change", function () {
  var b = $(this).attr("data-pref"), d = $(this).prop("checked");
  if (b == "prefs.directlyShowSearchResults") if (d == true) {
    if (!Bg.GlobalData.permissions.autoShowAnnotation) {
      $("#check-showSearchResultDirectly").prop("checked", false);
      showTip("comboSearch");
      return
    }
    $("#check-comboSearch").prop("checked", true);
    Prefs.set({"prefs.comboSearch": true})
  }
  var e = {};
  e[b] = d;
  Prefs.set(e);
  if (b == "prefs.autoloadBookmarkStatus" && d == false) {
    $("#check-autoload").prop("checked", false);
    Prefs.set({"prefs.autoload": false})
  }
  if (b == "prefs.autoload" && d == true) {
    $("#check-autoloadBookmarkStatus").prop("checked", true);
    Prefs.set({"prefs.autoloadBookmarkStatus": true})
  }
  if (b == "prefs.comboSearch" && d == false) {
    $("#check-showSearchResultDirectly").prop("checked", false);
    Prefs.set({"prefs.directlyShowSearchResults": false})
  }
  b == "prefs.shortcutAnnotate" && shortcutSwitchState("annotate");
  b == "prefs.shortcutBookmark" && shortcutSwitchState("bookmark");
  b == "prefs.shortcutReadlater" && shortcutSwitchState("readlater")
});
$("#check-focusResearch").on("change", function () {
  var b = $(this).prop("checked");
  chrome.storage.local.set({researchMode: b});
  b ? $("#focus-research-options").show() : $("#focus-research-options").hide()
});
$(".form-select").on("change", function () {
  saveFocusResearchData()
});
$("#focus-research-options").find("input").on("input", saveFocusResearchData).end().find("input[type=checkbox]").on("change", saveFocusResearchData);

function showTip(b) {
  $(".modelWin-wrapper").show();
  $("#" + b + "-tip").show()
}

buildSelect();
perfs2UI();
$(".modelWin-close").on("click", function () {
  $(this).parents(".modelWin-wrapper").hide()
});
