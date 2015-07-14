// for compatibility with older versions of jQuery
var jqVersion = $.fn.jquery.split(".");
if (jqVersion[0] == 1 && jqVersion[1] < 4) {
  // older jquery returns document for null selectors
  var _$ = $;
  $ = $.extend(function (selector, context) {
    return new $.fn.init(selector || [], context);
  }, $);
  $.prototype = _$.prototype;
}

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
if ($.fn.closest.length == 1) {
  $.fn._closest = $.fn.closest;
  $.fn.closest = function(selector, context) {
    var closest = this._closest(selector);
    if (context) {
      closest = closest.filter(function(_, elem) {
        return context.contains(elem);
      });
    }
    return closest;
  }
}

// Keep a unique value for ID initialization
var uniqueUraniumId = function() {
  var count = 0;
  return function() { return "ur" + (++count); };
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

// used for JavaScript initialization e.g. Uranium.lib.widgetname({...})
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

// test for transform3d
// technically supported on old Android but very buggy
// currently sometimes crashing browser/device on iPhone 6+ iOS 8.1
var iPhone6Plus = /iP(?:hone|od).*? OS 8_/.test(navigator.userAgent) && screen.availWidth >= 400 && screen.availHeight >= 700;
var buggy3d = /Android [12]/.test(navigator.userAgent) || iPhone6Plus;
var transform3dSupport = false;
if (!buggy3d) {
  if (window.CSS && CSS.supports) {
    transform3dSupport = CSS.supports("(-webkit-transform: translate3d(0,0,0)) or (-moz-transform: translate3d(0,0,0)) or (-ms-transform: translate3d(0,0,0)) or (transform: translate3d(0,0,0))")
  }
  else {
    var css3d = "translate3d(0, 0, 0)";
    var elem3d = $("<a>").css({ webkitTransform: css3d, MozTransform: css3d, msTransform: css3d, transform: css3d });
    transform3dSupport =
      (elem3d.css("WebkitTransform") +
       elem3d.css("MozTransform") +
       elem3d.css("msTransform") +
       elem3d.css("transform") +
       "").indexOf("(") != -1;
  }
}

// test for touch screen
var touchscreen = "ontouchstart" in window;
var downEvent = (touchscreen ? "touchstart" : "mousedown") + ".ur";
var moveEvent = (touchscreen ? "touchmove" : "mousemove") + ".ur";
var upEvent = (touchscreen ? "touchend" : "mouseup") + ".ur";

function getEventCoords(event) {
  var touches = event.originalEvent.touches || [];
  var changedTouches = event.originalEvent.changedTouches || [];
  event = touches[0] || changedTouches[0] || event;
  var coords = {x: event.clientX, y: event.clientY};
  if (touches[1]) {
     coords.x2 = touches[1].clientX;
     coords.y2 = touches[1].clientY;
  }
  return coords;
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

function isPlainObj(obj) {
  return typeof obj == "object" && Object.getPrototypeOf(obj) == Object.prototype;
}

var interactions = {};
