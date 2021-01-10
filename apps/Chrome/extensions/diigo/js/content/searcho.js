(function () {
  if (!window.searcho) window.searcho = {
    showResult: function (a) {
      var b = this;
      $(function () {
        b._showResult(a)
      })
    }, _showResult: function (a) {
      var b = a.element;
      iscombosearch = a.iscombosearch;
      a = $("#diigoComboSearch");
      if (!a.length) {
        a = $('<div id="diigoComboSearch" class="diigoComboSearch"><span id="diigoComboSearchSettings" title="Enable / Disable this feature"></span><img /><a target="_blank">Searching your Diigo library ...</a><a target="_blank" href="" class="searcho">Try other search engines</a><div style="clear:both;"></div></div>').prependTo($(b));
        a.find("img").attr("src", chrome.extension.getURL("img/diigo-logo.png"));
        $("#diigoComboSearchSettings").css("background-image", "url(" + chrome.extension.getURL("img/icon-setting-16.png") + ")").click(function () {
          window.open(chrome.extension.getURL("options.html"))
        })
      }
      b = $("#diigoComboSearch").find("a").empty();
      iscombosearch && $(b[0]).append($("<a></a>", {}).html("Searching your Diigo library ..."));
      $("a.searcho").empty()
    }
  }
})();
