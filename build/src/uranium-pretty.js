// jQuery.Uranium.js
// Build out Uranium interactions in jQuery

(function ( $ ) {

  // Keep a unique value for ID initialization
  var uniqueUraniumId = function() {
    var count = 0;
    return function() { return ++count; }
  }();

  // Find elements for the interactions
  // optional customFn(set, component) for custom creation of object
  function findElements( fragment, type, customFn ) {
    var sets = {};
    var setCss = "[data-ur-set='" + type + "']";
    var compAttr = "data-ur-" + type + "-component";

    $(fragment).find("[" +compAttr +"]").each(function() {
      if ($(this).data("urCompInit"))
        return;
      var set = $(this).attr("data-ur-id") ? $(this) : $(this).closest(setCss);
      if (set[0] && !set.data("urInit")) {
        $(this).data("urCompInit", true);
        var setId = set.attr("data-ur-id");
        if (!setId) {
          setId = uniqueUraniumId();
          set.attr("data-ur-id", setId);
        }
        sets[setId] = sets[setId] || {};

        if (set.is(setCss))
          sets[setId].set = set[0];

        if (customFn)
          customFn(sets[setId], this);
        else {
          var compName = $(this).attr(compAttr);
          sets[setId][compName] = sets[setId][compName] || [];
          sets[setId][compName].push(this);
        }
      }
    });
    return sets;
  }

  var interactions = {};

  var touchscreen = "ontouchstart" in window;
  var downEvent = touchscreen ? "touchstart" : "mousedown";
  var moveEvent = touchscreen ? "touchmove" : "mousemove";
  var upEvent = touchscreen ? "touchend" : "mouseup";

  // Toggler
  interactions.toggler = function( fragment ) {
    var groups = findElements(fragment, "toggler");

    $.each(groups, function(id, group) {
      if (!group["button"])
        $.error("no button found for toggler with id=" + id);
      if (!group["content"])
        $.error("no content found for toggler with id=" + id);

      var togglerState = $(group["button"]).attr("data-ur-state") || "disabled";
      $(group["button"]).add(group["content"]).attr("data-ur-state", togglerState);

      $(group["button"]).click(function(event) {
        event.stopPropagation();
        var newState = $(group["button"]).attr("data-ur-state") == "enabled" ? "disabled" : "enabled";
        $(group["button"]).add(group["content"]).attr("data-ur-state", newState);
      });

      $(group["set"]).data("urInit", true);
    });
  }

  // Tabs
  interactions.tabs = function( fragment ) {
    var groups = findElements(fragment, "tabs", function(set, comp) {
      var tabId = $(comp).attr("data-ur-tab-id");
      set.tabs = set.tabs || {};
      set.tabs[tabId] = set.tabs[tabId] || {};
      var compName = $(comp).attr("data-ur-tabs-component");
      set.tabs[tabId][compName] = set.tabs[tabId][compName] || [];
      set.tabs[tabId][compName].push(comp);
    });

    $.each(groups, function(id, group) {
      group["closeable"] = $(group["set"]).attr("data-ur-closeable") == "true";

      // Set the state of the tabs
      $.each(group["tabs"], function() {
        var tabState = $(this["button"]).attr("data-ur-state") || "disabled";
        $(this["button"]).add(this["content"]).attr("data-ur-state", tabState);
      });

      // Set up the button call backs
      $.each(group["tabs"], function(_, tab) {
        $(tab["button"]).click(function() {
          // Is the tab open already?
          var open = $(this).attr("data-ur-state") == "enabled";
          $.each(group["tabs"], function() {
            $(this["button"]).add(this["content"]).attr("data-ur-state", "disabled");
          });
          // If closeable (active tab can be toggled) then make sure it happens.
          if (!open || !groups["closeable"]) {
            $(tab["button"]).add(tab["content"]).attr("data-ur-state", "enabled");
          }
        });
      });

      $(group["set"]).data("urInit", true);
    });
  }

  // Input Clear
  interactions.inputClear = function( fragment ) {
    var groups = findElements(fragment, "input-clear");
    $.each(groups, function(id, group) {
      // Create the X div and hide it (even though this should be in CSS)
      var ex = $("<div class='data-ur-input-clear-ex'></div>").hide();
      // Inject it
      $(group['set']).append(ex);

      // Touch Events
      ex
        .bind(touchscreen ? "touchstart" : "click", function() {
          // remove text in the box
          input[0].value='';
          input[0].focus();
        })
        .bind('touchend', function() {
          // make sure the keyboard doesn't disappear
          input[0].blur();
        });

      var input = $(group["set"]).find("input");
      input
        .bind('focus', function() {
          if (input[0].value != '') {
            ex.show();
          }
        })
        .bind('keydown', function() {
          ex.show();
        })
        .bind('blur', function() {
          // Delay the hide so that the button can be clicked
          setTimeout(function() { ex.hide();}, 150);
        });
      
      $(group["set"]).data("urInit", true);
    });
  }

  // Geocode
  interactions.geoCode = function ( fragment ) {
    var groups = findElements(fragment, "reverse-geocode", function(set, comp) {
      set["elements"] = set["elements"] || {};
      set["elements"][$(comp).attr("data-ur-reverse-geocode-component")] = comp;
    });

    $.each(groups, function(id, group) {
      var set = this['set'];

      var callback = $(set).attr("data-ur-callback");
      var errorCallback = $(set).attr("data-ur-error-callback");
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
        var btn = $(this["elements"]).filter("[data-ur-reverse-geocode-component='rg-button']")
        if (btn.length > 0) {
          $(btn).bind(
            'click',
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
        if(errorCallback !== undefined) {
          eval(errorCallback);
        }
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

              if(self.callback !== undefined) {
                eval(self.callback);
              }

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
  }

  // Zoom
  interactions.zoom = function ( fragment ) {
    var groups = findElements(fragment, "zoom");

    // Private shared variables

    var loadedImgs = []; // sometimes the load event doesn't fire when the image src has been previously loaded

    var no3d = /Android [12]|Opera/.test(navigator.userAgent);

    var noTranslate3d = no3d;
    var noScale3d = no3d;

    var translatePrefix = noTranslate3d ? "translate(" : "translate3d(";
    var translateSuffix = noTranslate3d ? ")" : ", 0)";

    var scalePrefix = noScale3d ? " scale(" : " scale3d(";
    var scaleSuffix = noScale3d ? ")" : ", 1)";


    // Private shared methods

    // note that this accepts a reversed range
    function bound(num, range) {
      return Math.max(Math.min(range[0], num), range[1]);
    }

    function stifle(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    $.each(groups, function(id, group) {
      Uranium.zoom[id] = new Zoom(this);
      $(group["set"]).data("urInit", true);
    });

    function Zoom(set) {
      var self = this;
      this.container = set["set"];
      this.img = set["img"][0];
      this.prescale = false;
      this.width = this.height = 0;
      this.bigWidth = this.bigHeight = 0;
      this.canvasWidth = this.canvasHeight = 0;
      this.ratio = 1;
      this.state = "disabled";

      // Optionally:
      this.button = set["button"];
      this.idler = set["loading"];

      var $img = $(this.img);
      var $idler = $(this.idler);
      var $btn = $(this.button);

      var boundX, boundY;
      var relX, relY;
      var offsetX = 0, offsetY = 0;
      var touchX = 0, touchY = 0;
      var mouseDown = false; // only used on non-touch browsers
      var mouseDrag = true;

      loadedImgs.push($img.attr("src"));

      function initialize() {
        self.canvasWidth = self.canvasWidth || self.container.offsetWidth;
        self.canvasHeight = self.canvasHeight || self.container.offsetHeight;
        self.width = self.width || parseInt($img.attr("width")) || parseInt($img.css("width")) || self.img.width;
        self.height = self.height || parseInt($img.attr("height")) || parseInt($img.css("height")) || self.img.height;

        self.bigWidth = parseInt($img.attr("data-ur-width")) || self.img.naturalWidth;
        self.bigHeight = parseInt($img.attr("data-ur-height")) || self.img.naturalHeight;
        if (($img.attr("data-ur-width") && $img.attr("data-ur-height")) || $img.attr("src") == $img.attr("data-ur-src"))
          self.prescale = true;

        self.ratio = self.bigWidth/self.width;

        boundX = (self.canvasWidth - self.bigWidth)/2;    // horizontal translation to view middle of image
        boundY = (self.canvasHeight - self.bigHeight)/2;  // vertical translation to view middle of image
      }

      function panStart(event) {
        if (event.target != self.img)
          return;
        mouseDrag = false;
        touchX = event.pageX;
        touchY = event.pageY;
        mouseDown = true;
        var touches = event.originalEvent.touches;
        if (touches) {
          touchX = touches[0].pageX;
          touchY = touches[0].pageY;
        }

        var style = self.img.style;
        if (window.WebKitCSSMatrix) {
          var matrix = new WebKitCSSMatrix(style.webkitTransform);
          offsetX = matrix.m41;
          offsetY = matrix.m42;
        }
        else {
          var transform = style.MozTransform || style.msTransform || style.transform || "translate(0, 0)";
          transform = transform.replace(/.*?\(|\)/, "").split(",");

          offsetX = parseInt(transform[0]);
          offsetY = parseInt(transform[1]);
        }

        stifle(event);
      }

      function panMove(event) {
        if (!mouseDown || event.target != self.img) // NOTE: mouseDown should always be true on touch-enabled devices
          return;

        stifle(event);
        var x = event.pageX;
        var y = event.pageY;
        var touches = event.originalEvent.touches;
        if (touches) {
          x = touches[0].pageX;
          y = touches[0].pageY;
        }
        var dx = x - touchX;
        var dy = y - touchY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
          mouseDrag = true;
        var newOffsetX = bound(offsetX + dx, [-boundX, boundX]);
        var newOffsetY = bound(offsetY + dy, [-boundY, boundY]);
        transform(newOffsetX, newOffsetY, self.ratio);
      }

      function panEnd(event) {
        if (!mouseDrag)
          self.zoomOut();
        stifle(event);
        mouseDown = false;
        mouseDrag = true;
      }

      function transitionEnd() {
        if (self.state == "enabled-in") {
          $img.css({ webkitTransitionDelay: "", MozTransitionDelay: "", OTransitionDelay: "", transitionDelay: "" });

          self.img.src = $img.attr("data-ur-src");
          if (loadedImgs.indexOf(self.img.getAttribute("data-ur-src")) == -1) {
            setTimeout(function() {
              if (loadedImgs.indexOf(self.img.getAttribute("data-ur-src")) == -1)
                $idler.attr("data-ur-state", "enabled");
            }, 16);
          }
          self.state = "enabled";
          self.container.setAttribute("data-ur-state", self.state);

          $(self.container)
            .on(downEvent, panStart)
            .on(moveEvent, panMove)
            .on(upEvent, panEnd);
        }
        else if (self.state == "enabled-out") {
          self.state = "disabled";
          self.container.setAttribute("data-ur-state", self.state);

          $(self.container)
            .unbind(downEvent, panStart)
            .unbind(moveEvent, panMove)
            .unbind(upEvent, panEnd);
        }
      }

      function zoomHelper(x, y) {
        $btn.attr("data-ur-state", "enabled");
        self.state = "enabled-in";
        self.container.setAttribute("data-ur-state", self.state);

        x = x ? x : 0;
        y = y ? y : 0;
        transform(x, y, self.ratio);
      }

      function transform(x, y, scale) {
        var t = "";
        if (x != undefined)
          t = translatePrefix + x + "px, " + y + "px" + translateSuffix;
        if (scale != undefined) {
          if (noScale3d)
            t += " scale(" + scale + ")";
          else
            t += " scale3d(" + scale + ", " + scale + ", 1)";
        }
        return $img.css({ webkitTransform: t, MozTransform: t, msTransform: t, transform: t });
      }

      // attempts to zoom in centering in on the area that was touched
      this.zoomIn = function(event) {
        if (self.state != "disabled")
          return;

        if (!self.width) {
          initialize();
          self.img.style.width = self.width + "px";
          self.img.style.height = self.height + "px";
        }

        var x = event.pageX, y = event.pageY;
        if (event.touches) {
          x = event.touches[0].pageX;
          y = event.touches[0].pageY;
        }

        // find touch location relative to image
        relX = event.offsetX;
        relY = event.offsetY;
        if (relX == undefined || relY == undefined) {
          var offset = self.img.getBoundingClientRect();
          relX = x - offset.left;
          relY = y - offset.top;
        }

        if (!self.prescale) {
          self.state = "enabled-in";
          self.img.src = $img.attr("data-ur-src");
          setTimeout(function() {
            if (!self.prescale)
              $idler.attr("data-ur-state", "enabled");
          }, 0);
        }
        else {
          var translateX = bound(self.bigWidth/2 - self.ratio * relX, [-boundX, boundX]);
          var translateY = bound(self.bigHeight/2 - self.ratio * relY, [-boundY, boundY]);
          zoomHelper(translateX, translateY);
        }
      };

      this.zoomOut = function() {
        if (self.state != "enabled")
          return;
        $btn.attr("data-ur-state", "disabled");
        self.state = "enabled-out";
        self.container.setAttribute("data-ur-state", self.state);
        transform(0, 0, 1);
      };

      if (self.container.getAttribute("data-ur-touch") != "disabled")
        $(self.container).click(self.zoomIn);

      $img.load(function() {
        if ($img.attr("src") == $img.attr("data-ur-src"))
          loadedImgs.push($img.attr("src"));
        $idler.attr("data-ur-state", "disabled");
        if (!self.prescale && self.state == "enabled-in") {
          self.prescale = true;
          initialize();
          var translateX = bound(self.bigWidth/2 - self.ratio * relX, [-boundX, boundX]);
          var translateY = bound(self.bigHeight/2 - self.ratio * relY, [-boundY, boundY]);

          var delay = "0.3s";
          $img.css({ webkitTransitionDelay: delay, MozTransitionDelay: delay, OTransitionDelay: delay, transitionDelay: delay });

          zoomHelper(translateX, translateY);
        }
      });

      // zooms in to the center of the image
      this.zoom = function() {
        if (self.state == "disabled") {
          if (!self.width) {
            initialize();
            self.img.style.width = self.width + "px";
            self.img.style.height = self.height + "px";
          }

          if (self.prescale)
            zoomHelper(0, 0);
          else {
            self.state = "enabled-in";
            self.img.src = $img.attr("data-ur-src");
            setTimeout(function() {
              // if prescale ?
              if (loadedImgs.indexOf(self.img.getAttribute("data-ur-src")) == -1)
                $idler.attr("data-ur-state", "enabled");
            }, 0);
          }
        }
        else
          self.zoomOut();
      };

      // zoom in/out button, zooms in to the center of the image
      $(self.button).on(touchscreen ? "touchstart" : "click", self.zoom);

      $.each(["webkitTransitionEnd", "transitionend", "oTransitionEnd"], function(index, eventName) {
        $img.on(eventName, transitionEnd);
      });

      this.reset = function() {
        self.prescale = false;
        self.width = self.height = 0;
        $img.css({width: "", height: ""});
        transform();
        self.state = "enabled-out";
        transitionEnd();
        $idler.attr("data-ur-state", "disabled");
        $btn.attr("data-ur-state", "disabled");
      };
    }
  }

  // Carousel
  interactions.carousel = function ( fragment ) {
    var groups = findElements(fragment, "carousel");

    // for each carousel
    $.each(groups, function(id, group) {
      $(group["buttons"]).each(function() {
        var type = $(this).attr("data-ur-carousel-button-type");
        if(!type) {
          $.error("malformed carousel button type for carousel with id: " + id + ".");
        }
        $(this).attr("data-ur-state", type == "prev" ? "disabled" : "enabled");
      });
      Uranium.carousel[id] = new Carousel(group);
      $(group["set"]).data("urInit", true);
      $(group["set"]).attr("data-ur-state", "enabled"); // should be data-ur-init or fire event
    });

    // private methods
    
    function zeroFloor(num) {
      return num >= 0 ? Math.floor(num) : Math.ceil(num);
    }
    
    function stifle(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    function Carousel(set) {
      var self = this;
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
        click: false,           // used for determining if item is clicked on touchscreens
        snapping: false,        // true if carousel is currently snapping, flag for users' convenience
        lock: null,             // used for determining horizontal/vertical dragging motion on touchscreens
        touched: false          // true when user is currently touching/dragging
      };

      self.options = {
        autoscroll: false,
        autoscrollDelay: 5000,
        autoscrollForward: true,
        center: false,          // position active item in the middle of the carousel
        cloneLength: 0,         // number of clones at back of carousel (or front and back for centered carousels)
        fill: 0,                // exactly how many items forced to fit in the viewport, 0 means disabled
        infinite: true,         // loops the last item back to first and vice versa
        speed: 1.1,             // determines how "fast" carousel snaps, should probably be deprecated
        translate3d: true,      // determines if translate3d() or translate() is used
        touch: true,            // determines if carousel can be dragged e.g. when user only wants buttons to be used
        verticalScroll: true    // determines if dragging carousel vertically scrolls the page on touchscreens, this is almost always true
      };

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

      var viewport = $container.outerWidth();

      var startingOffset = null;

      var translatePrefix = "translate3d(", translateSuffix = ", 0px)";

      function initialize() {
        self.options.translate3d = self.options.translate3d && test3d();
        if (!self.options.translate3d) {
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
        updateIndex(self.options.center ? self.itemIndex + self.options.cloneLength : self.itemIndex);
        updateDots();
        self.update();

        $(self.scroller).on("dragstart", function() { return false; }); // for Firefox

        if (self.options.touch) {
          $(self.scroller)
            .on(downEvent, startSwipe)
            .on(moveEvent, continueSwipe)
            .on(upEvent, finishSwipe)
            .click(function(e) {if (!self.flag.click) stifle(e);});
        }

        self.button.prev.click(function() {
          moveTo(1);
        });
        self.button.next.click(function() {
          moveTo(-1);
        });

        if ("onorientationchange" in window)
          $(window).on("orientationchange", self.update);
        else
          $(window).on("resize", function() {
            if (viewport != $container.outerWidth()) {
              self.update();
              setTimeout(self.update, 100); // sometimes styles haven't updated yet
            }
          });

        $items.find("img").addBack("img").load(self.update); // after any (late-loaded) images are loaded

        self.autoscrollStart();

      }

      function readAttributes() {
        var oldAndroid = /Android [12]/.test(navigator.userAgent);
        if (oldAndroid) {
          if (($container.attr("data-ur-android3d") || $container.attr("data-ur-translate3d")) != "enabled") {
            self.options.translate3d = false;
            var speed = parseFloat($container.attr("data-ur-speed"));
            self.options.speed = speed > 1 ? speed : 1.3;
          }
        }
        else
          self.options.translate3d = $container.attr("data-ur-translate3d") != "disabled";
        $container.attr("data-ur-translate3d", self.options.translate3d ? "enabled" : "disabled");

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

        self.options.autoscrollForward = $container.attr("data-ur-autoscroll-dir") != "prev";
        $container.attr("data-ur-autoscroll-dir", self.options.autoscrollForward ? "next" : "prev");

        // read boolean attributes
        $.each(["autoscroll", "center", "infinite", "touch", "verticalScroll"], function(_, name) {
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
            self.options.cloneLength = self.options.center ? self.options.fill - 1 : self.options.fill;
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
              var newdot = dot.clone().attr("data-ur-state", i == self.itemIndex ? "active" : "inactive");
              storage.appendChild(newdot[0]);
            }
            $(self.dots).append(storage);
          }
        }
      }

      self.update = function() {
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
          if (!$.contains(self.scroller, dest))
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
            item.outerWidth(length); // could add true param if margins allowed
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
        $(self.counter).html(realIndex + 1 + " of " + self.count);

        $items.attr("data-ur-state", "inactive");
        $items.eq(self.itemIndex).attr("data-ur-state", "active");

        $(self.dots).find("[data-ur-carousel-component='dot']").attr("data-ur-state", "inactive").eq(realIndex).attr("data-ur-state", "active");

        updateButtons();
      }

      function startSwipe(e) {
        if (!self.options.verticalScroll)
          stifle(e);
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

        if (touchscreen && self.options.verticalScroll) {
          var slope = Math.abs((startCoords.y - coords.y)/(startCoords.x - coords.x));
          if (self.flag.lock) {
            if (self.flag.lock == "y")
              return;
          }
          else if (slope > 1.2) {
            self.flag.lock = "y";
            return;
          }
          else if (slope <= 1.2)
            self.flag.lock = "x";
          else
            return;
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

        var dir = coords.x - prevCoords.x;
        if (self.options.center) {
          if (dir < 0 && shift > 0)
            moveTo(-1)
          else if (dir > 0 && shift < 0)
            moveTo(1);
          else
            moveTo(0);
        }
        else
          moveTo(dir < 0 ? -1: 0);
      }

      function moveTo(direction) {
        self.autoscrollStop();

        // in case prev/next buttons are being spammed
        clearTimeout(momentumId);

        var newIndex = self.itemIndex - direction;
        if (!self.options.infinite) {
          if (self.options.fill > 0)
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
        $container.trigger("slidestart.ur.carousel", {index: newIndex});

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
        self.autoscrollStart();
        $container.trigger("slideend.ur.carousel", {index: self.itemIndex});
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

      function getEventCoords(event) {
        var touches = event.originalEvent.touches;
        event = (touches && touches[0]) || event;
        return {x: event.clientX, y: event.clientY};
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

      function bound(num, range) {
        return Math.min(Math.max(range[0], num), range[1]);
      }

      function test3d() {
        var css3d = "translate3d(0, 0, 0)";
        var test = $("<a>").css({webkitTransform: css3d, MozTransform: css3d, msTransform: css3d, transform: css3d});
        var wt = test.css("webkitTransform");
        var mt = test.css("MozTransform");
        var it = test.css("msTransform");
        var t = test.css("transform");
        return (wt + mt + it + t).indexOf("(") != -1;
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
        var imgs = $items.find("img").addBack("img");
        var numImgs = imgs.length;
        if (numImgs > 0)
          imgs.load(function() {
            if (--numImgs == 0)
              initialize();
          });
        else
          $(window).load(initialize);
      }
      else
        initialize();

    }
  }

  window.Uranium = {};
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

  $(document).ready(function() {
    $("body").Uranium();
  });
})(jQuery);
