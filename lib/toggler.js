(function(){
  function ToggleContentComponent (group, content_component) {
    // This is a 'collection' of components
    // -- if I see it again, I'll make this abstract
    if(group["content"] === undefined) {
      group["content"] = [];
    }
    group["content"].push(content_component);
  }

  function ToggleLoader(){
    this.component_constructors = {
      "content" : ToggleContentComponent
    };
  }

  ToggleLoader.prototype.find = function(){
    var togglers = x$().find_elements('toggler', this.component_constructors);
    var self=this;
    
    for(toggler_id in togglers) {
      var toggler = togglers[toggler_id];

      if (toggler["button"] === undefined) {
        console.log("Uranium Declaration Error: No button found for toggler with id=" + toggler_id);
        continue;
      }

      var toggler_state = x$(toggler["button"]).attr("data-ur-state")[0];
      if(toggler_state === undefined) {
        x$(toggler["button"]).attr("data-ur-state", 'disabled');
      } 

      if (toggler["content"] === undefined) {
        console.log("Uranium Declaration Error: No content found for toggler with id=" + toggler_id);
        continue;
      }

      // Make the content state match the button state
      x$().iterate(
	toggler["content"],
	function(content) {
	  if (x$(content).attr("data-ur-state")[0] === undefined ) {
            x$(content).attr("data-ur-state", toggler_state)
	  }
	}
      );

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
