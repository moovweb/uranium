/* Map *
 * * * *
 * The map creates a fully functional google map (API version 3) from addresses.
 * 
 * It (will) also support current location / custom icons and callbacks / getting directions.
 *
 */

Ur.QuickLoaders['map'] = (function(){
  function Map(data){
    this.elements = data;
    this.fetch_map(); //This is async -- it calls initialize when done
  }

  Map.prototype = {
    initialize: function(){
      this.fetch_coordinates();
//      this.collect_coordinates();
//      this.setup_map();
    },
    fetch_coordinates: function(){
      this.coordinates = [];
      var geocoder = new google.maps.Geocoder();
      var obj = this;

      x$(this.elements["addresses"]).each(
        function(address, index) {
          address = address.innerText;
          geocoder.geocode(
            {"address": address},
            function(results, status) {
              if(status === "OK") {
                obj.coordinates[index] = results.location;
              } else {
                console.log("Error geocoding address: " + address);
              }

            }
          );
        }
      );

      // Need to wait for all the async calls
      console.log("Got coordinates:", this.coordinates);

    },
    collect_coordinates: function() {
      
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
          obj.initialize();
        }
      }(this);

      script.src = "http://maps.googleapis.com/maps/api/js?sensor=true&callback=setup_uranium_map";

      this.elements["set"].appendChild(script);
    },
    setup_map: function() {
      
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
