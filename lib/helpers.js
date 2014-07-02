// for compatibility with older versions of jQuery
var jqVersion = $.fn.jquery.split(".");
if (jqVersion[0] == 1 && jqVersion[1] < 4)
  // older jquery returns document for null selectors
  $ = $.extend(function (selector, context) {
    return new $.fn.init(selector || [], context);
  }, $);

if (!$.fn.on)
  $.fn.extend({
    on: function(types, selector, data, fn) {
      if (data == null && fn == null) {
        // ( types, fn )
        fn = selector;
        selector = null;
      }
      else if (fn == null && typeof selector != "string") {
        // ( types, data, fn )
        fn = data;
        data = selector;
        selector = null;
      }
      return selector ? this.delegate(selector, types, data, fn) : this.bind(types, data, fn);
    },
    off: function(types, selector, fn) {
      if (fn == null) {
        // ( types, fn )
        fn = selector;
        selector = null;
      }
      return selector ? this.undelegate(selector, types, fn) : this.unbind(types, fn);
    }
  });
if (!$.fn.addBack)
  $.fn.addBack = $.fn.andSelf;
if (!$.error)
  $.error = function (msg) {
    throw new Error(msg);
  };

// Keep a unique value for ID initialization
var uniqueUraniumId = function() {
  var count = 0;
  return function() { return ++count + ""; }
}();

// Find elements for the interactions
// optional customFn(set, component) for custom creation of object
function findElements( fragment, type, customFn ) {
  var sets = {};
  var setCss = "[data-ur-set='" + type + "']";
  var compAttr = "data-ur-" + type + "-component";

  var all = "[" +compAttr +"]," + setCss + ":empty";
  $(fragment).find(all).addBack(all).each(function() {
    if ($(this).data("urCompInit"))
      return;
    
    var set = [];
    if (this != document) // for old jQuery compatibility
      set = $(this).attr("data-ur-id") ? $(this) : $(this).closest(setCss);
    if (set[0] && !set.data("urInit")) {
      $(this).data("urCompInit", type);
      var setId = set.attr("data-ur-id");
      if (!setId) {
        setId = uniqueUraniumId();
        set.attr("data-ur-id", setId);
      }
      sets[setId] = sets[setId] || {};
      sets[setId]._id = setId;

      if (set.is(setCss))
        sets[setId].set = set[0];

      if (customFn)
        customFn(sets[setId], this);
      else {
        var compName = $(this).attr(compAttr);
        if (compName) {
          sets[setId][compName] = sets[setId][compName] || [];
          sets[setId][compName].push(this);
        }
      }
    }
  });
  return sets;
}

function assignElements( set, type, customFn ) {
  var setId = uniqueUraniumId();
  
  $.each(set, function(key, comps) {
    if (typeof comps == "string")
      set[key] = comps = $(comps);
    for (var i = comps.length - 1; i >= 0; i--) {
      var comp = $(comps[i]);
      if (comp[0] instanceof Node) {
        if (comp.data("urCompInit"))
          $(comps).splice(i, 1);
        else
          $(this).data("urCompInit", type);
      }
    }
    if (!customFn && key != "set")
      $(comps).attr("data-ur-" + type + "-component", key);
  });
  if (set["set"] && set["set"].length !== 0)
    $(set["set"]).attr("data-ur-set", type).attr("data-ur-id", setId);
  else
    $.each(set, function() {
      $(this).attr("data-ur-id", setId);
    });
  
  if (customFn)
    customFn(set);
  
  var sets = {};
  sets[setId] = $.extend({_id: setId}, set);
  return sets;
}

// test for transform3d, technically supported on old Android but very buggy
var oldAndroid = /Android [12]/.test(navigator.userAgent);
var transform3d = !oldAndroid;
if (transform3d) {
  var css3d = "translate3d(0, 0, 0)";
  var elem3d = $("<a>").css({ webkitTransform: css3d, MozTransform: css3d, msTransform: css3d, transform: css3d });
  transform3d =
    (elem3d.css("WebkitTransform") +
     elem3d.css("MozTransform") +
     elem3d.css("msTransform") +
     elem3d.css("transform") +
     "").indexOf("(") != -1;
}

// test for touch screen
if (window.PointerEvent) { // IE 11+
  var touchscreen = true;
  var downEvent = "pointerdown.ur";
  var moveEvent = "pointermove.ur";
  var upEvent = "pointerup.ur pointerout.ur";
}
else if (window.MSPointerEvent) { // IE 10
  var touchscreen = true;
  var downEvent = "MSPointerDown.ur";
  var moveEvent = "MSPointerMove.ur";
  var upEvent = "MSPointerUp.ur MSPointerOut.ur";
}
else {
  var touchscreen = "ontouchstart" in window;
  var downEvent = (touchscreen ? "touchstart" : "mousedown") + ".ur";
  var moveEvent = (touchscreen ? "touchmove" : "mousemove") + ".ur";
  var upEvent = (touchscreen ? "touchend" : "mouseup") + ".ur";
}

// handle touch events
function getEventCoords(event) {
  event = event.originalEvent;
  event = event.touches ? event.touches[0] : event;
  return {x: event.clientX, y: event.clientY};
}

// stop event helper
function stifle(e) {
  e.preventDefault();
  e.stopPropagation();
}

function bound(num, range) {
  return Math.max(range[0], Math.min(num, range[1]));
}

function isenabled(val) {
  return typeof val == "string" ? val != "disabled" && val != "false" : val;
}

var interactions = {};
