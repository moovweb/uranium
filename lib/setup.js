window.Uranium = {lib: interactions};
$.each(interactions, function(name) {
  Uranium[name] = {};
});

$.fn.Uranium = function() {
  var jqObj = this;
  $.each(interactions, function() {
    this(jqObj);
  });
  return this;
};

$(document).ready($(document).Uranium);
