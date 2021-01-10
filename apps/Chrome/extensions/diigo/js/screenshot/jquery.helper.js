// this file contains helper functions

(function($) {
  /**
   * Test whether argument elements are parents
   * of the first matched element
   * @return boolean
   * @param objs
   *    a jQuery selector, selection, element, or array of elements
   */
  $.fn.hasParent = function(objs) {
    // ensure that objs is a jQuery array
    objs = $(objs);
    var found = false;
    $(this[0]).parents().andSelf().each(function() {
      if ($.inArray(this, objs) != -1) {
        found = true;
        return false; // stops the each...
      }
    });
    return found;
  }
}(jQuery));