if (typeof addEvent != "function") {
  var addEvent = function (a, b, c, d) {
    var e = "on" + b;
    if (a.addEventListener && !d) return a.addEventListener(b, c, false);
    if (!a._evts) a._evts = {};
    if (!a._evts[b]) {
      a._evts[b] = a[e] ? {b: a[e]} : {};
      a[e] = new Function("e", 'var r = true, o = this, a = o._evts["' + b + '"], i; for (i in a) {o._f = a[i]; r = o._f(e||window.event) != false && r; o._f = null;} return r');
      b != "unload" && addEvent(window, "unload", function () {
        removeEvent(a, b, c, d)
      })
    }
    if (!c._i) c._i = addEvent._i++;
    a._evts[b][c._i] = c
  };
  addEvent._i =
    1;
  var removeEvent = function (a, b, c, d) {
    if (a.removeEventListener && !d) return a.removeEventListener(b, c, false);
    a._evts && a._evts[b] && c._i && delete a._evts[b][c._i]
  }
}

function cancelEvent(a, b) {
  a.returnValue = false;
  a.preventDefault && a.preventDefault();
  if (b) {
    a.cancelBubble = true;
    a.stopPropagation && a.stopPropagation()
  }
}

function DragResize(a, b) {
  var c = {myName: a, enabled: true, handles: ["tl", "tm", "tr", "ml", "mr", "bl", "bm", "br"], isElement: null, isHandle: null, element: null, handle: null, minWidth: 10, minHeight: 10, minLeft: 0, maxLeft: 9999, minTop: 0, maxTop: 9999, zIndex: 1, mouseX: 0, mouseY: 0, lastMouseX: 0, lastMouseY: 0, mOffX: 0, mOffY: 0, elmX: 0, elmY: 0, elmW: 0, elmH: 0, allowBlur: true, ondragfocus: null, ondragstart: null, ondragmove: null, ondragend: null, ondragblur: null};
  for (var d in c) this[d] = typeof b[d] == "undefined" ? c[d] : b[d]
}

