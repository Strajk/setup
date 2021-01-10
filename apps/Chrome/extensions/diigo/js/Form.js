var KEY_UP = 38, KEY_DOWN = 40, KEY_ESC = 27, KEY_ENTER = 13, Bg = chrome.extension.getBackgroundPage(), permissions = Bg.GlobalData ? Bg.GlobalData.permissions || {} : {};
$(document).ready(function () {
  function n(e) {
    function g() {
      a.find(".content").text() == "" ? a.removeClass("inputed focused") : a.removeClass("focused");
      i.val("").trigger("input");
      c.scrollTop(0);
      j.show();
      k.hide()
    }

    function l() {
      a.find(".menu-item:visible").removeClass("selected").eq(d).addClass("selected");
      var b = a.find(".menu-item:visible").eq(d), h = b.offset().top + c.scrollTop() - c.offset().top;
      b = b.outerHeight();
      if (h + b > c.outerHeight() + c.scrollTop()) c.scrollTop(h + b - c.outerHeight()); else h < c.scrollTop() && c.scrollTop(h)
    }

    function m() {
      d = -1;
      a.find(".menu-item").removeClass("selected")
    }

    var a = $(e), f = a.find(".content"), i = a.find(".search-box input"), j = a.find(".search-box"), c = a.find(".item-container"), k = a.find(".add-box"), o = a.find(".remove-select"), d = -1;
    a.on("click", ".menu-item", function () {
      f.text($(this).text()).attr("data-id", $(this).attr("data-id"));
      g();
      a.trigger("change")
    }).on("mouseenter", ".menu-item", function () {
      $(this).addClass("selected").siblings().removeClass("selected")
    });
    o.on("click", function (b) {
      b.stopPropagation();
      a.removeClass("inputed focused");
      f.text("").attr("data-id", "");
      a.trigger("change")
    });
    c.on("mouseleave", function () {
      m()
    });
    f.on("click", function () {
      a.addClass("inputed focused");
      i.focus()
    });
    a.on("keydown", function (b) {
      if (b.keyCode == 13 || b.keyCode == 32) f.trigger("click")
    });
    a.find(".add-btn").on("click", function () {
      j.hide();
      k.show().find("input").focus()
    });
    a.find(".cancel").on("click", function () {
      j.show();
      k.hide()
    });
    i.on("input", function () {
      var b = $(this).val().toLowerCase();
      a.find(".menu-item").each(function () {
        $(this).text().toLowerCase().indexOf(b) ==
        -1 ? $(this).hide() : $(this).show();
        m()
      })
    }).on("keydown", function (b) {
      switch (b.keyCode) {
        case KEY_UP:
          if (d == -1) d = a.find(".menu-item:visible").length;
          d--;
          l();
          break;
        case KEY_DOWN:
          if (d == a.find(".menu-item:visible").length - 1) d = -1;
          d++;
          l();
          break;
        case KEY_ENTER:
          b.stopPropagation();
          b = a.find(".menu-item.selected");
          f.text(b.text()).attr("data-id", b.attr("data-id"));
          g();
          a.focus();
          break;
        case KEY_ESC:
          g();
          break
      }
    });
    $(document).on("click", function (b) {
      $.contains(e, b.target) || g()
    })
  }

  $(".form-input").find("input").on("focus",
    function () {
      $(this).parent().addClass("inputed focused")
    }).on("blur", function () {
    $(this).val() === "" && $(this).parent().removeClass("inputed");
    $(this).parent().removeClass("focused")
  }).on("change", function () {
    $(this).val() !== "" && $(this).parent().addClass("inputed")
  });
  if (permissions.snapshot) $("#diigo-acache-field").hide(); else {
    $("#diigo-acache-field").show();
    $("#op-cache").prop("disabled", true);
    $("#op-cache").parent().addClass("disabled");
    $("#f-cache").prop("disabled", true);
    $("#f-cache").parent().addClass("disabled")
  }
  $(".form-checkbox").on("mouseup",
    function () {
      console.log("mouseup");
      var e = this;
      setTimeout(function () {
        $(e).find("input").blur()
      }, 0)
    }).find("input").on("keydown", function (e) {
    e.keyCode == 13 && $(this).trigger("click")
  });
  $(".form-textarea").find("textarea").on("focus", function () {
    $(this).parent().addClass("inputed focused")
  }).on("blur", function () {
    $(this).val() === "" && $(this).parent().removeClass("inputed");
    $(this).parent().removeClass("focused")
  }).on("change", function () {
    $(this).text() !== "" && $(this).parent().addClass("inputed")
  });
  $(".form-select").each(function () {
    n(this)
  })
});
