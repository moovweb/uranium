/* Map *
 * * * *
 * The map creates a fully functional google map (API version 3) from addresses.
 * 
 * It (will) also support current location / custom icons and callbacks / getting directions.
 *
 */

Ur.QuickLoaders['map'] = (function(){

  // -- Private functions --

  function ThresholdCallback(threshold, callback) {
    this.threshold = threshold;
    this.count = 0;
    this.callbacks = [];
    if (callback !== undefined) {
      this.callbacks.push(callback);
    }
  }
  
  ThresholdCallback.prototype.finish = function() {
    this.count += 1;
    if (this.count == this.threshold) {
      var callback = this.callbacks.pop();
      while(callback) {
        callback();
        callback = this.callbacks.pop();
      }
    }
  }

  // -- End of Private functions -- 



  function Map(data){
    this.elements = data;
    this.fetch_map(); //This is async -- it calls initialize when done
  }

  // NOTE : All this map stuff is async. The execution path goes:
  // 
  // fetch_map() -> 
  // fetch_coordinates() -> 
  // setup_map() -> 
  //     add_coordinates()
  //     setup_user_location()

  Map.prototype = {
    marker_clicked: function(map_event, marker_index) {

      x$().iterate(
        this.elements["descriptions"],
        function(description, index) {
          if(index == marker_index) {
            x$(description).attr("data-ur-state","enabled");
          } else {
            x$(description).attr("data-ur-state","disabled");            
          }
        }
      );      
      
      // TODO: I probably want to add the ability to specify your own callback, which would get called here
    },

    fetch_coordinates: function(){
      this.coordinates = [];
      this.center = [0,0];
      this.lat_range = {};
      this.lng_range = {};

      var geocoder = new google.maps.Geocoder();
      var obj = this;
      var final_callback = new ThresholdCallback(
        this.elements["addresses"].length,
        function(obj){return function(){obj.setup_map();}}(this)
      );

      x$(this.elements["addresses"]).each(
        function(address, index) {
          address = address.innerText;
          var cleaned_address = address.match(/(\S.*\S)[$\s]/m)[1];
          
          if(cleaned_address == undefined){
            cleaned_address = address;
          }

          geocoder.geocode(
            {"address": cleaned_address},
            function(results, status) {
              var position = null; 

              if(status === google.maps.GeocoderStatus.OK) {
                position = results[0].geometry.location;
                obj.coordinates[index] = position;
                obj.center[0] += position.lat();
                obj.center[1] += position.lng();

                var ne = results[0].geometry.viewport.getNorthEast();
                var sw = results[0].geometry.viewport.getSouthWest();

                if ( (obj.lat_range["min"] && obj.lat_range["min"] > sw.lat()) || obj.lat_range["min"] === undefined) {
                  obj.lat_range["min"] = sw.lat();
                }

                if ( (obj.lat_range["max"] && obj.lat_range["max"] < sw.lat()) || obj.lat_range["max"] === undefined) {
                  obj.lat_range["max"] = ne.lat();
                }

                if ( (obj.lng_range["min"] && obj.lng_range["min"] > sw.lng()) || obj.lng_range["min"] === undefined) {
                  obj.lng_range["min"] = sw.lng();
                }

                if ( (obj.lng_range["max"] && obj.lng_range["max"] < sw.lng()) || obj.lng_range["max"] === undefined) {
                  obj.lng_range["max"] = ne.lng();
                }

                final_callback.finish();
              } else {
                console.error("Error geocoding address: " + address);
              }

            }
          );
        }
      );

    },

    add_coordinates: function() {
      var obj = this;
      var icon_url = x$(this.elements["icon"]).attr("data-ur-url")[0];

      var width = x$(this.elements["icon"]).attr("data-ur-width")[0];
      var height = x$(this.elements["icon"]).attr("data-ur-height")[0];

      var size = null;

      if(width !== undefined && height !== undefined){
        size = new google.maps.Size(parseInt(width), parseInt(height));
      }

      x$().iterate(
        obj.coordinates,
        function (point, index) {
          var icon_image = null;

          if (icon_url !== undefined) {
            icon_image = new google.maps.MarkerImage(icon_url, null, null, null, size);
          }

          var marker = new google.maps.Marker({
            position: point, 
            map: obj.map,
            icon: icon_image
          }); 

          google.maps.event.addListener(
            marker,
            'click',
            function(marker_index){
              return function(map_event){
                obj.marker_clicked(map_event, marker_index);
              };
            }(index)
          );

        }
      );
      
    },

    setup_user_location: function() {
      var user_location = this.elements["user_location"];
      this.user_location_marker = null;

      if(user_location === undefined) {
        return
      }

      // Add a listener on the button 

      var self = this;

      x$(user_location).on(
        'click',
        function(){self.toggle_user_location()}
      );

      // Now just determine if I should use it automatically or not

      if(x$(user_location).attr("data-ur-state")[0] === "enabled") {
        this.fetch_user_location();
      } 
      
    },

    fetch_user_location: function() {

      var success = function(obj){
        return function(position){
          obj.add_user_location(position);
        }
      }(this);

      var failure = function(){
          console.error("Ur : Error getting user location");
      };

      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, failure);
      } else {
        console.error("Ur : Geolocation services not available");
      } 

    },

    add_user_location: function(point) {      
      var google_point = new google.maps.LatLng(point.coords.latitude, point.coords.longitude);

      this.user_location_marker = new google.maps.Marker({
        position: google_point, 
        map: this.map,
        icon: "//s3.amazonaws.com/moovweb-live-resources/map/dot-blue.png"
      }); 
      // TODO : Make this a real icon URL

      x$(this.elements["user_location"]).attr("data-ur-state","enabled");
    },

    toggle_user_location: function() {

      if(this.user_location_marker === null || this.user_location_marker === undefined) {
        this.fetch_user_location();
      } else {
        this.user_location_marker.setMap(null);
        delete this.user_location_marker;
        x$(this.elements["user_location"]).attr("data-ur-state","disabled");
      }

    },

    fetch_map: function() {
      var script = document.createElement("script");

      // Note:
      // - There can only be one map per page since I have to pass a global function name as
      //   the callback for the map code loading.
      // - The alternative is to generate unique global function names per instance ... but
      //   that requires eval() ... and "evals() are bad .... mkay?"

      // TODO: Can I at least hide it behind the Ur object?
      setup_uranium_map = function(obj){
        return function() {
          obj.fetch_coordinates();
        }
      }(this);

      script.src = "http://maps.googleapis.com/maps/api/js?sensor=true&callback=setup_uranium_map";

      this.elements["set"].appendChild(script);
    },

    setup_map: function() {
      
      this.center[0] /= this.elements["addresses"].length
      this.center[1] /= this.elements["addresses"].length

      var center = new google.maps.LatLng(this.center[0], this.center[1]);

      var options = {
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.elements["canvas"], options);

      var cumulative_sw = new google.maps.LatLng(this.lat_range["min"], this.lng_range["min"]);
      var cumulative_ne = new google.maps.LatLng(this.lat_range["max"], this.lng_range["max"]);

      var cumulative_bounds = new google.maps.LatLngBounds(cumulative_sw, cumulative_ne);

      this.map.fitBounds(cumulative_bounds);

      this.add_coordinates();
      this.setup_user_location();
    }

  }


  var ComponentConstructors = {
    "address" : function(group, component, type) {
      if (group["addresses"] === undefined) {
        group["addresses"] = [];
      }

      group["addresses"].push(component);
    },

    "description" : function(group, component, type) {
      if (group["descriptions"] === undefined) {
        group["descriptions"] = [];
      }

      group["descriptions"].push(component);      
    }
  }

  function MapLoader(){
  }

  MapLoader.prototype.initialize = function(fragment) {
    var maps = x$(fragment).findElements('map', ComponentConstructors);
    Ur.Widgets["map"] = {};

    for(var name in maps) {
      var map = maps[name];
      Ur.Widgets["map"][name] = new Map(map);
      break;
      // There can only be one for now ... 
      // TODO: As long as I make the script adding a singleton process, I can have multiple maps
    }

  }

  return MapLoader;
})();
