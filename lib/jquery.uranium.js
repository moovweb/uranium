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

    var groups = findElements ( fragment, "input-clear" )
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
    log(groups);

    console.log(this)

    $.each(groups, function() {
      var self = this;
      var set = self['set'];
      var components = findComponents(set, wgType);

      // global = set;
      // log(set);
      log(components);
      this['elements'] = components;

      console.log(this);
      // global = this;

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
              log(geocodeObj);
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
          console.log(obj);
          return function(){
            obj.setup_callbacks();
          };
        }(this);
      var s = document.createElement('script');
      s.type = "text/javascript";
      s.src = "https://maps.googleapis.com/maps/api/js?sensor=true&callback=UrGeocode";
      $('head').append(s);

      log(self);

    });



  }

  var initialized = false;
  var widgets = [toggler, tabs, inputClear, geoCode];

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
      log("Iterating through the items in the jQuery function");

      // Call functions to prove they are working as we build out the framework

      // warn
      methods.warn.apply( this, Array.prototype.slice.call( arguments, 1 ));
      methods.warn.apply( this, arguments );

      // initialized?
      methods.initialized.apply( this );

      // init
      methods.init.apply( this, arguments );

      // initialized?
      methods.initialized.apply( this );

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
  $("body").Uranium("foo");
});

var global;
