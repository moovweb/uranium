(function(){

  function Carousel(components) {
    this.container = componenets["container"];
    this.items = components["items"];
    // Optionally:
    this.buttons = components["buttons"];
    this.counter = components["counter"]; 
  }

  // Private/Helper methods

  function getRealWidth(elem) {
    elem = x$(elem);
    return elem.getComputedStyle("width") + elem.getComputedStyle("padding-left") ; // ...;
  }

  Carousel.prototype = {
    initialize: function() {
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event",this.handleEvent);

      this.touch = false;
      if(xui.touch) {
	this.touch = true;
      }
      x$(this.container).attr("data-ur-touch", this.touch);

      

    },
    drag: function(event) {
      
    },
    release: function(event) {
      // Calculate the momentum and which 'item we need to land on
      var container_width = x$(this.container).getStyle("width");
      // Assume that each item
      
    }
  }


})();