var Ur = {lib: interactions, options: {}};
window.Uranium = Ur;
$.each(interactions, function(name) {
  Ur[name] = {};
});

$.fn.Uranium = function() {
  var jqObj = this;
  $.each(interactions, function() {
    this(jqObj);
  });
  return this;
};

Ur.options.setup = function() {
  $(document).Uranium();
};

$(function() { Ur.options.setup(); });
