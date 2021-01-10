(function (a) {
  a.event.special.textchange = {
    setup: function () {
      a(this).data("lastValue", a(this).is("input") ? a(this).val() : a(this).html());
      a(this).bind("keyup.textchange", a.event.special.textchange.handler);
      a(this).bind("cut.textchange paste.textchange input.textchange", a.event.special.textchange.delayedHandler)
    }, teardown: function () {
      a(this).unbind(".textchange")
    }, handler: function (b) {
      b.keyCode && b.keyCode == 13 && a(".note.new").addClass("typed");
      a.event.special.textchange.triggerIfChanged(a(this))
    }, delayedHandler: function () {
      var b =
        a(this);
      setTimeout(function () {
        a.event.special.textchange.triggerIfChanged(b)
      }, 25)
    }, triggerIfChanged: function (b) {
      var c = b.is("input") ? b.val() : b.html();
      if (c !== b.data("lastValue")) {
        b.trigger("textchange", b.data("lastValue"));
        b.data("lastValue", c)
      }
    }
  }
})(jQuery);
