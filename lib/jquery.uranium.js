// jQuery.Uranium.js
// Build out Uranium widgets in jQuery

(function ( $ ) {

  // helper function for log
  // TODO: Remove
  var log = function (msg) {
    return console.log(msg);
  }

  // Keep a unique value for ID initialization
  var get_unique_uranium_id = function() {
    var count = 0;
    return function get_id() {
      count += 1;
      return count;
    }
  }();

  // Find elements for the widgets
  var findElements = function(fragment, type) {
    // log("findElements");
    var groups = {};
    // log(groups);
    var set_elements = $(fragment).find("*[data-ur-set='" + type + "']");
    set_elements.each(function( index ) {
      // log("set_elements");
      // log(this);
      // log(index);
      var my_set_id = $(this).attr('data-ur-id');
      // log(my_set_id);

      if ( my_set_id === undefined ) {
        // No explict ID set
        // log($(this).find("*[data-ur-" + type + "-component]"));
        my_set_id = get_unique_uranium_id();
      }

      $(this).attr('data-ur-id', my_set_id);
      groups[my_set_id] = {};
      groups[my_set_id]["set"] = this;
      groups[my_set_id][type + "_id"] = my_set_id;
    });
    if ( !jQuery.isEmptyObject(groups) ) {
      return groups;
    } else {
      return false;
    }
  }

  var findComponents = function( element, component ) {
    // log("findComponents");
    var components = $(element).find("*[data-ur-" + component + "-component]");
    return components;
  }

  // Toggler
  var toggler = function( fragment ) {

    log("Toggler");
    var groups = findElements( fragment, "toggler" );

    if ( groups !== false ) {
      for (group in groups) {
        var tglr = groups[group];
        var components = findComponents(tglr["set"], "toggler");

        components.each(function() {
          groups[group][$(this).attr("data-ur-" + "toggler" + "-component")] = this;
        });

        if (tglr["button"] === undefined) {
          $.error("no button found for toggler with id=" + tglr["toggler_id"]);
          continue;
        }

        var toggler_state = $(tglr["button"]).attr("data-ur-state");
        if(toggler_state === undefined) {
          $(tglr["button"]).attr("data-ur-state", 'disabled');
          toggler_state = "disabled";
        }

        if (tglr["content"] === undefined) {
          $.error("no content found for toggler with id=" + tglr["toggler_id"]);
          continue;
        }

        // Make the content state match the button state
        if ($(tglr["content"]).attr("data-ur-state") === undefined ) {
          $(tglr["content"]).attr("data-ur-state", toggler_state)
        }

      }

      $.each(groups, function() {
        var self = this;
        $(self["button"]).click(function() {
          var new_state = $(self["button"]).attr('data-ur-state') === "enabled" ? "disabled" : "enabled";
          $(self["button"]).attr('data-ur-state', new_state);
          $(self["content"]).attr("data-ur-state", new_state);
        });
      });
    }
  }

  // Tabs
  var tabs = function( fragment ) {

    log("Tabs");
    var groups = findElements(fragment, "tabs");

    if ( groups !== false ) {
      for (var group in groups ) {
        var tab_set = groups[group];

        var closeable = $(tab_set["set"]).attr("data-ur-closeable") === "true";
        tab_set["closeable"] = closeable;

        tab_set["tabs"] = {};
        var allTabs = tab_set["tabs"];

        var components = findComponents(tab_set["set"], "tabs");

        var set_id = tab_set["tabs_id"];
        components.each(function() {
            var tabId = $(this).attr("data-ur-" + "tab" + "-id");
            if (allTabs[tabId] === undefined) {
              allTabs[tabId] = {};
            }
            allTabs[tabId][$(this).attr("data-ur-tabs-component")] = this;
            allTabs[tabId]["tabs_id"]=set_id;
        });

        for ( singleTab in allTabs ) {
          var currentTab = allTabs[singleTab];

          // Set the state of the tabs
          var tabState = $(currentTab["button"]).attr("data-ur-state");
          if ( tabState === undefined ) {
            tabState = "disabled"
            $(currentTab["button"]).attr("data-ur-state", tabState);
            $(currentTab["content"]).attr("data-ur-state", tabState);
          } else if( tabState === "disabled" ) {
            $(currentTab["button"]).attr("data-ur-state", tabState);
            $(currentTab["content"]).attr("data-ur-state", tabState);
          } else {
            tabState = "enabled";
            $(currentTab["button"]).attr("data-ur-state", tabState);
            $(currentTab["content"]).attr("data-ur-state", tabState);
          }
        }

        // Set up the button call backs
        $.each(allTabs, function() {
          var self = this;
          $(self["button"]).click(function(evt) {
            // Is the tab open already?
            var open = $(this).attr("data-ur-state") === "enabled";
            $.each(groups[self["tabs_id"]]["tabs"], function() {
              $(this["button"]).attr("data-ur-state", "disabled");
              $(this["content"]).attr("data-ur-state", "disabled");
            });
            // If closeable (active tab can be toggled) then make sure it happens.
            if (open &&
                groups[self["tabs_id"]]["closeable"]) {
              console.info("Closeable, allowing state to toggle.");
            } else {
              $(this).attr("data-ur-state", "enabled");
              $(self["content"]).attr("data-ur-state", "enabled");
            }
          });
        });
      }
    }
  }

  // Input Clear
  var inputClear = function( fragment ) {
    log("inputClear");

    var groups = findElements ( fragment, "input-clear" );
    $.each(groups, function() {

      var self = this;
      var that = $(self['set']).find("input");

      // Create the X div
      var ex = $('<div class="data-ur-input-clear-ex"></div>')
      // Hide it (even though this should be in CSS)
      ex.hide();
      // Inject it
      $(self['set']).append(ex);

      // Touch Events
      ex
        .bind('touchstart', function() {
          // remove text in the box
          that[0].value='';
        })
        .bind('touchend', function() {
          // make sure the keyboard doesn't disappear
          that[0].focus();
        });

      that
        .bind('focus', function() {
          if (that[0].value != '') {
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
  var geoCode = function ( fragment ) {
    log("geoCode");
    var wgType = "reverse-geocode";
    var groups = findElements ( fragment, wgType )

    $.each(groups, function() {
      var self = this;
      var set = self['set'];
      var components = findComponents(set, wgType);

      this['elements'] = components;

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
        global = elements;
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
  var zoom = function ( fragment ) {
    log("zoom");

    var wgType = "zoom"
    var groups = findElements( fragment, wgType );

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
      var self = this;
      var set = self['set'];
      var components = findComponents(set, wgType);
      this["components"] = components;
      self["zoom_object"] = new Zoom(this);
    });

    function Zoom(set) {
      var self = this;
      var components = set.components;
      this.container = set["set"];
      this.img = $(components).filter("[data-ur-zoom-component='img']")[0];
      this.prescale = false;
      this.width = this.height = 0;
      this.bigWidth = this.bigHeight = 0;
      this.canvasWidth = this.canvasHeight = 0;
      this.ratio = 1;
      this.state = "disabled";

      // Optionally:
      this.button = $(components).filter("[data-ur-zoom-component='button']")[0];
      this.idler = $(components).filter("[data-ur-zoom-component='loading']")[0];

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
        self.width = self.width || parseInt($img.attr("width")) || parseInt($img.getStyle("width")) || self.img.width;
        self.height = self.height || parseInt($img.attr("height")) || parseInt($img.getStyle("height")) || self.img.height;

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
        if (event.touches) {
          touchX = event.touches[0].pageX;
          touchY = event.touches[0].pageY;
        }

        var style = self.img.style;
        if (window.WebKitCSSMatrix) {
          var matrix = new WebKitCSSMatrix(style.webkitTransform);
          offsetX = matrix.m41;
          offsetY = matrix.m42;
        }
        else {
          var transform = style.MozTransform || style.OTransform || style.transform || "translate(0, 0)";
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
        if (event.touches) {
          x = event.touches[0].pageX;
          y = event.touches[0].pageY;
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
          var $container = x$(self.container);
          $container.on(touch ? "touchstart" : "mousedown", panStart);
          $container.on(touch ? "touchmove" : "mousemove", panMove);
          $container.on(touch ? "touchend" : "mouseup", panEnd);
        }
        else if (self.state == "enabled-out") {
          self.state = "disabled";
          self.container.setAttribute("data-ur-state", self.state);

          var touch = "ontouchstart" in window;
          var $container = $(self.container);
          $container.un(touch ? "touchstart" : "mousedown", panStart);
          $container.un(touch ? "touchmove" : "mousemove", panMove);
          $container.un(touch ? "touchend" : "mouseup", panEnd);
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
        return $img.css({ webkitTransform: t, MozTransform: t, OTransform: t, transform: t });
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
  var carousel = function ( fragment ) {
    log("carousel");
    var groups = findElements(fragment, "carousel");
    //log(groups);

    // private vars


     // private methods

     function zeroCeil(num) {
       return num <= 0 ? Math.floor(num) : Math.ceil(num);
     }

     function zeroFloor(num) {
       return num >= 0 ? Math.floor(num) : Math.ceil(num);
     }

     function stifle(e) {
       e.preventDefault();
       e.stopPropagation();
     }

    // for each carousel
     $.each(groups, function() {
      var self = this;
      var set = self['set'];
      var set_id = self['carousel_id'];
      var components = findComponents(set, "carousel");
      components.each(function() {
        if($(this).attr("data-ur-carousel-component") == "button") {
          var type  = $(this).attr("data-ur-carousel-button-type");
          if(type === undefined) {
            $.error("malformed carousel button type for carousel with id: " + set_id + ".");
          }
          $(this).attr("data-ur-state", type == "prev" ? "disabled" : "enabled");
        }
        //log(this);
      });
      //check if view container is same as carousel element?
      this["components"] = components;
      self["crsl_object"] = new Carousel(this);
      $(self["set"]).attr("data-ur-state", "enabled");
      //log(self);
     });

     // //log errors if required components not found
     // if(crsl["view-container"] === undefined) {
     //   //check if view container is same as carousel element
     //   if(crsl["set"].attr("data-ur-carousel-component") == "view-container") {
     //     crsl["view-container"] = crsl["set"];
     //   }
     //   if(crsl["view-container"] === undefined) {
     //     $.error("no view-container found for carousel with id " + set_id + ".");
     //     continue;
     //   }
     // }
     // if(crsl["scroll-container"] === undefined) {
     //   $.error("no scroll-container found for carousel with id " + set_id + ".");
     //   continue;
     // }
     // if(crsl["item"] === undefined) {
     //   $.error("no items found for carousel with id " + set_id + ".");
     //   continue;
     // }

     function Carousel(set) {
      var self = this;
      var components = set.components;
      this.container = set["set"];
      this.items = $(components).filter("[data-ur-carousel-component='scroll_container']")[0];
      if (this.items.length == 0) {
        $.error("carousel missing item components");
        return false;
      }

      // Optionally:
      this.button = $(components).filter("[data-ur-carousel-component='button']")[0] === undefined ? {} : $(components).filter("[data-ur-carousel-component='button']");
      this.count = $(components).filter("[data-ur-carousel-component='count']")[0];
      this.dots = $(components).filter("[data-ur-carousel-component='dots']")[0];

      this.button["prev"] = this.button.filter("[data-ur-carousel-button-type='prev']");
      this.button["next"] = this.button.filter("[data-ur-carousel-button-type='next']");

      this.flag = {
        click: false,
        increment: false,
        loop: false,
        lock: null,
        timeoutId: null,
        touched: false
      };

      this.options = {
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
      
      this.itemIndex = 0;
      this.translate = 0;
      
      var $container = $(this.container);
      var preCoords = {x: 0, y: 0};
      var startPos = {x: 0, y: 0}, endPos = {x: 0, y: 0};
      
      var snapWidth = 0;
      
      var startingOffset = null;
      
      var translatePrefix = "translate3d(", translateSuffix = ", 0px)";


      function initialize() {
        readAttributes();

        if (!self.options.transform3d) {
          translatePrefix = "translate(";
          translateSuffix = ")";
        }

        $(self.items).filter("[data-ur-carousel-component='item']").each(function(obj, i) {
          if ($(obj).attr("data-ur-state") == "active")
            self.itemIndex = i;
        });

        if (self.options.infinite) {
          var items = $(self.items).find("[data-ur-carousel-component='item']");
          self.realItemCount = items.length;
          //log(items);
          for (var i = 0; i < self.options.cloneLength; i++) {
            var clone = items.clone(true);
            $(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
            //items[items.length - 1].parent().append(clone);
            items.parent().append(clone);
          }

          for (var i = items.length - self.options.cloneLength; i < items.length; i++) {
            var clone = items.clone(true);
            $(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
            items.parent().prepend(clone, items[0]);
          }
        }
        updateIndex(self.itemIndex + self.options.cloneLength);

        self.update();

        if (self.options.touch) {
          var hasTouch = "ontouchstart" in window;
          var start = hasTouch ? "touchstart" : "mousedown";
          var move = hasTouch ? "touchmove" : "mousemove";
          var end = hasTouch ? "touchend" : "mouseup";

          $(self.items).on(start, startSwipe);
          $(self.items).on(move, continueSwipe);
          $(self.items).on(end, finishSwipe);
          $(self.items).on('click', function(e) {if (!self.flag.click) stifle(e);});
        }

        $(self.button["prev"]).on('click', function(){self.moveTo(1);});
        $(self.button["next"]).on('click', function(){self.moveTo(-1);});

        if($(window).orientationchange != undefined) {
          $(window).orientationchange(resize);
        }
        
        // orientationchange isn't supported on some androids
        $(window).on("resize", function() {
          resize();
          setTimeout(resize, 100);
        });

        self.autoscrollStart();

      }

      function readAttributes() {

        var oldAndroid = /Android [12]/.test(navigator.userAgent);
        if (oldAndroid && $container.attr("data-ur-android3d")[0] != "enabled") {
          self.options.transform3d = false;
          var speed = parseFloat($container.attr("data-ur-speed"));
          self.options.speed = speed > 1 ? speed : 1.3;
        }

        $container.attr("data-ur-speed", self.options.speed);

        self.options.verticalScroll = $container.attr("data-ur-vertical-scroll")[0] != "disabled";
        $container.attr("data-ur-vertical-scroll", self.options.verticalScroll ? "enabled" : "disabled");

        self.options.touch = $container.attr("data-ur-touch")[0] != "disabled";
        $container.attr("data-ur-touch", self.options.touch ? "enabled" : "disabled");

        self.options.infinite = $container.attr("data-ur-infinite")[0] != "disabled";
        if ($container.find("[data-ur-carousel-component='item']").length == 1)
          self.options.infinite = false;
        $container.attr("data-ur-infinite", self.options.infinite ? "enabled" : "disabled");

        self.options.center = $container.attr("data-ur-center")[0] == "enabled";
        $container.attr("data-ur-center", self.options.center ? "enabled" : "disabled");

        var fill = parseInt($container.attr("data-ur-fill"));
        if (fill > 0)
          self.options.fill = fill;
        $container.attr("data-ur-fill", self.options.fill);

        var cloneLength = parseInt($container.attr("data-ur-clones"));
        if (!self.options.infinite)
          cloneLength = 0;
        else if (isNaN(cloneLength) || cloneLength < self.options.fill)
          cloneLength = Math.max(1, self.options.fill);
        self.options.cloneLength = cloneLength;
        $container.attr("data-ur-clones", self.options.cloneLength);

        self.options.autoscroll = $container.attr("data-ur-autoscroll")[0] == "enabled";
        $container.attr("data-ur-autoscroll", self.options.autoscroll ? "enabled" : "disabled");

        var autoscrollDelay = parseInt($container.attr("data-ur-autoscroll-delay"));
        if (autoscrollDelay >= 0)
          self.options.autoscrollDelay = autoscrollDelay;
        $container.attr("data-ur-autoscroll-delay", self.options.autoscrollDelay);

        self.options.autoscrollForward = $container.attr("data-ur-autoscroll-dir")[0] != "prev";
        $container.attr("data-ur-autoscroll-dir", self.options.autoscrollForward ? "next" : "prev");

      }

      function updateDots() {
        if (self.dots) {
          var existing = $(self.dots).find("[data-ur-carousel-component='dot']");
          if (existing.length != self.realItemCount) {
            existing.remove();
            var dot = $("<div data-ur-carousel-component='dot'></div>");
            var realItemIndex = self.itemIndex - self.options.cloneLength;
            for (var i = 0; i < self.realItemCount; i++) {
              var new_dot = dot.clone();
              if (i == realItemIndex)
                $(new_dot).attr("data-ur-state", "active");
              $(self.dots).append(new_dot);
            }
          }
        }

      }

      function resize() {
        var offsetWidth = self.container.offsetWidth;
        if (snapWidth != offsetWidth && offsetWidth != 0)
          self.update();

      }

      this.update = function() {
        var oldWidth = snapWidth;
        snapWidth = self.container.offsetWidth;

        var oldCount = self.itemCount;
        var items = $(self.items).find("[data-ur-carousel-component='item']");
        self.itemCount = items.length;

        if (oldCount != self.itemCount) {
          self.realItemCount = items.filter(":not([data-ur-clone])").length;
          x = items;
          self.lastIndex = self.itemCount - 1;
          if (self.itemIndex > self.lastIndex)
            self.itemIndex = self.lastIndex;
          updateDots();
        }

        // Adjust the container to be the necessary width.
        var totalWidth = 0;

        var divisions = [];
        if (self.options.fill > 0) {
          var remainder = snapWidth;
          for (var i = self.options.fill; i > 0; i--) {
            var length = Math.round(remainder/i);
            divisions.push(length);
            remainder -= length;
          }
        }

        for (var i = 0; i < items.length; i++) {
          if (self.options.fill > 0) {
            var length = divisions[i % self.options.fill];
            items[i].width(length + "px");
            totalWidth += length;
          }
          else {
            $(items[i]).load(function() {
              totalWidth += $(this).width();
            });
          }
        }
        //$(items[self.realItemCount-1]).load(function() {
        $(window).load(function() {
          $(self.items).width(totalWidth + "px");
        });
        

        var cumulativeOffset = -items[self.itemIndex].offsetLeft; // initial offset
        if (self.options.center) {
          var centerOffset = parseInt((snapWidth - items[self.itemIndex].offsetWidth)/2);
          cumulativeOffset += centerOffset; // CHECK
        }
        if (oldWidth)
          self.destinationOffset = cumulativeOffset;

        translateX(cumulativeOffset);

      };

      this.autoscrollStart = function() {
        if (!self.options.autoscroll)
          return;

        self.flag.timeoutId = setTimeout(function() {
          if (self.container.offsetWidth != 0) {
            if (!self.options.infinite && self.itemIndex == self.lastIndex && self.options.autoscrollForward)
              self.jumpToIndex(0);
            else if (!self.options.infinite && self.itemIndex == 0 && !self.options.autoscrollForward)
              self.jumpToIndex(self.lastIndex);
            else
              self.moveTo(self.options.autoscrollForward ? -1 : 1);
          }
          else
            self.autoscrollStart();
        }, self.options.autoscrollDelay);
      };

      this.autoscrollStop = function() {
        clearTimeout(self.flag.timeoutId);
      };

      function getEventCoords(event) {
        if (event.touches && event.touches.length > 0)
          return {x: event.touches[0].clientX, y: event.touches[0].clientY};
        else if (event.clientX != undefined)
          return {x: event.clientX, y: event.clientY};
        return null;
      }

      function updateButtons() {

        $(self.button["prev"]).attr("data-ur-state", self.itemIndex == 0 ? "disabled" : "enabled");
        $(self.button["next"]).attr("data-ur-state", self.itemIndex == self.itemCount - Math.max(self.options.fill, 1) ? "disabled" : "enabled");
      }

      function getNewIndex(direction) {
        var newIndex = self.itemIndex - direction;
        if (!self.options.infinite) {
          if (self.options.fill > 1 && newIndex > self.lastIndex - self.options.fill + 1)
            newIndex = self.lastIndex - self.options.fill + 1;
          else if (newIndex > self.lastIndex)
            newIndex = self.lastIndex;
          else if (newIndex < 0)
            newIndex = 0;
        }
        
        return newIndex;

      }

      function updateIndex(newIndex) {
        if (newIndex === undefined)
          return;

        self.itemIndex = newIndex;
        if (self.itemIndex < 0)
          self.itemIndex = 0;
        else if (self.itemIndex > self.lastIndex)
          self.itemIndex = self.lastIndex - 1;

        var realIndex = self.itemIndex;
        if (self.options.infinite)
          realIndex = (self.realItemCount + self.itemIndex - self.options.cloneLength) % self.realItemCount;
        if (self.count !== undefined)
          self.count.innerHTML = realIndex + 1 + " of " + self.realItemCount;

        self.itemIndex = realIndex;

        $(self.items).find("[data-ur-carousel-component='item'][data-ur-state='active']").attr("data-ur-state", "inactive");
        $($(self.items).find("[data-ur-carousel-component='item']")[self.itemIndex]).attr("data-ur-state", "active");

        if (self.dots)
          $($(self.dots).find("[data-ur-carousel-component='dot']").attr("data-ur-state", "inactive")[realIndex]).attr("data-ur-state", "active");

        updateButtons();

        $container.fire("slidestart", {index: realIndex});

      }

      function startSwipe(e) {
        if (!self.options.verticalScroll)
          stifle(e);
        self.autoscrollStop();

        self.flag.touched = true; // For non-touch environments
        self.flag.lock = null;
        self.flag.loop = false;
        self.flag.click = true;
        var coords = getEventCoords(e);
        preCoords.x = coords.x;
        preCoords.y = coords.y;

        if (coords !== null) {
          var translate = getTranslateX();

          if (startingOffset == null || self.destinationOffset == undefined)
            startingOffset = translate;
          else
            // Fast swipe
            startingOffset = self.destinationOffset; //Factor incomplete previous swipe
          
          startPos = endPos = coords;
        }
      }

      function continueSwipe(e) {
        if (!self.flag.touched) // For non-touch environments
          return;

        self.flag.click = false;

        var coords = getEventCoords(e);

        if (document.ontouchstart !== undefined && self.options.verticalScroll) {
          var slope = Math.abs((preCoords.y - coords.y)/(preCoords.x - coords.x));
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
          var dist = swipeDist() + startingOffset;

          if (self.options.infinite) {
            var items = $(self.items).find("[data-ur-carousel-component='item']");
            var endLimit = items[self.lastIndex].offsetLeft + items[self.lastIndex].offsetWidth - self.container.offsetWidth;

            if (dist > 0) { // at the beginning of carousel
              var srcNode = items[self.realItemCount];
              var offset = srcNode.offsetLeft - items[0].offsetLeft;
              startingOffset -= offset;
              dist -= offset;
              self.flag.loop = !self.flag.loop;
            }
            else if (dist < -endLimit) {  // at the end of carousel
              var srcNode = items[self.lastIndex - self.realItemCount];
              var offset = srcNode.offsetLeft - items[self.lastIndex].offsetLeft;
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
        
        self.flag.touched = false; // For non-touch environments
        
        moveHelper(getDisplacementIndex());
      }

      function getDisplacementIndex() {
        var swipeDistance = swipeDist();
        var displacementIndex = zeroCeil(swipeDistance/$(self.items).find("[data-ur-carousel-component='item']")[0].width);
        return displacementIndex;
      }

      function snapTo(displacement) {
        self.destinationOffset = displacement + startingOffset;
        var maxOffset = -1*self.lastIndex*snapWidth;
        var minOffset = parseInt(snapWidth - $(self.items).find("[data-ur-carousel-component='item']")[0].width/2);

        if (self.options.infinite)
          maxOffset = -$(self.items).find("[data-ur-carousel-component='item']").parent().width();
          //maxOffset = -$(self.items).width();
        if (self.destinationOffset < maxOffset || self.destinationOffset > minOffset) {
          if (Math.abs(self.destinationOffset - maxOffset) < 1) {
            // Hacky -- but there are rounding errors
            // I see this when I'm in multi-mode and using the buttons
            // This only seems to happen on the desktop browser -- ideally its removed at compile time
            self.destinationOffset = maxOffset;
          } else
            self.destinationOffset = minOffset;
        }

        momentum();
      }

      this.moveTo = function(direction) {
        // The animation isnt done yet
        if (self.flag.increment)
          return;

        startingOffset = getTranslateX();
        moveHelper(direction);
      }

      function moveHelper(direction) {
        self.autoscrollStop();

        var newIndex = getNewIndex(direction);
        
        var items = $(self.items).find("[data-ur-carousel-component='item']");

        if (self.options.infinite) {
          var oldTransform = getTranslateX();
          var altTransform = oldTransform;

          if (newIndex < self.options.cloneLength) { // at the beginning of carousel
            var offset = items[self.options.cloneLength].offsetLeft - items[self.itemCount - self.options.cloneLength].offsetLeft;
            if (!self.flag.loop) {
              altTransform += offset;
              translateX(altTransform);
              startingOffset += offset;
            }
            newIndex += self.realItemCount;
            self.itemIndex = newIndex + direction;
          }
          else if (newIndex > self.lastIndex - self.options.cloneLength) { // at the end of carousel
            var offset = items[self.itemCount - self.options.cloneLength].offsetLeft - items[self.options.cloneLength].offsetLeft;
            if (!self.flag.loop) {
              altTransform += offset;
              translateX(altTransform);
              startingOffset += offset;
            }
            newIndex -= self.realItemCount;
            self.itemIndex = newIndex + direction;
          }
        }
        var newItem = items[newIndex];
        var currentItem = items[self.itemIndex];
        var displacement = currentItem.offsetLeft - newItem.offsetLeft; // CHECK
        if (self.options.center)
          displacement += (currentItem.offsetWidth - newItem.offsetWidth) / 2;
        setTimeout(function() {
          snapTo(displacement);
          updateIndex(newIndex);
        }, 0);
      }

      this.jumpToIndex = function(index) {
        self.moveTo(self.itemIndex - index);
      };

      function momentum() {
        if (self.flag.touched)
          return;

        self.flag.increment = false;

        var translate = getTranslateX();
        var distance = self.destinationOffset - translate;
        var increment = distance - zeroFloor(distance / self.options.speed);

        // Hacky -- this is for the desktop browser only -- to fix rounding errors
        // Ideally, this is removed at compile time
        if(Math.abs(increment) < 0.01)
          increment = 0;

        var newTransform = increment + translate;

        translateX(newTransform);

        if (increment != 0)
          self.flag.increment = true;

        if (self.flag.increment)
          setTimeout(momentum, 16);
        else {
          startingOffset = null;
          self.autoscrollStart();

          var itemIndex = self.itemIndex;
          $(self.container).fire("slideend", {index: itemIndex});
        }
      }

      function swipeDist() {
        return endPos === undefined ? 0 : endPos.x - startPos.x;
      }

      //need to jquerify
      function translateX(x) {
        self.translate = x;
        var items = self.items;
        items.style.webkitTransform = items.style.msTransform = items.style.OTransform = items.style.MozTransform = items.style.transform = translatePrefix + x + "px, 0px" + translateSuffix;
      }

      function getTranslateX() {
        return self.translate;
      }

      initialize();


     }


  }

  var initialized = false;
  var widgets = [toggler, tabs, inputClear, geoCode, zoom, carousel];

  // Have methods here to make private
  var methods = {
    init : function( options ) {
      // Initialize the function here
      log("Uranium init: " + options);

      // log(this);
      // log($(this));
      if (! initialized) {

        // Define the fragment
        if (this === undefined) {
          this = document.body;
        }

        // Initialize the widgets
        var self = this;
        $.each(widgets, function() {
          this(self);
        });

      }

      initialized = true;
    },
    lateInit : function( options ) {
      // Initialize the function here
      log("Uranium lateInit: " + options);

      // Initialize the widgets
      $.each(widgets, function() {
        this(options);
      });
    },
    // Error not needed, just call $.error
    warn : function( msg ) {
      console.warn("Uranium Warning: " + msg);
    },
    initialized : function() {
      log("initialized " + initialized);
      return initialized;
    }
  }

  $.fn.Uranium = function( method, debug ) {

    return this.each(function() {

      // Call functions to prove they are working as we build out the framework

      // warn
      // methods.warn.apply( this, Array.prototype.slice.call( arguments, 1 ));
      // methods.warn.apply( this, arguments );

      // initialized?
      // methods.initialized.apply( this );

      // init
      // methods.init.apply( this, arguments );

      // initialized?
      // methods.initialized.apply( this );

      if ( methods[method] ) {
        return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' + method + ' does not exist on jQuery.Uranium');
      }

    });
  };
})( jQuery );

$(document).ready(function() {
  $("body").Uranium("init");
});

var global;