var obj, targetnode;
DragResize.prototype.apply = function (a) {
  obj = this;
  targetnode = a;
  addEvent(targetnode, "mousedown", function (b) {
    obj.mouseDown(b)
  });
  addEvent(targetnode, "mousemove", function (b) {
    obj.mouseMove(b)
  })
};
DragResize.prototype.select = function (a) {
  with (this) {
    if (!document.getElementById || !enabled) return;
    if (a && a != element && enabled) {
      element = a;
      element.style.zIndex = ++zIndex;
      this.resizeHandleSet && this.resizeHandleSet(element, true);
      elmX = parseInt(element.style.left);
      elmY = parseInt(element.style.top);
      elmW = element.offsetWidth;
      elmH = element.offsetHeight;
      ondragfocus && this.ondragfocus()
    }
  }
};
DragResize.prototype.deselect = function (a) {
  with (this) {
    if (!document.getElementById || !enabled) return;
    if (a) {
      ondragblur && this.ondragblur();
      this.resizeHandleSet && this.resizeHandleSet(element, false);
      element = null
    }
    handle = null;
    mOffY = mOffX = 0
  }
};
DragResize.prototype.mouseDown = function (a) {
  with (this) {
    if (!document.getElementById || !enabled) return true;
    for (var b = a.target || a.srcElement, c = null, d = null, e = RegExp(myName + "-([trmbl]{2})", ""); b;) {
      if (b.className) {
        if (!d && (e.test(b.className) || isHandle(b))) d = b;
        if (isElement(b)) {
          c = b;
          break
        }
      }
      b = b.parentNode
    }
    element && element != c && allowBlur && deselect(true);
    if (c && (!element || c == element)) {
      d && cancelEvent(a);
      select(c, d);
      (handle = d) && ondragstart && this.ondragstart(e.test(handle.className))
    }
    mouseX = a.pageX || a.clientX + document.documentElement.scrollLeft;
    mouseY = a.pageY || a.clientY + document.documentElement.scrollTop;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    addEvent(targetnode, "mouseup", function (f) {
      obj.mouseUp(f)
    })
  }
};
DragResize.prototype.mouseMove = function (a) {
  with (this) {
    if (!document.getElementById || !enabled) return true;
    mouseX = a.pageX || a.clientX + document.documentElement.scrollLeft;
    mouseY = a.pageY || a.clientY + document.documentElement.scrollTop;
    var b = mouseX - lastMouseX + mOffX, c = mouseY - lastMouseY + mOffY;
    mOffX = mOffY = 0;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    if (!handle) return true;
    var d = false;
    if (this.resizeHandleDrag && this.resizeHandleDrag(b, c)) d = true; else {
      var e = b, f = c;
      if (elmX + e < minLeft) mOffX = e - (b = minLeft - elmX); else if (elmX +
        elmW + e > maxLeft) mOffX = e - (b = maxLeft - elmX - elmW);
      if (elmY + f < minTop) mOffY = f - (c = minTop - elmY); else if (elmY + elmH + f > maxTop) mOffY = f - (c = maxTop - elmY - elmH);
      elmX += b;
      elmY += c
    }
    with (element.style) {
      left = elmX + "px";
      width = elmW + "px";
      top = elmY + "px";
      height = elmH + "px"
    }
    if (window.opera && document.documentElement) {
      b = document.getElementById("op-drag-fix");
      if (!b) {
        b = document.createElement("input");
        b.id = "op-drag-fix";
        b.style.display = "none";
        document.body.appendChild(b)
      }
      b.focus()
    }
    ondragmove && this.ondragmove(d, a);
    cancelEvent(a)
  }
};
DragResize.prototype.mouseUp = function () {
  with (this) {
    if (!document.getElementById || !enabled) return;
    removeEvent(targetnode, "mousemove", function (b) {
      obj.mouseMove(b)
    });
    removeEvent(targetnode, "mouseup", function (b) {
      obj.mouseUp(b)
    });
    var a = RegExp(myName + "-([trmbl]{2})", "");
    handle && ondragend && this.ondragend(a.test(handle.className));
    deselect(false)
  }
};
DragResize.prototype.resizeHandleSet = function (a, b) {
  with (this) {
    if (!a._handle_tr) for (var c = 0; c < handles.length; c++) {
      var d = document.createElement("div");
      d.className = myName + " " + myName + "-" + handles[c];
      a["_handle_" + handles[c]] = a.appendChild(d)
    }
    for (c = 0; c < handles.length; c++) a["_handle_" + handles[c]].style.visibility = b ? "inherit" : "hidden"
  }
};
DragResize.prototype.resizeHandleDrag = function (a, b) {
  with (this) {
    var c = handle && handle.className && handle.className.match(RegExp(myName + "-([tmblr]{2})")) ? RegExp.$1 : "", d = b, e = a, f = false;
    if (c.indexOf("t") >= 0) {
      rs = 1;
      if (elmH - d < minHeight) mOffY = d - (b = elmH - minHeight); else if (elmY + d < minTop) mOffY = d - (b = minTop - elmY);
      elmY += b;
      elmH -= b;
      f = true
    }
    if (c.indexOf("b") >= 0) {
      rs = 1;
      if (elmH + d < minHeight) mOffY = d - (b = minHeight - elmH); else if (elmY + elmH + d > maxTop) mOffY = d - (b = maxTop - elmY - elmH);
      elmH += b;
      f = true
    }
    if (c.indexOf("l") >= 0) {
      rs = 1;
      if (elmW -
        e < minWidth) mOffX = e - (a = elmW - minWidth); else if (elmX + e < minLeft) mOffX = e - (a = minLeft - elmX);
      elmX += a;
      elmW -= a;
      f = true
    }
    if (c.indexOf("r") >= 0) {
      rs = 1;
      if (elmW + e < minWidth) mOffX = e - (a = minWidth - elmW); else if (elmX + elmW + e > maxLeft) mOffX = e - (a = maxLeft - elmX - elmW);
      elmW += a;
      f = true
    }
    return f
  }
};
