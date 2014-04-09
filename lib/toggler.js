// Toggler
interactions.toggler = function( fragment ) {
  function getRealHeight(item) {
    var clone;
    clone = $(item).clone().css({"height":"auto","position":"absolute", "top":"-3000px", "left":"-3000px"}).appendTo("body");
    var height = clone.height();
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
      var collapsible = $(group["content"]).attr("data-ur-collapsible") && $(group["content"]).attr("data-ur-collapsible") == "enabled";
      $(group["button"]).add(group["content"]).attr("data-ur-state", newState);
      if (collapsible) {
        var height = enabled ? "0" : getRealHeight($(group["content"]));
        $(group["content"]).css("height", height);
      }
      if (!enabled)
        $(group["drawer"]).attr("data-ur-state", newState);
    });

    $(group["drawer"]).on("webkitTransitionEnd.ur.toggler transitionend.ur.toggler", function() {
      $(this).attr("data-ur-state", $(group["button"]).attr("data-ur-state"));
    });

    $(group["set"]).data("urInit", true);
  });
};
