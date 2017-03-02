// jQuery.Uranium.js
// Build out Uranium interactions in jQuery

(function ( $ ) {

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

function clamp(num, range) {
  return Math.max(range[0], Math.min(num, range[1]));
}

function isenabled(val) {
  return typeof val == "string" ? val != "disabled" && val != "false" : val;
}

function isPlainObj(obj) {
  return typeof obj == "object" && Object.getPrototypeOf(obj) == Object.prototype;
}

var interactions = {};

// Toggler
interactions.toggler = function( fragment ) {
  if (isPlainObj(fragment))
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
      $(group["button"]).add(group["content"]).attr("data-ur-state", newState);
      if (!enabled)
        $(group["drawer"]).attr("data-ur-state", newState);
    });

    $(group["drawer"]).on("webkitTransitionEnd.ur.toggler transitionend.ur.toggler", function() {
      $(this).attr("data-ur-state", $(group["button"]).attr("data-ur-state"));
    });

    $(group["set"]).data("urInit", true);
  });
};

// Tabs
interactions.tabs = function( fragment, options ) {
  options = options || {};
  if (isPlainObj(fragment))
    var groups = assignElements(fragment, "tabs", function(set) {
      $.each(set.tabs, function(key) {
        $.each(this, function(compName) {
          $(this).attr({"data-ur-id": key, "data-ur-tabs-component": compName});
        });
      });
    });
  else
    var groups = findElements(fragment, "tabs", function(set, comp) {
      var tabId = $(comp).attr("data-ur-tab-id");
      set.tabs = set.tabs || {};
      set.tabs[tabId] = set.tabs[tabId] || {};
      var compName = $(comp).attr("data-ur-tabs-component");
      set.tabs[tabId][compName] = set.tabs[tabId][compName] || [];
      set.tabs[tabId][compName].push(comp);
    });

  $.each(groups, function(id, group) {
    group["closeable"] = isenabled($(group["set"]).attr("data-ur-closeable") || options.closeable);

    // Set the state of the tabs
    $.each(group["tabs"], function() {
      var tabState = $(this["button"]).attr("data-ur-state") || "disabled";
      $(this["button"]).add(this["content"]).attr("data-ur-state", tabState);
    });

    // Set up the button call backs
    $.each(group["tabs"], function(_, tab) {
      $(tab["button"]).on("click.ur.tabs", function() {
        // Is the tab open already?
        var open = $(this).attr("data-ur-state") == "enabled";
        $.each(group["tabs"], function() {
          $(this["button"]).add(this["content"]).attr("data-ur-state", "disabled");
        });
        // If closeable (active tab can be toggled) then make sure it happens.
        if (!open || !group["closeable"]) {
          $(tab["button"]).add(tab["content"]).attr("data-ur-state", "enabled");
        }
      });
    });

    $(group["set"]).data("urInit", true);
  });
};

