if(typeof(Ur) == 'undefined') {
  Ur = {
    QuickLoaders: {},
    WindowLoaders: {},
    initialize: function(event, fragment) {
      console.log("initializing UR");
      var Loaders = (event.type == "DOMContentLoaded") ? Ur.QuickLoaders : Ur.WindowLoaders;
      if(fragment === undefined) {
        fragment = document.body;
      }
      
      for(name in Loaders) {
        console.log("loading : " + name);
        var widget = new Loaders[name];
        widget.initialize(fragment);
      }
    }
  };
}

// This event is compatible with FF/Webkit
window.addEventListener('DOMContentLoaded', Ur.initialize, false);
window.addEventListener('load', Ur.initialize, false);
// Do this? OR just initialize as widgets are defined (and have uranium included at the bottom --- but that has limitations in inline JS using all of our x$() mixins) --> I think thats reason enough to try this for now


// Now, you can re-initialize html fragments like so (After I refactor the widget initializers to search within fragments)
// x$(elem).on('click', Ur.Loaders['zoom-preview'].intialize(fragment));
// or 
// x$(elem).on('click', Ur.initialize(fragment));

var mixins = {
  // Grabbed this from xui's forEach defn
  iterate: function(stuff, fn) {
    if (stuff === undefined) {
      return;
    }
    var len = stuff.length || 0,
    i = 0,
    that = arguments[1];

    if (typeof fn == 'function') {
      for (; i < len; i++) {
        fn.call(that, stuff[i], i, stuff);
      }
    }
  },
  offset: function(elm) {
    if(typeof(elm == "undefined")) {
      elm = this[0];
    }

    cumulative_top = 0;
    cumulative_left = 0;
    while(elm.offsetParent) {
      cumulative_top += elm.offsetTop;
      cumulative_left += elm.offsetLeft;
      elm = elm.offsetParent;
    }
    return {left: cumulative_left, top:cumulative_top};
  },
  
  // TODO: Make private:
  find_next_ancestor: function(elem, type) {
    //check to make sure there's still a parent:
    if (elem.parentNode != window.document) {
      return x$().find_set_ancestor(elem.parentNode, type);
    } else {
      return null;
    }
  },

  find_set_ancestor: function(elem, type) {
    var set_name = x$(elem).attr("data-ur-set")[0];
    if (set_name !== undefined) {
      if(type == undefined) {
        return elem;
      } else if (set_name == type) {
        return elem;
      } else {
        return x$().find_next_ancestor(elem, type);
      }
    } else {
      return x$().find_next_ancestor(elem, type);
    }
  },

  get_unique_uranium_id: (function() {
    var count = 0;
    return function get_id() {
      count += 1;
      return count;
    }
  })(),

  find_elements: function(type, component_constructors) {
    var all_elements = x$('*[data-ur-' + type + '-component]');
    var groups = {};

    all_elements.each(
      function() {

        var valid_component = true;

        ///////// Resolve this component to its set ///////////

        // Check if this has the data-ur-id attribute
        var my_set_id = x$(this).attr("data-ur-id");

        if (my_set_id.length != 0) {
          if ( groups[my_set_id] === undefined) {
            groups[my_set_id] = {};
          }          
        } else {
          //Find any set ancestors
          var my_ancestor = x$().find_set_ancestor(this);

          if (my_ancestor !== null) {
            // Check if the set has an id ... if not, 'set' it up -- HA

            my_set_id = x$(my_ancestor).attr("data-ur-id")[0];

            if (my_set_id === undefined) {
              //generate ID
              my_set_id = x$().get_unique_uranium_id();
              x$(my_ancestor).attr("data-ur-id", my_set_id);
            }

            if (groups[my_set_id] === undefined) {
              //setup group
              groups[my_set_id] = {};
            }

          } else {
            // we're screwed ... report an error
            console.log("Uranium Error: Couldn't find associated ur-set for component:",this);
            valid_component = false;
          }
        }

        //////////// Add this component to its set /////////////

        var component_type = x$(this).attr("data-ur-" + type + "-component");

        if (component_type === undefined) {
          valid_component = false;
        }

        if (valid_component) {
	  // This is widget specific behavior
	  // -- For toggler, it makes sense for content to be multiple things
	  // -- For select-lists, it doesn't
	  if (component_constructors !== undefined && component_constructors[component_type] !== undefined) {
	    component_constructors[component_type](groups[my_set_id], this, component_type);
	  } else {
            groups[my_set_id][component_type] = this;
          }
        }

      }
    );

    return groups;
  }
}

xui.extend(mixins);
