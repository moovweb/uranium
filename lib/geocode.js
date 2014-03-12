// Geocode
interactions.geocode = function ( fragment, options ) {
  options = options || {};
  if (fragment.constructor == Object)
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