// Input Clear
interactions.inputclear = function( fragment ) {
  if (isPlainObj(fragment))
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
      .on(touchscreen ? "touchstart.ur.inputclear" : "click.ur.inputclear", function() {
        // remove text in the box
        input[0].value='';
        input[0].focus();
      })
      .on("touchend.ur.inputclear", function() {
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

// Geocode
interactions.geocode = function ( fragment, options ) {
  options = options || {};
  if (isPlainObj(fragment))
    var groups = assignElements(fragment, "reverse-geocode", function(set) {
      set["elements"] = set["elements"] || {};
      $.each(set, function(key, value) {
        if (key != "set")
          set["elements"][key] = $(value);
      });
    });
  else
    var groups = findElements(fragment, "reverse-geocode", function(set, comp) {
      set["elements"] = set["elements"] || {};
      set["elements"][$(comp).attr("data-ur-reverse-geocode-component")] = comp;
    });

  $.each(groups, function(id, group) {
    var set = this['set'];

    var callback = $(set).attr("data-ur-callback") || options.callback;
    var errorCallback = $(set).attr("data-ur-error-callback") || options.errorCallback;
    var geocoder;
    var geocodeObj;
    var currentObj;

    function selectHelper(elm, value) {
      for (var i=0,j=elm.length; i<j; i++) {
        if (elm[i].value === value.long_name || elm[i].value.toUpperCase() === value.short_name) {
          elm.selectedIndex = i;
        }
      }
    }

    function fieldHelper(elm, geoInfo, htmlElmType) {
      var index1 = 0;
      var index2 = null; // used for street address
      var need = null;
      var temp = null;
      var self = $(elm).attr("data-ur-reverse-geocode-component");
      switch(self) {
        case 'rg-city':
          need = 'locality';
          break;
        case 'rg-street':
          need = 'street_number';
          break;
        case 'rg-zip':
          need = 'postal_code';
          break;
        case 'rg-state':
          need = 'administrative_area_level_1';
          break;
        case 'rg-country':
          need = 'country';
          break;
      }
      temp=geoInfo[0];
      var myTemp = null;
      for (var i = temp.address_components.length, j=0; j<i; j++) {
        for (var k = temp.address_components[j].types.length, m=0; m<k; m++) {
          myTemp = temp.address_components[j].types[m];
          if (need == myTemp) {
            switch(myTemp) {
              case 'street_number':
                index1 = j;
                index2 = j+1;
                break;
              case 'locality':
                index1 = j;
                break;
              case 'postal_code':
                index1 = j;
                break;
              case 'administrative_area_level_1':
                index1 = j;
                break;
              case 'country':
                index1 = j;
            }
            break;
          }
        }
      }
      if (htmlElmType === "input") {
        if (index2 === null) {
          elm.value = geoInfo[0].address_components[index1].long_name;
        } else {
          elm.value = geoInfo[0].address_components[index1].long_name + " " + geoInfo[0].address_components[index2].long_name;
        }
      } else if (htmlElmType === "select") {
        selectHelper(elm, geoInfo[0].address_components[index1]);
      }
    }

    function populateFields (geoInfo) {
      var elements = currentObj.elements;
      for (elm in elements) {
        if (elements[elm].localName === "input") {
          fieldHelper(elements[elm], geoInfo, "input")
        }
        else if (elements[elm].localName === "select") {
          fieldHelper(elements[elm], geoInfo, "select")
        }
      }
    }

    this.setupCallbacks = function () {
      currentObj = this;
      // Set up call back for button to trigger geocoding
      var btn = this["elements"]["rg-button"];
      if (btn) {
        $(btn).on(
          "click.ur.inputclear",
          function(obj){
            return function() {
              obj.geocodeInit();
            }
          }(this)
        );
      } else {
        console.warn("no button for triggering reverse geocoding present");
        this.geocodeInit();
      }
    };

    this.geoSuccess = function( position ){
      var coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      this.codeLatLng(coords.lat, coords.lng);
    },

    this.geoError = function( error ){
      console.error("Ur geolocation error -- Error Getting Your Coordinates!");
      switch(error.code)
      {
        case error.TIMEOUT:
          console.error ('Ur geolocation error -- Timeout');
          break;
        case error.POSITION_UNAVAILABLE:
          console.error ('Ur geolocation error -- Position unavailable');
          break;
        case error.PERMISSION_DENIED:
          console.error ('Ur geolocation error -- Permission denied');
          break;
        case error.UNKNOWN_ERROR:
          console.error ('Ur geolocation error -- Unknown error');
          break;
      }
      if (typeof errorCallback == "function")
        errorCallback();
      else
        eval(errorCallback);
    }

    this.geoDenied = function() {
      console.error("Ur geolocation error -- User Denied Geolocation");
    }

    this.codeLatLng = function( lat, lng ) {
      var latlng = new google.maps.LatLng(lat, lng);
      var self = this;

      geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            geocodeObj = results;
            populateFields(geocodeObj);

            if (typeof callback == "function")
                callback();
            else
              eval(callback);

            return results;
          } else {
            console.error("Geocoder failed due to: " + status);
          }
        }
      });
    }

    this.geocodeInit = function () {
      if(navigator.geolocation){ //feature detect
        geocoder = new google.maps.Geocoder();
        navigator.geolocation.getCurrentPosition(
          function(obj){
            return function(position){
              obj.geoSuccess(position);
            };
          }(this),
          function(obj) {
            return function(errors){
              obj.geoError(errors);
            };
          }(this),
          this.geoDenied
        );
      }
    }

    UrGeocode = function( obj ) {
      return function() {
        obj.setupCallbacks();
      };
    }(this);
    var s = document.createElement('script');
    s.type = "text/javascript";
    s.src = "https://maps.googleapis.com/maps/api/js?sensor=true&callback=UrGeocode";
    $('head').append(s);
    
    $(group["set"]).data("urInit", true);
  });
};

