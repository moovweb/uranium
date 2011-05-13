var mixins = {
  // Grabbed this from xui's forEach defn
  iterate: function(stuff, fn) {
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
  touch_events: function() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch(e) {
      return false;
    }
  },
  
  // TODO: Make private:
  find_next_ancestor: function(elem, type) {
    //check to make sure there's still a parent:
    console.log("parent?",elem.parentNode);
    if (elem.parentNode != window.document) {
      return x$().find_set_ancestor(elem.parentNode, type);
    } else {
      return null;
    }
  },

  find_set_ancestor: function(elem, type) {
    console.log("data-ur-set:");
    console.log(elem);
    console.log(x$(elem).attr("data-ur-set"));
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
        console.log("Constructing component:");
        console.log(this);

        ///////// Resolve this component to its set ///////////

        // Check if this has the data-ur-id attribute
        var my_set_id = x$(this).attr("data-ur-id");
        console.log("my id=",my_set_id.length);
        if (my_set_id.length != 0) {
          console.log("I HAVE AN ID");
          if ( groups[my_set_id] === undefined) {
            groups[my_set_id] = {};
          }
          console.log(groups[my_set_id]);
          

        } else {
          //Find any set ancestors
          var my_ancestor = x$().find_set_ancestor(this);
          if (my_ancestor !== null) {
            console.log("FOUND ANCESTOR:");
            console.log(my_ancestor);
            // Check if the set has an id ... if not, 'set' it up -- HA
            if (x$(my_ancestor).attr("data-ur-id").length == 0) {
              // Must be first time I've encountered this set
              my_set_id = x$().get_unique_uranium_id();
              x$(my_ancestor).attr("data-ur-id", my_set_id);
              groups[my_set_id] = {};
            } else {
              my_set_id = x$(my_ancestor).attr("data-ur-id")[0];
            }
          } else {
            // we're screwed ... report an error
            console.log("couldn't find associated ur-set for component:");
            console.log(this);
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
	  console.log("valid component (" + component_type + ":", this);
	  if (component_constructors !== undefined && component_constructors[component_type] !== undefined) {
	    console.log("calling constructor:", component_constructors[component_type]);
	    component_constructors[component_type](groups[my_set_id], this);
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

