// Input Clear
interactions.inputclear = function( fragment ) {
  if (fragment.constructor == Object)
    var groups = assignElements(fragment, "input-clear");
  else
    var groups = findElements(fragment, "input-clear");
  $.each(groups, function(id, group) {
    // Create the X div and hide it (even though this should be in CSS)
    var ex = $("<div class='data-ur-input-clear-ex'></div>").hide();
    // Inject it
    $(group['set']).append(ex);

    // Touch Events
    ex
      .on(touchscreen ? downEvent + ".inputclear" : "click.ur.inputclear", function() {
        // remove text in the box
        input[0].value='';
        input[0].focus();
      })
      .on(upEvent.replace(/(?= )|$/g, ".inputclear"), function() {
        // make sure the keyboard doesn't disappear
        input[0].blur();
      });

    var input = $(group["set"]).find("input");
    input
      .on("focus.ur.inputclear", function() {
        if (input[0].value != '') {
          ex.show();
        }
      })
      .on("keydown.ur.inputclear", function() {
        ex.show();
      })
      .on("blur.ur.inputclear", function() {
        // Delay the hide so that the button can be clicked
        setTimeout(function() { ex.hide();}, 150);
      });
    
    $(group["set"]).data("urInit", true);
  });
};
