function find_set_ancestor(elem) {
  console.log(elem);
  console.log("data-ur-set:" + x$(elem).attr("data-ur-set"));
  if (x$(elem).attr("data-ur-set").length != 0) {
    return elem;
  } else {
    //check to make sure there's still a parent:
    console.log("parent?",elem.parentNode);
    if (elem.parentNode != window.document) {
      return find_set_ancestor(elem.parentNode);
    } else {
      return null;
    }
  }
}

get_unique_uranium_id = (function() {
  var count = 0;
  return function get_id() {
    count += 1;
    return count;
  }
})();

function find_elements() {
  var all_elements = x$('*[data-ur-component]');

  // Also search for ur-set's? If I can do hasChild ... nah ... theres no way thats faster

  var togglers = {};

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
        if ( togglers[my_set_id] === undefined) {
          togglers[my_set_id] = {};
        }
        console.log(togglers[my_set_id]);
        

      } else {
        //Find any set ancestors
        var my_ancestor = find_set_ancestor(this);
        if (my_ancestor !== null) {
          console.log("FOUND ANCESTOR:");
          console.log(my_ancestor);
          // Check if the set has an id ... if not, 'set' it up -- HA
          if (x$(my_ancestor).attr("data-ur-id").length == 0) {
            // Must be first time I've encountered this set
            my_set_id = get_unique_uranium_id();
            x$(my_ancestor).attr("data-ur-id", my_set_id);
            togglers[my_set_id] = {};
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

      var component_type = x$(this).attr("data-ur-component");

      if (component_type === undefined) {
        valid_component = false;
      }

      if (valid_component) {
        togglers[my_set_id][component_type] = this;
      }

    }
  );

  return togglers;
}


(function(){
  function ToggleLoader(){}

  ToggleLoader.prototype.find = function(){
    var togglers = find_elements();
    var self=this;
    
    for(toggler_id in togglers) {
      var toggler = togglers[toggler_id];
      var toggler_state = x$(toggler["button"]).attr("data-ur-state");
      if(toggler_state === undefined) {
        x$(toggler["button"]).attr("data-ur-state", 'disabled');
      } 
      
      //TODO: Account for multiple content elements

      // Make the content state match the button state
      x$(toggler["content"]).attr("data-ur-state", toggler_state)

    }

    return togglers;
  }

  ToggleLoader.prototype.construct_button_callback = function(contents) {
    var self = this;
    return function(evt) { 
      var button = evt.currentTarget;
      var current_state = x$(button).attr("data-ur-state")[0];
      var new_state = current_state === "enabled" ? "disabled" : "enabled";

      x$(button).attr("data-ur-state", new_state);

      x$(contents).each(
        function(){
          x$(this).attr("data-ur-state", new_state);
        }
      );
    }
  }

  // This will be added to a queue of initialization methods that the global Moovweb object will call onload
  ToggleLoader.prototype.initialize = function() {
    var togglers = this.find();
    this.togglers = togglers;
    var self = this;
    for(name in togglers){
      var toggler = togglers[name];
      x$(toggler["button"]).click(this.construct_button_callback(toggler["content"]));

    }
  }

  window.TL = new ToggleLoader();
  window.addEventListener('load', function(){ TL.initialize();}, false);
})()