// Zoom
interactions.zoom = function ( fragment, options ) {
  options = $.extend({touch: true}, options);
  if (isPlainObj(fragment)) {
    var groups = assignElements(fragment, "zoom", function(set) {
      set.img = [];
      $.each(set.imgs, function() {
        $(this.img).attr({
          "data-ur-zoom-component": "img",
          "data-ur-width": this.width,
          "data-ur-height": this.height,
          "data-ur-src": this.src});
        set.img.push($(this.img));
      });
      $(set.loading).attr({"data-ur-zoom-component": "loading", "data-ur-state": "disabled"});
    });
  }
  else
    var groups = findElements(fragment, "zoom");

  $.each(groups, function(id, group) {
    Uranium.zoom[id] = new Zoom(this);
    $(group["set"]).data("urInit", true);
  });

  function Zoom(set) {
    var zoomer = this;
    this.container = set["set"];
    this.img = set["img"];

    // Optionally:
    this.button = set["button"];
    this.idler = set["loading"];

    var $container = $(this.container);
    var $idler = $(this.idler);
    var $btn = $(this.button);
    var activeImg; // needed for carousel zoom combination

    var gesturesEnabled = $container.attr("data-ur-touch") != "disabled" || options.touch;
    var translatePrefix = "translate(", translateSuffix = ")";
    var scalePrefix = " scale(", scaleSuffix = ")";

    this.transform3d = transform3d;
    var custom3d = $container.attr("data-ur-transform3d");
    if (custom3d)
      this.transform3d = custom3d != "disabled";
    else if ("transform3d" in options)
      this.transform3d = options.transform3d;

    if (zoomer.transform3d) {
      translatePrefix = "translate3d(";
      translateSuffix = ",0)";
      scalePrefix = " scale3d(";
      scaleSuffix = ",1)";
    }

    var imgs = $(zoomer.img).map(function() {
      return new Img(this);
    });

    function setActive(img) {
      if (activeImg && activeImg != img) {
        activeImg.zoomOut(true);
      }
      activeImg = img;
    }

    function closeEnough(coords1, coords2) {
      return Math.abs(coords1.x - coords2.x) < 8 && Math.abs(coords1.y - coords2.y) < 8;
    }

    function multiTouch(event) {
      var touches = event.originalEvent.touches;
      if (touches)
        return touches.length > (event.type == "touchend" ? 0 : 1);
    }

    function relativeCoords(event) {
      var coords = getEventCoords(event);
      var rect = event.target.getBoundingClientRect();
      return {
        x: coords.x - rect.left,
        y: coords.y - rect.top,
        x2: coords.x2 - rect.left,
        y2: coords.y2 - rect.top
      };
    }

    // zoom in/out button, zooms in to the center of the image
    $(zoomer.button).on("click.ur.zoom", function() {
      var active = imgs[0];
      // handle carousel zoom combination
      if (imgs.length > 1)
        active = imgs.filter(function() { return $(this.img).closest("[data-ur-state='active']", zoomer.container)[0]; })[0];
      setActive(active);
      active.zoom();
    });

    function Img(img) {
      var self = this;
      var state = "disabled";
      var $img = $(img);
      var canvasWidth, canvasHeight;
      var width, height;
      var bigWidth, bigHeight;
      var bigBounds; // translation bounds
      var currentBounds; // translation bounds
      var imgRatio;
      var prescale; // bigWidth and bigHeight are known
      var initAbsCoords, absCoords;
      var clickFlag, downFlag;
      var timeStamp;
      var transXY;

      // momentum sliding
      var frictionTime, frictionTimer;
      var dx1 = 0, dy1 = 0;
      var dx2 = 0, dy2 = 0;
      var time1 = 0, time2 = 0;
      var slidex, slidey;

      // pinch to zoom
      var initScale = 1, currentScale = 1;
      var initDist;
      var midpointCoords;

      this.img = img;

      function initialize() {
        $container.attr("data-ur-transform3d", zoomer.transform3d ? "enabled" : "disabled");

        canvasWidth = canvasWidth || $img.parent().outerWidth();
        canvasHeight = canvasHeight || $img.parent().outerHeight();
        width = width || parseInt($img.attr("width")) || parseInt($img.css("width")) || $img[0].width;
        height = height || parseInt($img.attr("height")) || parseInt($img.css("height")) || $img[0].height;

        bigWidth = parseInt($img.attr("data-ur-width")) || $img[0].naturalWidth;
        bigHeight = parseInt($img.attr("data-ur-height")) || $img[0].naturalHeight;

        if (!$img.attr("data-ur-src"))
          $img.attr("data-ur-src", $img.attr("src"));

        if (($img.attr("data-ur-width") && $img.attr("data-ur-height")) || $img.attr("src") == $img.attr("data-ur-src"))
          prescale = true;

        imgRatio = bigWidth/width;

        var xb = (bigWidth - canvasWidth)/2; // horizonal translation to show left side of image
        var yb = (bigHeight - canvasHeight)/2; // vertical translation to show left top side of image
        currentBounds = bigBounds = { x: [-xb, xb], y: [-yb, yb] };

        $img.css("width", width + "px");
        $img.css("height", height + "px");
      }

      function getTranslate() {
        var style = $img[0].style;
        if (window.WebKitCSSMatrix) {
          var matrix = new WebKitCSSMatrix(style.webkitTransform);
          return { x: matrix.m41, y: matrix.m42 };
        }
        var css = style.msTransform || style.transform || "translate(0, 0)";
        css = css.substring(css.indexOf("(") + 1).split(",");
        return { x: parseFloat(css[0]), y: parseFloat(css[1]) };
      }

      function panMove(event) {
        stifle(event);
        var coords = getEventCoords(event);
        var dx = coords.x - absCoords.x;
        var dy = coords.y - absCoords.y;
        destOffsetX = clamp(transXY.x + dx, currentBounds.x);
        destOffsetY = clamp(transXY.y + dy, currentBounds.y);
        transform(destOffsetX, destOffsetY, currentScale);
        dx1 = dx2;
        dy1 = dy2;
        dx2 = dx;
        dy2 = dy;
        time1 = time2;
        time2 = event.timeStamp;
      }

      function panEnd(event) {
        stifle(event);
        if (event.timeStamp < time2 + 50)
          slide();
      }

      function slide() {
        setState("enabled-slide");
        var ddx = dx2 - dx1, ddy = dy2 - dy1;
        var scalar = 100 * Math.sqrt((ddx * ddx + ddy * ddy)/(dx2 * dx2 + dy2 * dy2))/(time2 - time1);
        slidex = scalar * dx2;
        slidey = scalar * dy2;
        var newOffsetX = clamp(destOffsetX + slidex, currentBounds.x);
        var newOffsetY = clamp(destOffsetY + slidey, currentBounds.y);
        transform(newOffsetX, newOffsetY, currentScale);
        frictionTime = Date.now();
        frictionTimer = setTimeout(function() {
          setState("enabled");
        }, 300);
      }

      function stopSlide() {
        setState("enabled");
        var t = (Date.now() - frictionTime) / 300;
        clearTimeout(frictionTimer);
        var cb = 1 - Math.pow(1 - t, 1.685); // approximate cubic bezier y(x)
        var currentOffsetX = clamp(destOffsetX + cb * slidex, currentBounds.x);
        var currentOffsetY = clamp(destOffsetY + cb * slidey, currentBounds.y);
        transform(currentOffsetX, currentOffsetY, currentScale);
      }

      // should this be separated into pinchIn/Out?
      // zoom in/out with midpoint as the "tranform origin"
      function pinchZoom(event) {
        var coords = getEventCoords(event);
        var dx = coords.x2 - coords.x;
        var dy = coords.y2 - coords.y;
        var dist = dx * dx + dy * dy;
        var diagonal = width * width + height * height;
        var deltaDist = dist - initDist;
        currentScale = clamp(initScale + 4 * imgRatio * deltaDist/diagonal, [1, imgRatio]);
        var dScale = currentScale/initScale;
        var xb = (currentScale * width - canvasWidth)/2, yb = (currentScale * height - canvasHeight)/2;
        currentBounds = { x: [-xb, xb], y: [-yb, yb] };
        var newX = clamp(transXY.x * dScale + (dScale - 1) * (canvasWidth/2 - midpointCoords.x), currentBounds.x);
        var newY = clamp(transXY.y * dScale + (dScale - 1) * (canvasHeight/2 - midpointCoords.y), currentBounds.y);
        transform(newX, newY, currentScale);
      }

      function setState(s) {
        state = s;
        $img.attr("data-ur-state", state);
        if (zoomer.img.length == 1)
          $container.attr("data-ur-state", state); // backwards compatibility
      }

      function transform(x, y, scale) {
        currentScale = scale;
        var t = "";
        if (x != null)
          t = translatePrefix + x + "px, " + y + "px" + translateSuffix;
        if (scale != null)
          t += scalePrefix + scale + ", " + scale + scaleSuffix;

        return $img.css({ webkitTransform: t, msTransform: t, transform: t });
      }

      function loadImg() {
        if ($img.attr("src") == $img.attr("data-ur-src"))
          return;
        $img.attr("src", $img.attr("data-ur-src"));
        setTimeout(function() {
          if (!prescale)
            $idler.attr("data-ur-state", "enabled");
        }, 13);
      }

      function zoomload(coords) {
        state = "enabled-in";
        $img.one("load.ur.zoom", function() {
          initialize();
          state = "disabled";
          self.zoomIn(coords);
        });

        loadImg();
      }

      function carouselSnapping() {
        return $container.parent().closest("[data-ur-state='enabled-slide']")[0];
      }

      // attempts to zoom in centering in on the area that was touched
      this.zoomIn = function(coords) {
        if (state != "disabled")
          return;

        if (!width)
          initialize();

        if (prescale) {
          currentBounds = bigBounds;
          var trX = 0, trY = 0; // relative to center of image
          if (coords) {
            trX = clamp(bigWidth/2 - imgRatio * coords.x, bigBounds.x);
            trY = clamp(bigHeight/2 - imgRatio * coords.y, bigBounds.y);
          }
          $btn.attr("data-ur-state", "enabled");
          setState("enabled-in");
          transform(trX, trY, imgRatio);
        }
        else
          zoomload(coords);
      };

      this.zoomOut = function(now) {
        $btn.attr("data-ur-state", "disabled");
        setState(now ? "disabled" : "enabled-out");
        transform(0, 0, 1);
      };

      // zoom in/out center of image
      this.zoom = function() {
        if (state == "disabled")
          self.zoomIn();
        else if (state == "enabled")
          self.zoomOut();
      };

      $img.on(downEvent + ".zoom", function(event) {
        if (carouselSnapping())
          return;
        downFlag = true;
        if (state == "enabled-slide")
          stopSlide();
        if (state != "enabled-in" && state != "enabled-out") {
          absCoords = getEventCoords(event);
          initScale = currentScale;
          transXY = getTranslate();
          if (multiTouch(event)) {
            clickFlag = false;
            var dx = absCoords.x2 - absCoords.x;
            var dy = absCoords.y2 - absCoords.y;
            initDist = dx * dx + dy * dy;
            initialize();

            var rel = relativeCoords(event);
            midpointCoords = {
              x: ((rel.x + rel.x2)/2 + transXY.x)/initScale,
              y: ((rel.y + rel.y2)/2 + transXY.y)/initScale
            };
            initAbsCoords = absCoords;
          }
          else {
            clickFlag = true;
            initAbsCoords = absCoords;
            timeStamp = event.timeStamp;
            // panStart
            if (state == "enabled")
              stifle(event);
          }
        }
      });

      $img.on(moveEvent + ".zoom", function(event) {
        var mt = multiTouch(event);
        if (mt) {
          stifle(event); // prevent native browser pinch zoom
        }
        if (carouselSnapping())
          return;
        if (!downFlag)
          return;
        var close = closeEnough(getEventCoords(event), initAbsCoords)
        if (mt || !close)
          clickFlag = false;
        if (mt) {
          if (state == "disabled" && close) { // make sure not currently dragging carousel
            $btn.attr("data-ur-state", "enabled");
            setState("enabled");
          }
        }
        if (gesturesEnabled && state == "enabled") {
          if (mt) {
            if (prescale)
              pinchZoom(event);
            else
              zoomload();
          }
          else
            panMove(event);
        }
      });

      $img.on(upEvent + ".zoom", function(event) {
        if (carouselSnapping())
          return;
        var mt = multiTouch(event);
        if (mt) {
          // desired behavior?
          // allow panning right after pinch zoom
          transXY = getTranslate();
          absCoords = getEventCoords(event);
        }
        else
          downFlag = false;
        if (clickFlag) {
          if (event.timeStamp - timeStamp < 400) {
            if (state == "enabled") {
              self.zoomOut();
            }
            else if (state == "disabled") {
              setActive(self);
              self.zoomIn(relativeCoords(event));
            }
          }
        }
        else if (state == "enabled") {
          loadImg(); // after initial pinch zoom
          if (currentScale == 1) {
            // fully pinch zoomed out
            $btn.attr("data-ur-state", "disabled");
            setState("disabled");
          }
          else if (!mt)
            panEnd(event);
        }
      });

      $img.on("webkitTransitionEnd.ur.zoom transitionend.ur.zoom", function() {
        // done zooming in
        if (state == "enabled-in") {
          loadImg();
          setState("enabled");
          initScale = imgRatio;
        }
        // done zooming out
        else if (state == "enabled-out") {
          setState("disabled");
        }
      });

      $img.on("load.ur.zoom", function() {
        $idler.attr("data-ur-state", "disabled");
      });
    }
  }
};

