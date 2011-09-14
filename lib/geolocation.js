/* Geolocation  *
 * * * * * * * * *
 *
 *  The Geolocation widget is meant to
 *  reverse geocode a position to give back an address and then
 *  populate form fields
 *
 */
 
Ur.QuickLoaders['geocode'] = (function(){
  
  function Geocode(data) {
    this.elements = data;
    this.callback = x$(this.elements.set).attr("data-ur-callback")[0];

    UrGeocode = function(obj){return function(){obj.setup_callbacks();};}(this);
    var s = document.createElement('script');
    s.type = "text/javascript";
    s.src = "http://maps.googleapis.com/maps/api/js?sensor=true&callback=UrGeocode";
    x$('head').html('bottom', s);
  }
  
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
    switch(elm) {
      case 'rg-city':
        index1 = 2;
        break;
      case 'rg-street':
        index1 = 0;
        index2 = 1;
        break;
      case 'rg-zip': 
        index1 = 7;
        break;
      case 'rg-state':
        index1 = 5;
        break;
      case 'rg-country':
        index1 = 6;
        break;
    }
    if (htmlElmType === "input") {
      if (index2 === null) {
        currentObj.elements[elm].value = geoInfo[0].address_components[index1].long_name;
      } else {
        currentObj.elements[elm].value = geoInfo[0].address_components[index1].long_name + " " + geoInfo[0].address_components[index2].long_name;
      }
    } else if (htmlElmType === "select") {
      selectHelper(currentObj.elements[elm], geoInfo[0].address_components[index1]);
    }
  }
  
  function populateFields (geoInfo) {
    var elements = currentObj.elements;
    for (elm in elements) {
      (elements[elm].localName === "input") ? fieldHelper(elm, geoInfo, "input") : fieldHelper(elm, geoInfo, "select");
    }
  }
  
  Geocode.prototype = {
    setup_callbacks: function() {
      currentObj = this;
      // Set up call back for button to trigger geocoding
      if (this.elements['rg-button']) {
        x$(this.elements['rg-button']).on(
          'click', 
          function(obj){
            return function() {
              obj.geocode();
            }
          }(this)
        );
      } else {
        console.warn("Ur warning -- no button for triggering reverse geocoding present");
        geocode();
      }
    },
    geoSuccess: function(position){   
      var coords = {
        lat: position.coords.latitude, 
        lng: position.coords.longitude
      }

      this.codeLatLng(coords.lat, coords.lng);
    },
    
    geoError: function(error){
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
    },

    geoDenied: function(){
      console.error("Ur geolocation error -- User Denied Geolocation");
    },

    codeLatLng: function(lat, lng) {
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
    },

    geocode: function(){
      if(navigator.geolocation){ //feature detect
        geocoder = new google.maps.Geocoder();
        navigator.geolocation.getCurrentPosition(
          function(obj){
            return function(position){
              obj.geoSuccess(position);
            };
          }(this), 
          this.geoError, 
          this.geoDenied
        );  
      }
    }
  }

  function GeocodeLoader() {
  }

  GeocodeLoader.prototype.initialize = function(fragment) {
    var my_geo = x$(fragment).find_elements('reverse-geocode');
    
    Ur.Widgets["geocode"] = {}
    
    for (var name in my_geo){
      Ur.Widgets["geocode"][name] = new Geocode(my_geo[name]);
      break;
    }
    
  }

  return GeocodeLoader;
})();