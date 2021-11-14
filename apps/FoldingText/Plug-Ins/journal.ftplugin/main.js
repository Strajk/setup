/* eslint-env amd */
define(function (require, exports, module) {
  "use strict"

  var Extensions = require("ft/core/extensions").Extensions
  var Dom = require("ft/util/dom")
  var Panel = require("../jmk_panel.ftplugin/jmk_panel.js").Panel

  // Internal state.
  var editor, panel

  function jumpToDate (dt) { // date as Date object
    var d = dt.getDate(); var m = dt.getMonth() + 1; var y = dt.getFullYear()
    var monthName = dt.toLocaleString("default", { month: "long" })

    var mNode = editor.tree().evaluateNodePath("//" + monthName)[0]
    if (!mNode) { console.error("Month not found"); return false }; // month cannot be found

    var dNode = mNode.children().filter((x) => parseDayHeader(x.text()) == d)[0]
    if (!dNode) { console.error("Day not found"); return false }

    editor.setSelectedRange(editor.tree().createRangeFromNodes(dNode, 0))

    return true
  }

  function parseDate (dStr) { // parse user entered string date
    return new Date(dStr)
  }

  function parseDayHeader (line) { // "Wed 1 (HO)" -> 1
    var x
    if (x = line.match(/\w+ (\d+)(?: .+)?/)) return x[1]
  }

  function formatDate (node) {
    var d, m, x
    if (node.parent.type() == "body") {
      d = node.parent.text()
      d = parseDayHeader(d) || d
    }
    if (node.parent.parent.type() == "heading") {
      m = node.parent.parent.text().substr(0, 3)
    }

    if (d && m) return m + " " + d
  }

  Extensions.addMode({ name: "diary" })

  Extensions.addRenderNode(function (editor, node, nodeRenderer) {
    if (node.modeContext() == "diary" && node.type() == "body" && parseDayHeader(node.text())) {
      var widget = document.createElement("span")
      widget.className = "jz-diary-widget-day"
      widget.textContent = node.parent.text().substr(0, 3)
      nodeRenderer.renderLineWidget(widget, {
        overlay: true,
        positionWidget: function (widgetWidth, widgetHeight) {
          var line = node.lineNumber()
          var leadingSpace = node.line().match(/\s*/)[0]
          var coords = editor.cursorCoords({ line: line, ch: leadingSpace.length }, "div")
          return {
            left: Math.round(coords.left - (widgetWidth + editor.defaultSpaceWidth())) + "px",
          }
        },
      })
    }
    if (node.modeContext() == "diary" && node.type() == "unordered" && node.typeIndentLevel() == 1) {
      var widget = document.createElement("span")
      widget.className = "jz-diary-widget-date"
      widget.textContent = formatDate(node)
      nodeRenderer.renderLineWidget(widget, {
        overlay: true,
        positionWidget: function (widgetWidth, widgetHeight) {
          var line = node.lineNumber()
          var leadingSpace = node.line().match(/\s*/)[0]
          var coords = editor.cursorCoords({ line: line, ch: leadingSpace.length }, "div")
          return {
            left: Math.round(coords.left - (widgetWidth + editor.defaultSpaceWidth())) + "px",
          }
        },
      })
    }
  })

  Extensions.addCommand({
    name: "show go-to-date panel",
    description: "Jump to date",
    performCommand: function () {
      panel.show()
    },
  })

  Extensions.addCommand({
    name: "toggle diary dates",
    description: "Toggle diary dates",
    performCommand: function (editor) {
      Dom.toggleClass(document.body, "jz-diary-show-dates")
      editor.refresh()
    },
  })

  Extensions.addInit(function (ed) {
    window.ed = editor = ed // copy editor to wider scope

    panel = new Panel({
      placeholder: "date",
      onReturn: function () {
        return jumpToDate(parseDate(panel.input.value))
      },
      onEscape: function () {
        panel.hide()
      },
      ignoreWhiteSpace: false,
    })

    editor.addKeyMap({
      "Cmd-G": "show go-to-date panel",
      "Cmd-D": "toggle diary dates",
    })
  })
})