// Carousel
interactions.carousel = function ( fragment, options ) {
  if (isPlainObj(fragment))
    var groups = assignElements(fragment, "carousel");
  else
    var groups = findElements(fragment, "carousel");

  // for each carousel
  $.each(groups, function(id, group) {
    $(group["buttons"]).each(function() {
      var type = $(this).attr("data-ur-carousel-button-type");
      if(!type) {
        $.error("malformed carousel button type for carousel with id: " + id);
      }
      $(this).attr("data-ur-state", type == "prev" ? "disabled" : "enabled");
    });
    Uranium.carousel[id] = new Carousel(group, options);
    $(group["set"]).data("urInit", true);
    $(group["set"]).attr("data-ur-state", "enabled"); // should be data-ur-init or fire event
  });

  // private methods

  function zeroFloor(num) {
    return num >= 0 ? Math.floor(num) : Math.ceil(num);
  }

  function Carousel(set, options) {
    var self = this;
    self.urId = set["_id"];
    self.container = set["set"];
    self.scroller = set["scroll_container"];
    if (!self.scroller)
      $.error("carousel missing item components");
    self.items = set["item"] || [];

    // Optionally:
    self.button = {
      prev: $(set["button"]).filter("[data-ur-carousel-button-type='prev']"),
      next: $(set["button"]).filter("[data-ur-carousel-button-type='next']")
    };
    self.counter = set["count"];
    self.dots = set["dots"];

    self.flag = {
      click: true,            // used for determining if item is clicked on touchscreens
      snapping: false,        // true if carousel is currently snapping, flag for users' convenience
      lock: null,             // used for determining horizontal/vertical dragging motion on touchscreens
      touched: false          // true when user is currently touching/dragging
    };

    self.options = {
      autoscroll: false,
      autoscrollDelay: 5000,
      autoscrollForward: true,
      center: false,            // position active item in the middle of the carousel
      cloneLength: 0,           // number of clones at back of carousel (or front and back for centered carousels)
      fill: 0,                  // exactly how many items forced to fit in the viewport, 0 means disabled
      infinite: true,           // loops the last item back to first and vice versa
      speed: 1.1,               // determines how "fast" carousel snaps, should probably be deprecated
      transform3d: transform3d, // determines if translate3d() or translate() is used
      touch: true               // determines if carousel can be dragged e.g. when user only wants buttons to be used
    };

    $.extend(self.options, options);

    self.count = self.items.length;     // number of items (excluding clones)
    self.itemIndex = 0;                 // index of active item (including clones)
    self.translate = 0;                 // current numerical css translate value

    var $container = $(self.container);
    var $items = $(self.items);         // all carousel items (including clones)
    var coords = null;
    var prevCoords;                     // stores previous coords, used for determining swipe direction
    var startCoords = {x: 0, y: 0};
    var shift = 0;                      // in range [0, 1) or [-0.5, 0.5) for centered carousels showing translate percentage past top/left side of active item
    var dest = $items[0];               // snap destination element
    var destinationOffset;              // translate value of destination
    var lastIndex = self.count - 1;     // index of last item
    var allItemsWidth;                  // sum of all items' widths (excluding clones)
    var autoscrollId;                   // used for autoscrolling timeout
    var momentumId;                     // used for snapping timeout

    var isThisInit = true;              // check if we are initalizeing

    var viewport = $container.outerWidth();

    var startingOffset = null;

    var translatePrefix = "translate3d(", translateSuffix = ", 0)";

    function initialize() {
      if (!self.options.transform3d) {
        translatePrefix = "translate(";
        translateSuffix = ")";
      }

      $items.each(function(i, obj) {
        if ($(obj).attr("data-ur-state") == "active") {
          self.itemIndex = i;
          return false;
        }
      });

      insertClones();
      updateDots();
      updateIndex(self.options.center ? self.itemIndex + self.options.cloneLength : self.itemIndex);
      self.update();

      $(self.scroller).on("dragstart.ur.carousel", function() { return false; }); // for Firefox

      if (self.options.touch) {
        $(self.scroller)
          .on(downEvent + ".carousel", startSwipe)
          .on(moveEvent + ".carousel", continueSwipe)
          .on(upEvent + ".carousel", finishSwipe);
        $(self.scroller).each(function() {
          this.addEventListener("click", function(e) {
            if (!self.flag.click)
              stifle(e);
          }, true);
        });
      }

      self.button.prev.on("click.ur.carousel", function() {
        moveTo(1);
      });
      self.button.next.on("click.ur.carousel", function() {
        moveTo(-1);
      });

      if ("onorientationchange" in window && !/Android/.test(navigator.userAgent))
        $(window).on("orientationchange.ur.carousel", function() { self.update(); });
      else
        $(window).on("resize.ur.carousel", function() {
          if (viewport != $container.outerWidth())
            self.update();
        });

      $items.find("img").addBack("img").on("load.ur.carousel", function() { self.update(); }); // after any (late-loaded) images are loaded

      self.autoscrollStart();

      $container.triggerHandler("load.ur.carousel");
      isThisInit = false;
    }

    function readAttributes() {
      var custom3d = $container.attr("data-ur-android3d") || $container.attr("data-ur-transform3d");
      if (custom3d)
        self.options.transform3d = custom3d != "disabled";
      $container.attr("data-ur-transform3d", self.options.transform3d ? "enabled" : "disabled");
      if (oldAndroid && !self.options.transform3d) {
        var speed = parseFloat($container.attr("data-ur-speed"));
        self.options.speed = speed > 1 ? speed : 1.3;
      }
      $container.attr("data-ur-speed", self.options.speed);

      var fill = parseInt($container.attr("data-ur-fill"));
      if (fill > 0)
        self.options.fill = fill;
      $container.attr("data-ur-fill", self.options.fill);

      var cloneLength = $container.attr("data-ur-clones");
      if (cloneLength)
        self.options.cloneLength = parseInt(cloneLength);
      $container.attr("data-ur-clones", self.options.cloneLength);

      var autoscrollDelay = parseInt($container.attr("data-ur-autoscroll-delay"));
      if (autoscrollDelay >= 0)
        self.options.autoscrollDelay = autoscrollDelay;
      $container.attr("data-ur-autoscroll-delay", self.options.autoscrollDelay);

      var autoscrollDir = $container.attr("data-ur-autoscroll-dir");
      if (autoscrollDir)
        self.options.autoscrollForward = autoscrollDir != "prev";
      $container.attr("data-ur-autoscroll-dir", self.options.autoscrollForward ? "next" : "prev");

      // read boolean attributes
      $.each(["autoscroll", "center", "infinite", "touch"], function(_, name) {
        var dashName = "data-ur-" + name.replace(/[A-Z]/g, function(i) { return "-" + i.toLowerCase()});
        var value = $container.attr(dashName);
        if (value == "enabled")
          self.options[name] = true;
        else if (value == "disabled")
          self.options[name] = false;

        $container.attr(dashName, self.options[name] ? "enabled" : "disabled");
      });
    }

    function insertClones() {
      if (!self.options.infinite) {
        self.options.cloneLength = 0;
        $container.attr("data-ur-clones", 0);
        return;
      }

      if (self.options.cloneLength == 0) {
        if (self.options.fill)
          self.options.cloneLength = self.options.center ? Math.min(1, self.options.fill - 1) : self.options.fill;
        else if (self.options.center) {
          // insert enough clones at front and back to never see a blank space
          var cloneLengths = [0, 0];
          var space = viewport/2 + width($items[lastIndex])/2;
          for (var i = lastIndex; space > 0; i = (i - 1 + self.count) % self.count) {
            space -= width($items[i]);
            cloneLengths[0]++;
          }

          space = viewport/2 + width($items[0])/2;
          for (var i = 0; space > 0; i = (i + 1) % self.count) {
            space -= width($items[i]);
            cloneLengths[1]++;
          }

          self.options.cloneLength = Math.max(cloneLengths[0], cloneLengths[1]);
        }
        else {
          // insert enough clones at the back to never see a blank space
          var space = viewport;
          var i = 0;
          while (space > 0) {
            space -= width($items[i]);
            self.options.cloneLength++;
            i = (i + 1) % $items.length;
          }
        }
      }

      $container.attr("data-ur-clones", self.options.cloneLength);

      var frag = document.createDocumentFragment();
      for (var i = 0; i < self.options.cloneLength; i++) {
        var srcIndex = i % self.count;
        var clone = $items.eq(srcIndex).clone(true).attr("data-ur-clone", srcIndex).attr("data-ur-state", "inactive");
        frag.appendChild(clone[0]);
      }
      $items.parent().append(frag);

      if (self.options.center) {
        frag = document.createDocumentFragment()
        var offset =  self.count - (self.options.cloneLength % self.count);
        for (var i = offset; i < offset + self.options.cloneLength; i++) {
          var srcIndex = i % self.count;
          var clone = $items.eq(srcIndex).clone(true).attr("data-ur-clone", srcIndex).attr("data-ur-state", "inactive");
          frag.appendChild(clone[0]);
        }
        $items.parent().prepend(frag);
      }

      $items = $(self.scroller).find("[data-ur-carousel-component='item']");
      lastIndex = $items.length - 1;
    }

    function updateDots() {
      if (self.dots) {
        var existing = $(self.dots).find("[data-ur-carousel-component='dot']");
        if (existing.length != self.count) {
          existing.remove();
          var dot = $("<div data-ur-carousel-component='dot'>");
          var storage = document.createDocumentFragment();
          for (var i = 0; i < self.count; i++) {
            var newdot = dot.clone();
            storage.appendChild(newdot[0]);
          }
          $(self.dots).append(storage);
        }
      }
    }

    self.update = function(options) {
      if (options)
        $.extend(self.options, options);
      var oldCount = $items.length;
      $items = $(self.scroller).find("[data-ur-carousel-component='item']");
      if (oldCount != $items.length) {
        self.items = $items.filter(":not([data-ur-clone])").toArray();
        self.count = self.items.length;
        lastIndex = $items.length - 1;

        $items.each(function(i, obj) {
          if ($(obj).attr("data-ur-state") == "active") {
            self.itemIndex = i;
            return false;
          }
        });

        // in case the previous active item was removed
         if (self.itemIndex >= $items.length - self.options.cloneLength) {
          self.itemIndex = lastIndex - self.options.cloneLength;
          $items.eq(self.itemIndex).attr("data-ur-state", "active");
        }

        // in the rare case the destination element was (re)moved
        if (!self.scroller.contains(dest))
          dest = $items[self.itemIndex];

        updateDots();
        updateIndex(self.options.center ? self.itemIndex + self.options.cloneLength : self.itemIndex);
      }

      viewport = $container.outerWidth();
      // Adjust the container to be the necessary width.
      var totalWidth = 0;

      // pixel-perfect division, slightly inefficient?
      var divisions = [];
      if (self.options.fill > 0) {
        var remainder = viewport;
        for (var i = self.options.fill; i > 0; i--) {
          var length = Math.round(remainder/i);
          divisions.push(length);
          remainder -= length;
        }
      }

      allItemsWidth = 0;
      for (var i = 0; i < $items.length; i++) {
        if (self.options.fill > 0) {
          var length = divisions[i % self.options.fill];
          var item = $items.eq(i);
          // set outerWidth regardless of box-sizing
          item.css("width", length + parseInt(item.css("width")) - item.outerWidth()); // could add true param if margins allowed
          totalWidth += length;
        }
        else
          totalWidth += width($items[i]);

        if (i <= lastIndex - self.options.cloneLength && i >= (self.options.center ? self.options.cloneLength : 0))
          allItemsWidth += width($items[i]);
      }

      $(self.scroller).width(totalWidth);

      var currentItem = $items[self.itemIndex];
      var newTranslate = -(offsetFront(currentItem) + shift * width(currentItem));
      destinationOffset = -offsetFront(dest);
      if (self.options.center) {
        newTranslate += centerOffset(currentItem);
        destinationOffset += centerOffset(dest);
      }
      translateX(newTranslate);
    };

    self.autoscrollStart = function() {
      if (!self.options.autoscroll)
        return;

      autoscrollId = setTimeout(function() {
        if (viewport != 0) {
          if (!self.options.infinite && self.itemIndex == lastIndex && self.options.autoscrollForward)
            self.jumpToIndex(0);
          else if (!self.options.infinite && self.itemIndex == 0 && !self.options.autoscrollForward)
            self.jumpToIndex(lastIndex);
          else
            moveTo(self.options.autoscrollForward ? -1 : 1);
        }
        else
          self.autoscrollStart();
      }, self.options.autoscrollDelay);
    };

    self.autoscrollStop = function() {
      clearTimeout(autoscrollId);
    };

    function updateButtons() {
      if (self.options.infinite)
        $([self.button.prev, self.button.next]).attr("data-ur-state", "enabled");
      else {
        $(self.button.prev).attr("data-ur-state", self.itemIndex == 0 ? "disabled" : "enabled");
        $(self.button.next).attr("data-ur-state", self.itemIndex == self.count - Math.max(self.options.fill, 1) ? "disabled" : "enabled");
      }
    }

    // execute side effects of new index
    function updateIndex(newIndex) {
      if (newIndex === undefined)
        return;

      self.itemIndex = newIndex;
      if (self.itemIndex < 0)
        self.itemIndex = 0;
      else if (self.itemIndex > lastIndex)
        self.itemIndex = lastIndex;

      var realIndex = self.itemIndex;
      if (self.options.infinite && self.options.center)
        realIndex = self.itemIndex - self.options.cloneLength;
      realIndex = realIndex % self.count;
      $(self.counter).html(function() {
        var template = $(this).attr("data-ur-template") || "{{index}} of {{count}}";
        return template.replace("{{index}}", realIndex + 1).replace("{{count}}", self.count);
      });

      $items.attr("data-ur-state", "inactive");
      $items.eq(self.options.center ? self.itemIndex : realIndex).attr("data-ur-state", "active");

      $(self.dots).find("[data-ur-carousel-component='dot']").attr("data-ur-state", "inactive").eq(realIndex).attr("data-ur-state", "active");

      updateButtons();
      if (!isThisInit)
        $container.triggerHandler("itemChange", {index: newIndex});
    }

    function startSwipe(e) {
      self.autoscrollStop();

      self.flag.touched = true;
      self.flag.lock = null;
      self.flag.click = true;

      coords = getEventCoords(e);

      startCoords = prevCoords = coords;
      startingOffset = getTranslateX();
    }

    function continueSwipe(e) {
      if (!self.flag.touched) // for non-touch environments since mousemove fires without mousedown
        return;

      prevCoords = coords;
      coords = getEventCoords(e);

      if (Math.abs(startCoords.y - coords.y) + Math.abs(startCoords.x - coords.x) > 0)
        self.flag.click = false;

      var slope = Math.abs((startCoords.y - coords.y)/(startCoords.x - coords.x));

      if (!self.flag.snapping) {
        if (self.flag.lock) {
          if (self.flag.lock == "y")
            return;
        }
        else if (slope > 1.2) {
          self.flag.lock = "y";
          return;
        }
        else
          self.flag.lock = "x";

        stifle(e);
      }

      stifle(e);

      if (coords !== null) {
        var dist = startingOffset + swipeDist(startCoords, coords); // new translate() value, usually negative

        var threshold = -dist;
        if (self.options.center)
          threshold += viewport/2;
        $items.each(function(i, item) {
          var boundStart = offsetFront(item);
          var boundEnd = boundStart + width(item);
          if (boundEnd > threshold) {
            self.itemIndex = i;
            shift = (threshold - boundStart)/width(item);
            if (self.options.center)
              shift -= 0.5;
            return false;
          }
        });

        if (self.options.infinite) {
          if (self.options.center) {
            if (self.itemIndex < self.options.cloneLength) { // at the start of carousel so loop to end
              startingOffset -= allItemsWidth;
              dist -= allItemsWidth;
              self.itemIndex += self.count;
            }
            else if (self.itemIndex >= self.count + self.options.cloneLength) { // at the end of carousel so loop to start
              startingOffset += allItemsWidth;
              dist += allItemsWidth;
              self.itemIndex -= self.count;
            }
          }
          else {
            if (shift < 0) { // at the start of carousel so loop to end
              startingOffset -= allItemsWidth;
              dist -= allItemsWidth;
              self.itemIndex += self.count;
              var item = $items[self.itemIndex];
              shift = (-dist - offsetFront(item))/width(item);
            }
            else if (self.itemIndex >= self.count) { // at the end of carousel so loop to start
              var offset = offsetFront($items[self.count]) - offsetFront($items[0]); // length of all original items
              startingOffset += offset;
              dist += offset;
              self.itemIndex -= self.count;
            }
          }
        }
        translateX(dist);
      }

    }

    function finishSwipe(e) {
      if (!self.flag.touched) // for non-touch environments since mouseup fires without mousedown
        return;

      if (!self.flag.click || self.flag.lock)
        stifle(e);
      else if (e.target.tagName == "AREA")
        location.href = e.target.href;

      self.flag.touched = false;

      if (self.flag.lock != "y") {
        var dir = coords.x - prevCoords.x;
        if (self.options.center) {
          if (dir < 0 && shift > 0)
            moveTo(-1);
          else if (dir > 0 && shift < 0)
            moveTo(1);
          else
            moveTo(0);
        }
        else
          moveTo(dir < 0 ? -1: 0);
      }
    }

    function moveTo(direction) {
      self.autoscrollStop();

      // in case prev/next buttons are being spammed
      clearTimeout(momentumId);

      var newIndex = self.itemIndex - direction;
      if (!self.options.infinite) {
        if (self.options.fill > 0  && !self.options.center)
          newIndex = bound(newIndex, [0, self.count - self.options.fill]);
        else
          newIndex = bound(newIndex, [0, lastIndex]);
      }

      // when snapping to clone, prepare to snap back to original element
      if (self.options.infinite) {
        var transform = getTranslateX();
        if (self.options.center) {
          if (newIndex < self.options.cloneLength) { // clone at start of carousel so loop to back
            translateX(transform - allItemsWidth);
            newIndex += self.count;
            self.itemIndex = newIndex + direction;
          }
          else if (newIndex >= self.count + self.options.cloneLength) { // clone at end of carousel so loop to front
            translateX(transform + allItemsWidth);
            newIndex -= self.count;
            self.itemIndex = newIndex + direction;
          }

        }
        else {
          if (newIndex < 0) { // at start of carousel so loop to back
            translateX(transform - allItemsWidth);
            newIndex += self.count;
            self.itemIndex = newIndex + direction;
          }
          else if (newIndex > self.count) { // clone at end of carousel so loop to start
            translateX(transform + allItemsWidth);
            newIndex -= self.count;
            self.itemIndex = newIndex + direction;
          }

        }
      }

      dest = $items[newIndex];
      $container.attr("data-ur-state", "enabled-slide");
      $container.triggerHandler("slidestart", {index: newIndex});

      // timeout needed for mobile safari
      setTimeout(function() {
        snapTo();
        updateIndex(newIndex);
      }, 0);
    }

    function snapTo() {
      destinationOffset = -offsetFront(dest);
      if (self.options.center)
        destinationOffset += centerOffset(dest);

      function momentum() {
        // in case user touched in the middle of snapping
        if (self.flag.touched)
          return;

        var translate = getTranslateX();
        var distance = destinationOffset - translate;
        var delta = distance - zeroFloor(distance / self.options.speed);

        // Hacky -- this is for the desktop browser only -- to fix rounding errors
        // Ideally, this is removed at compile time
        if(Math.abs(delta) < 0.01)
          delta = 0;

        var newTransform = translate + delta;
        translateX(newTransform);

        self.flag.snapping = delta != 0;
        if (self.flag.snapping)
          momentumId = setTimeout(momentum, 16);
        else
          endSnap();
      }

      momentum();
    }

    function endSnap() {
      // infinite, non-centered carousels when swiping from last item back to first can't switch early in moveTo() since no clones at front
      if (self.options.infinite && !self.options.center && self.itemIndex >= self.count) {
        translateX(getTranslateX() + allItemsWidth);
        self.itemIndex -= self.count;
      }
      shift = 0;
      self.flag.click = true;
      self.autoscrollStart();
      $container.attr("data-ur-state", "enabled");
      $container.triggerHandler("slideend", {index: self.itemIndex});
    }

    self.jumpToIndex = function(index) {
      moveTo(self.itemIndex - index);
    };

    // could be end.y - start.y if vertical option implemented
    function swipeDist(start, end) {
      return end.x - start.x;
    }

    function translateX(x) {
      self.translate = x;
      var css = translatePrefix + x + "px, 0px" + translateSuffix;
      $(self.scroller).css({webkitTransform: css, MozTransform: css, msTransform: css, transform: css});
    }

    function getTranslateX() {
      return self.translate;
    }

    // could possibly be $(item).outerWidth(true) if margins are allowed
    function width(item) {
      return item.offsetWidth;
    }

    // .offsetLeft/Top, could includ margin as "part" of the element with - parseInt($(item).css("marginLeft"))
    function offsetFront(item) {
      return item.offsetLeft;
    }

    // offset needed to center element, round since subpixel translation makes images blurry
    function centerOffset(item) {
      return Math.floor((viewport - width(item))/2);
    }

    readAttributes();

    // delay initialization until we can figure out number of clones
    var zeroWidth = false;
    if (self.options.infinite && !self.options.fill && self.options.cloneLength == 0) {
      $items.width(function(i, width) {
        if (width == 0)
          zeroWidth = true;
      });
    }
    if (zeroWidth) {
      // wait until (late-loaded) images are loaded or other content inserted
      console.warn("carousel with id: " + self.urId + " will be late loaded");
      var imgs = $items.find("img").addBack("img").filter(function() {
        return this.naturalWidth == 0 || this.width == 0;
      });
      var numImgs = imgs.length;
      if (numImgs > 0)
        imgs.on("load.ur.carousel", function() {
          if (--numImgs == 0)
            initialize();
        });
      else
        $(window).on("load.ur.carousel", initialize);
    }
    else
      initialize();

  }
};

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

})(jQuery);
