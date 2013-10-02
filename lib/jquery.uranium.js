// jQuery.Uranium.js
// Build out Uranium widgets in jQuery

(function ( $ ) {

  // Keep a unique value for ID initialization
  var urGuid = function() {
    var count = 0;
    return function() { return ++count; }
  }();

  // Find elements for the widgets
  // optional customFn(set, component) for custom creating widget object
  function findElements( fragment, type, customFn ) {
    var sets = {};
    var setCss = "[data-ur-set='" + type + "']";
    var compAttr = "data-ur-" + type + "-component";

    $(fragment).find("[" +compAttr +"]").each(function() {
      if ($(this).data("urInit"))
        return false;
      var set = $(this).attr("data-ur-id") ? $(this) : $(this).closest(setCss);

      if (set[0]) {
        $(this).data("urInit", true);
        var setId = set.attr("data-ur-id");
        if (!setId) {
          setId = urGuid();
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

  var widgets = {};

  // Toggler
  widgets.toggler = function( fragment ) {
    var groups = findElements(fragment, "toggler");

    $.each(groups, function(id, group) {
      if (!group["button"])
        $.error("no button found for toggler with id=" + id);
      if (!group["content"])
        $.error("no content found for toggler with id=" + id);

      var toggler_state = $(group["button"]).attr("data-ur-state") || "disabled";
      $(group["button"]).add(group["content"]).attr("data-ur-state", toggler_state);

      $(group["button"]).click(function(event) {
        event.stopPropagation();
        var new_state = $(group["button"]).attr("data-ur-state") == "enabled" ? "disabled" : "enabled";
        $(group["button"]).add(group["content"]).attr("data-ur-state", new_state);
      });
    });
  }

  // Tabs
  widgets.tabs = function( fragment ) {
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
    });
  }

  // Input Clear
  widgets.inputClear = function( fragment ) {
    var groups = findElements(fragment, "input-clear");
    $.each(groups, function(id, group) {
      // Create the X div and hide it (even though this should be in CSS)
      var ex = $("<div class='data-ur-input-clear-ex'></div>").hide();
      // Inject it
      $(group['set']).append(ex);

      // Touch Events
      ex
        .bind("ontouchstart" in window ? "touchstart" : "click", function() {
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
    });
  }

  // Geocode
  widgets.geoCode = function ( fragment ) {
    var groups = findElements(fragment, "reverse-geocode", function(set, comp) {
      set["elements"] = set["elements"] || {};
      set["elements"][$(comp).attr("data-ur-reverse-geocode-component")] = comp;
    });

    $.each(groups, function() {
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

      this.setup_callbacks = function () {
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

      UrGeocode = function( obj ){
          return function(){
            obj.setup_callbacks();
          };
        }(this);
      var s = document.createElement('script');
      s.type = "text/javascript";
      s.src = "https://maps.googleapis.com/maps/api/js?sensor=true&callback=UrGeocode";
      $('head').append(s);
    });
  }

  // Zoom
  widgets.zoom = function ( fragment ) {
    var groups = findElements(fragment, "zoom");

    // Private shared variables

    var loaded_imgs = []; // sometimes the load event doesn't fire when the image src has been previously loaded

    var no3d = /Android [12]|Opera/.test(navigator.userAgent);

    var noTranslate3d = no3d;
    var noScale3d = no3d;

    var translatePrefix = noTranslate3d ? "translate(" : "translate3d(";
    var translateSuffix = noTranslate3d ? ")" : ", 0)";

    var scalePrefix = noScale3d ? " scale(" : " scale3d(";
    var scaleSuffix = noScale3d ? ")" : ", 1)";


    // Private shared methods

    function bound(num, range) {
      return Math.max(Math.min(range[0], num), range[1]);
    }

    function stifle(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    $.each(groups, function() {
      this["zoom_object"] = new Zoom(this);
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

      loaded_imgs.push($img.attr("src"));

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
        var new_offsetX = bound(offsetX + dx, [-boundX, boundX]);
        var new_offsetY = bound(offsetY + dy, [-boundY, boundY]);
        transform(new_offsetX, new_offsetY, self.ratio);
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
          if (loaded_imgs.indexOf(self.img.getAttribute("data-ur-src")) == -1) {
            setTimeout(function() {
              if (loaded_imgs.indexOf(self.img.getAttribute("data-ur-src")) == -1)
                $idler.attr("data-ur-state", "enabled");
            }, 16);
          }
          self.state = "enabled";
          self.container.setAttribute("data-ur-state", self.state);

          var touch = "ontouchstart" in window;
          var $container = $(self.container);
          $container.on(touch ? "touchstart" : "mousedown", panStart);
          $container.on(touch ? "touchmove" : "mousemove", panMove);
          $container.on(touch ? "touchend" : "mouseup", panEnd);
        }
        else if (self.state == "enabled-out") {
          self.state = "disabled";
          self.container.setAttribute("data-ur-state", self.state);

          var touch = "ontouchstart" in window;
          var $container = $(self.container);
          $container.unbind(touch ? "touchstart" : "mousedown", panStart);
          $container.unbind(touch ? "touchmove" : "mousemove", panMove);
          $container.unbind(touch ? "touchend" : "mouseup", panEnd);
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
          loaded_imgs.push($img.attr("src"));
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
              if (loaded_imgs.indexOf(self.img.getAttribute("data-ur-src")) == -1)
                $idler.attr("data-ur-state", "enabled");
            }, 0);
          }
        }
        else
          self.zoomOut();
      };

      // zoom in/out button, zooms in to the center of the image
      $(self.button).click(self.zoom);

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
  widgets.carousel = function ( fragment ) {
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
      
      self.items = set["item"];

      // Optionally:
      self.button = {
        prev: $(set["button"]).filter("[data-ur-carousel-button-type='prev']"),
        next: $(set["button"]).filter("[data-ur-carousel-button-type='next']")
      };
      self.counter = set["count"];
      self.dots = set["dots"];

      self.flag = {
        click: false,
        snapping: false,
        loop: false,
        lock: null,
        timeoutId: null,
        touched: false
      };

      self.options = {
        autoscroll: true,
        autoscrollDelay: 5000,
        autoscrollForward: true,
        center: true,
        cloneLength: 1,
        fill: 0,
        infinite: true,
        speed: 1.1,
        transform3d: true,
        touch: true,
        verticalScroll: true
      };

      self.count = self.items.length; // count of items (not including clones)
      self.itemIndex = 0; // index of active item (including clones)
      self.translate = 0;
      
      var $container = $(self.container);
      var $items = $(self.items); // all carousel items (including clones)
      var coords = null;
      var lastCoords; // stores previous coords, used for determining swipe direction
      var startPos = {x: 0, y: 0}, endPos = {x: 0, y: 0};
      var shift = 0; // in range [0, 1) showing translate percentage past top/left side of active item
      var dest = $items[0]; // snap destination element
      var destinationOffset; // translate value of destination
      var lastIndex = self.count - 1; // index of last item

      var viewport = 0;

      var startingOffset = null;

      var translatePrefix = "translate3d(", translateSuffix = ", 0px)";

      function test3d() {
        var css3d = "translate3d(0, 0, 0)";
        var test = $("<a>").css({webkitTransform: css3d, MozTransform: css3d, msTransform: css3d, transform: css3d});
        var wt = test.css("webkitTransform");
        var mt = test.css("MozTransform");
        var it = test.css("msTransform");
        var t = test.css("transform");
        return (wt != "none" && wt) ||
               (mt != "none" && mt) ||
               (it != "none" && it) ||
               (t != "none" && t);
      }

      function initialize() {
        readAttributes();

        self.options.transform3d = self.options.transform3d && test3d();
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
        updateIndex(self.itemIndex);
        self.update();

        $(self.scroller).on("dragstart", function() { return false; }); // for Firefox

        if (self.options.touch) {
          var hasTouch = "ontouchstart" in window;
          var start = hasTouch ? "touchstart" : "mousedown";
          var move = hasTouch ? "touchmove" : "mousemove";
          var end = hasTouch ? "touchend" : "mouseup";

          $(self.scroller).on(start, startSwipe).on(move, continueSwipe).on(end, finishSwipe);
          $(self.scroller).click(function(e) {if (!self.flag.click) stifle(e);});
        }

        self.button.prev.click(function(){moveTo(1);});
        self.button.next.click(function(){moveTo(-1);});

        $(window).on("orientationchange", self.update);
        // orientationchange isn't supported on some androids
        $(window).on("resize", function() {
          self.update();
          setTimeout(self.update, 100);
        });
        
        // after any images and late-loaded images are loaded
        $(window).load(function() {
          self.update();
          $items.find("img").addBack("img").load(self.update);
        });

        self.autoscrollStart();

      }

      function readAttributes() {
        var oldAndroid = /Android [12]/.test(navigator.userAgent);
        var ios6Device = /iP(hone|od) OS 6/.test(navigator.userAgent);
        if ((oldAndroid && $container.attr("data-ur-android3d") != "enabled") || ios6Device ) {
          self.options.transform3d = false;
          var speed = parseFloat($container.attr("data-ur-speed"));
          self.options.speed = speed > 1 ? speed : 1.3;
        }

        $container.attr("data-ur-speed", self.options.speed);
        self.options.verticalScroll = $container.attr("data-ur-vertical-scroll") != "disabled";
        $container.attr("data-ur-vertical-scroll", self.options.verticalScroll ? "enabled" : "disabled");

        self.options.touch = $container.attr("data-ur-touch") != "disabled";
        $container.attr("data-ur-touch", self.options.touch ? "enabled" : "disabled");

        self.options.infinite = $container.attr("data-ur-infinite") != "disabled" && self.items.length > 1;
        $container.attr("data-ur-infinite", self.options.infinite ? "enabled" : "disabled");

        self.options.center = $container.attr("data-ur-center") == "enabled";
        $container.attr("data-ur-center", self.options.center ? "enabled" : "disabled");

        var fill = parseInt($container.attr("data-ur-fill"));
        if (fill > 0)
          self.options.fill = fill;
        $container.attr("data-ur-fill", self.options.fill);

        var cloneLength = parseInt($container.attr("data-ur-clones"));
        if (!isNaN(cloneLength))
          self.options.cloneLength = cloneLength;
        $container.attr("data-ur-clones", self.options.cloneLength);

        self.options.autoscroll = $container.attr("data-ur-autoscroll") == "enabled";
        $container.attr("data-ur-autoscroll", self.options.autoscroll ? "enabled" : "disabled");

        var autoscrollDelay = parseInt($container.attr("data-ur-autoscroll-delay"));
        if (autoscrollDelay >= 0)
          self.options.autoscrollDelay = autoscrollDelay;
        $container.attr("data-ur-autoscroll-delay", self.options.autoscrollDelay);

        self.options.autoscrollForward = $container.attr("data-ur-autoscroll-dir") != "prev";
        $container.attr("data-ur-autoscroll-dir", self.options.autoscrollForward ? "next" : "prev");
      }

      function insertClones() {
        if (!self.options.infinite) {
          self.options.cloneLength = 0;
          return;
        }

        if (self.options.cloneLength < self.options.fill)
          self.options.cloneLength = Math.max(1, self.options.fill);
        else {
          // make sure to insert enough clones in order to never see a blank space
          var space = $container.width();
          var cloneLength1 = 0, cloneLength2 = 0;
          var i = 0;
          while (space > 0) {
            space -= $items.eq(i).outerWidth(true);
            cloneLength1++;
            if (space <= 0)
              break;
            i = (i + 1) % $items.length;
          }

          space = $container.width();
          i = $items.length - 1;
          while (space > 0) {
            space -= $items.eq(i).outerWidth(true);
            cloneLength2++;
            if (space <= 0)
              break;
            i--;
            if (i == -1)
              i = $items.length - 1;
          }
          
          self.options.cloneLength = Math.max(cloneLength1, cloneLength2);
        }
        
        $container.attr("data-ur-clones", self.options.cloneLength);
        
        for (var i = 0; i < self.options.cloneLength; i++) {
          var clone = $items.eq(i % $items.length).clone(true).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          $items.parent().append(clone);
        }
        
        var j = $items.length;
        for (var i = 0; i < self.options.cloneLength; i++) {
          if (--j == -1)
            j = $items.length - 1;
          var clone = $items.eq(j).clone(true).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          $items.parent().prepend(clone);
        }
        
        lastIndex = $items.length - 1;
      }

      function updateDots() {
        if (self.dots) {
          var existing = $(self.dots).find("[data-ur-carousel-component='dot']");
          if (existing.length != self.count) {
            existing.remove();
            var dot = $("<div data-ur-carousel-component='dot'>");
            var realItemIndex = self.itemIndex - self.options.cloneLength;
            var storage = document.createDocumentFragment();
            for (var i = 0; i < self.count; i++) {
              var newdot = dot.clone().attr("data-ur-state", i == realItemIndex ? "active" : "inactive");
              storage.appendChild(newdot[0]);
            }
            self.dots.appendChild(storage);
          }
        }
      }

      this.update = function() {
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
           if (self.itemIndex >= $items.length) {
            self.itemIndex = lastIndex;
            $items.eq(self.itemIndex).attr("data-ur-state", "active");
          }

          // in the rare case the destination element was (re)moved
          if (!$.contains(self.scroller, dest))
            dest = $items[self.itemIndex];

          updateDots();
        }

        viewport = $container.width();
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

        for (var i = 0; i < $items.length; i++) {
          if (self.options.fill > 0) {
            var length = divisions[i % self.options.fill];
            $items.eq(i).width(length);
            totalWidth += length;
          }
          else {
            totalWidth += $items[i].offsetWidth;
          }
        }

        $(self.scroller).width(totalWidth);

        var currentItem = $items[self.itemIndex];
        var itemWidth = $(currentItem).outerWidth(true);
        var updatedOffset = -(currentItem.offsetLeft + shift * itemWidth);
        destinationOffset = -dest.offsetLeft;
        if (self.options.center) {
          updatedOffset += centerOffset(currentItem);
          destinationOffset += centerOffset(dest);
        }
        translateX(updatedOffset);
      };


      this.autoscrollStart = function() {
        if (!self.options.autoscroll)
          return;

          self.flag.timeoutId = setTimeout(function() {
          if (self.container.offsetWidth != 0) {
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

      this.autoscrollStop = function() {
        clearTimeout(self.flag.timeoutId);
      };

      function getEventCoords(event) {
        var touches = event.originalEvent.touches;
        // event = (touches && touches[0]) || event; return {x: event.clientX, y: event.clientY};
        if (touches && touches.length > 0)
          return {x: touches[0].clientX, y: touches[0].clientY};
        else
          return {x: event.clientX, y: event.clientY};
      }

      function updateButtons() {
        if(!self.options.infinite) {
          $(self.button["prev"]).attr("data-ur-state", self.itemIndex == 0 ? "disabled" : "enabled");
          $(self.button["next"]).attr("data-ur-state", self.itemIndex == self.count - Math.max(self.options.fill, 1) ? "disabled" : "enabled");
        }
        else {
          $(self.button["prev"]).attr("data-ur-state", "enabled");
          $(self.button["next"]).attr("data-ur-state", "enabled");
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
        if (self.options.infinite)
          realIndex = (self.count + self.itemIndex - self.options.cloneLength) % self.count;
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
        self.flag.loop = false;
        self.flag.click = true;

        coords = getEventCoords(e);
        
        startPos = endPos = lastCoords = coords;
        startingOffset = getTranslateX();
      }

      function continueSwipe(e) {
        if (!self.flag.touched) // For non-touch environments since mousemove fires without mousedown
          return;

        lastCoords = coords;
        coords = getEventCoords(e);

        if (Math.abs(startPos.y - coords.y) + Math.abs(startPos.x - coords.x) > 0)
          self.flag.click = false;

        if ("ontouchstart" in window && self.options.verticalScroll) {
          var slope = Math.abs((startPos.y - coords.y)/(startPos.x - coords.x));
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
          endPos = coords;
          var dist = startingOffset + swipeDist(); // new translate() value, usually negative
          
          $items.each(function(i, item) {
            var boundStart = item.offsetLeft;
            if (self.options.center)
              boundStart -= (self.container.offsetWidth - item.offsetWidth)/2;
            var boundEnd = boundStart + item.offsetWidth;
            if (boundEnd > -dist) {
              self.itemIndex = i;
              shift = -(boundStart + dist)/item.offsetWidth;
              
              return false;
            }
          });

          if (self.options.infinite) {
            var endLimit = $items[lastIndex].offsetLeft + $items[lastIndex].offsetWidth - self.container.offsetWidth;

            if (dist > 0) { // at the start of carousel so loop to end
              var srcNode = $items[self.count]; // original version of clone at start
              var offset = srcNode.offsetLeft - $items[0].offsetLeft;
              startingOffset -= offset;
              dist -= offset;
              self.flag.loop = !self.flag.loop;
            }
            else if (endLimit < -dist) { // at the end of carousel so loop to start
              var srcNode = $items[lastIndex - self.count]; // original version of clone at end
              var offset = srcNode.offsetLeft - $items[lastIndex].offsetLeft;
              startingOffset -= offset;
              dist -= offset;
              self.flag.loop = !self.flag.loop;
            }
          }
          translateX(dist);
        }

      }

      function finishSwipe(e) {
        if (!self.flag.click || self.flag.lock)
          stifle(e);
        else if (e.target.tagName == "AREA")
          location.href = e.target.href;

        self.flag.touched = false;

        self.flag.forwardDir = coords.x - lastCoords.x < 0;
        moveHelper(self.flag.forwardDir ? -1: 0);
      }

      function moveHelper(direction) {
        self.autoscrollStop();

        var newIndex = self.itemIndex - direction;
        newIndex = Math.max(Math.min(lastIndex, newIndex), 0);
        
        // when snapping to clone, prepare to snap back to original element
        if (self.options.infinite) {
          var oldTransform = getTranslateX();
          // -1 * length of all original items (except clones)
          var offset = $items[self.options.cloneLength].offsetLeft - $items[self.count + self.options.cloneLength].offsetLeft;
          
          if (newIndex < self.options.cloneLength) { // clone at start of carousel
            translateX(oldTransform + offset);
            newIndex += self.count;
            self.itemIndex = newIndex + direction;
          }
          else if (newIndex >= self.count + self.options.cloneLength) { // clone at end of carousel
            translateX(oldTransform - offset);
            newIndex -= self.count;
            self.itemIndex = newIndex + direction;
          }
        }
        
        dest = $items[newIndex];
        $container.trigger("slidestart", {index: newIndex});

        setTimeout(function() {
          snapTo();
          updateIndex(newIndex);
        }, 0);
      }

      function snapTo() {
        destinationOffset = -dest.offsetLeft;
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
            setTimeout(momentum, 16);
          else
            endSnap();
        }

        momentum();
      }

      function endSnap() {
        self.autoscrollStart();
        $container.trigger("slideend", {index: self.itemIndex});
      }

      // used for non-manual swiping
      function moveTo(direction) {
        // animation isn't done yet
        if (self.flag.snapping)
          return;

        moveHelper(direction);
      }

      this.jumpToIndex = function(index) {
        moveTo(self.itemIndex - index);
      };

      function swipeDist() {
        return endPos === undefined ? 0 : endPos.x - startPos.x;
      }

      function translateX(x) {
        self.translate = x;
        var css = translatePrefix + x + "px, 0px" + translateSuffix;
        $(self.scroller).css({webkitTransform: css, MozTransform: css, msTransform: css, transform: css});
      }

      function getTranslateX() {
        return self.translate;
      }
      
      // offset needed to center element
      function centerOffset(item) {
        return Math.floor(($container.width() - $(item).outerWidth(true))/2);
      }

      initialize();
     }

  }

  Uranium = {};
  $.each(widgets, function(name) {
    Uranium[name] = {};
  });

  $.fn.Uranium = function() {
    var jqObj = this;
    $.each(widgets, function() {
      this(jqObj);
    });
    return this;
  };

  $(document).ready(function() {
    $("body").Uranium();
  });
})(jQuery);
