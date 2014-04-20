// Toggler
interactions.toggler = function( fragment ) {
  function getRealHeight(item) {
    var clone;
    clone = $(item).clone().attr("data-ur-state","enabled").css({"height":"auto","position":"absolute", "top":"-3000px", "left":"-3000px"}).appendTo($(item).parent());
    // Doesn't play well with margin-top and margin-bottom on the [data-ur-toggler-component = 'content'].
    // Otherwise margins must be calculated and set when transforming as we're doing with the height
    var height = clone.outerHeight(true);
    clone.remove();
    return height;
  }
  if (fragment.constructor == Object)
    var groups = assignElements(fragment, "toggler");
  else
    var groups = findElements(fragment, "toggler");

  $.each(groups, function(id, group) {
    if (!group["button"])
      $.error("no button found for toggler with id: " + id);
    if (!group["content"])
      $.error("no content found for toggler with id: " + id);
    var togglerState = $(group["button"]).attr("data-ur-state") || "disabled";
    $(group["button"]).add(group["content"]).attr("data-ur-state", togglerState);
    $(group["button"]).on("click.ur.toggler", function(event) {
      var enabled = $(group["button"]).attr("data-ur-state") == "enabled";
      var newState = enabled ? "disabled" : "enabled";
      // collapsible determines if this is a animated toggler
      var collapsible = $(group["set"]).attr("data-ur-collapsible") && $(group["set"]).attr("data-ur-collapsible") == "enabled";
      if (collapsible) {
        // add mw-collapsing class that transitions
        $(group["set"]).addClass("mw-collapsing");
        var newHeight = enabled ? "0" : getRealHeight($(group["content"]));
        if (enabled) {
          // if closing we need original height as well
          var oldHeight = !enabled ? "0" : getRealHeight($(group["content"]));
          $(group["content"]).css({
            "height": oldHeight,
            "opacity": 0
          });
          // adding 15ms timeout because firefox needs it. chrome and webkit browsers seems to do well with 1ms
          setTimeout(function() {$(group["content"]).css("height", newHeight)}, 15);
        }
        else {
          $(group["content"]).css({
            "height": newHeight,
            "opacity": 1
          });
        }
        $(group["content"]).on("webkitTransitionEnd transitionend", function() {
          $(group["content"]).css({
            "height": "",
            "opacity": ""
          });
          $(group["set"]).removeClass("mw-collapsing");
          // change state after transition
          $(group["button"]).add(group["content"]).attr("data-ur-state", newState);
        });
      }
      else {
        $(group["button"]).add(group["content"]).attr("data-ur-state", newState);
      }
    });
    $(group["drawer"]).on("webkitTransitionEnd.ur.toggler transitionend.ur.toggler", function() {
      $(this).attr("data-ur-state", $(group["button"]).attr("data-ur-state"));
    });

    $(group["set"]).data("urInit", true);
  });
};
