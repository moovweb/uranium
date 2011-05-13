(function(){
  function ToggleLoader(){}

  ToggleLoader.prototype.find = function(){
    var togglers = x$().find_elements('toggler');
    var self=this;
    
    for(toggler_id in togglers) {
      var toggler = togglers[toggler_id];
      var toggler_state = x$(toggler["button"]).attr("data-ur-state");
      if(toggler_state === undefined) {
        x$(toggler["button"]).attr("data-ur-state", 'disabled');
      } 
      
      //TODO: Account for multiple content elements

      // Make the content state match the button state
      if (x$(toggler["content"]).attr("data-ur-state")[0] === undefined ) {
        x$(toggler["content"]).attr("data-ur-state", toggler_state)
      }

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

      x$().iterate(
        contents,
        function(content){
          var current_state = x$(content).attr("data-ur-state")[0];
          var new_state = current_state === "enabled" ? "disabled" : "enabled";
          x$(content).attr("data-ur-state", new_state);
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
