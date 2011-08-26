/* Map *
 * * * *
 * The map creates a fully functional google map (API version 3) from addresses.
 * 
 * It (will) also support current location / custom icons and callbacks / getting directions.
 *
 */

Ur.QuickLoaders['map'] = (function(){

  // Private functions

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

  // End of Private functions



  function Map(data){
    this.elements = data;
    this.fetch_map(); //This is async -- it calls initialize when done
  }

  // All this map stuff is async. The execution path is like:
  // fetch_map() -> fetch_coordinates() -> setup_map() -> setup_user_location()

  Map.prototype = {
    fetch_coordinates: function(){
      this.coordinates = [];
      this.center = [0,0];
      var geocoder = new google.maps.Geocoder();
      var obj = this;
      var final_callback = new ThresholdCallback(
        this.elements["addresses"].length,
//        obj.setup_map
//      );
        function(obj){return function(){obj.setup_map();}}(this)
      );

      x$(this.elements["addresses"]).each(
        function(address, index) {
          address = address.innerText;
          geocoder.geocode(
            {"address": address},
            function(results, status) {
              console.log(results);
              var position = results[0].geometry.location;
              if(status === "OK") {
                obj.coordinates[index] = position;
                console.log(position);
                obj.center[0] += position.lat();
                obj.center[1] += position.lng();

                final_callback.finish();
              } else {
                console.error("Error geocoding address: " + address);
              }

            }
          );
        }
      );

      console.log("this center:");
      console.log(this.center);

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
          console.log("Setting up Ur map");
          obj.fetch_coordinates();
        }
      }(this);

      script.src = "http://maps.googleapis.com/maps/api/js?sensor=true&callback=setup_uranium_map";

      this.elements["set"].appendChild(script);
    },
    setup_map: function() {
      console.log("setting up map");
      console.log(this.elements);
      
      this.center[0] /= this.elements["addresses"].length
      this.center[1] /= this.elements["addresses"].length

//      var latlng = new google.maps.LatLng(-34.397, 150.644);
      var latlng = new google.maps.LatLng(this.center[0], this.center[1]);
      var myOptions = {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(this.elements["canvas"],
                                    myOptions);
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
    var maps = x$(fragment).find_elements('map', ComponentConstructors);
    Ur.Widgets["map"] = {};

    for(var name in maps) {
      var map = maps[name];
      Ur.Widgets["map"][name] = new Map(map);
    }
  }

  return MapLoader;
})();
