(function(){

  function Carousel(components) {
    console.log("components:",components);
    this.container = components["view_container"];
    this.items = components["scroll_container"];
    // Optionally:
    this.buttons = components["buttons"];
    this.counter = components["counter"]; 
    console.log("container:",this.container);
    this.initialize();
  }

  // Private/Helper methods

  function getRealWidth(elem) {
    elem = x$(elem);
    var total = 0;
    var styles = ["width", "padding-left", "padding-right", "margin-left", "margin-right", "border-left-width", "border-right-width"];

    x$().iterate(
      styles,
      function(style) {
        total += parseInt(elem.getStyle(style));
      }
    );

    return total;
  }

  function stifle(e)
  {
    e.preventDefault();
    e.stopPropagation();
  }

  // Here for convenience -- consolidate later
  function translate(obj, x) {
    obj.style.webkitTransform = "translate3d(" + x + "px, 0px, 0px)";
  }

  //// Public Methods ////

  Carousel.prototype = {
    initialize: function() {
      // TODO:
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event",this.handleEvent);

      this.touch = false;
      if(xui.touch) {
	this.touch = true;
        x$(this.container).on("touchstart",(function(obj){return function(e){obj.start_swipe(e)};})(this));
        x$(this.container).on("touchmove",(function(obj){return function(e){obj.continue_swipe(e)};})(this));
        x$(this.container).on("touchend",(function(obj){return function(e){obj.finish_swipe(e)};})(this));
      } else {
        x$(this.container).on("mousedown",(function(obj){return function(e){obj.start_swipe(e)};})(this));
        x$(this.container).on("mousemove",(function(obj){return function(e){obj.continue_swipe(e)};})(this));
        x$(this.container).on("mouseup",(function(obj){return function(e){obj.finish_swipe(e)};})(this));
      }
      x$(this.container).attr("data-ur-touch", this.touch);      

      this.adjust_spacing();
    },

    translate: function(obj, x) {
      obj.style.webkitTransform = "translate3d(" + x + "px, 0px, 0px)";
    },

    get_transform: function(obj) {
      var transform = window.getComputedStyle(obj).webkitTransform;
      if (transform != "none") {
        transform = new WebKitCSSMatrix(transform);
        return transform.m41;
      } else {
        console.log("no webkit transform");
        return 0;
      }
    },

    adjust_spacing: function() {
      // Will need to be called if the container's size changes --> orientation change

      var visible_width = this.container.offsetWidth;
      var cumulative_offset = 0;
      var items = x$(this.items).find("[data-ur-carousel-component='item']");
      this.item_count = items.length;
      x$().iterate(
        items,
        function(item, i) {
          var offset = cumulative_offset;
          if ( i != 0 ) {
            offset += visible_width - items[i-1].offsetWidth;
          }
          translate(item, offset);
          cumulative_offset = offset;
        }
      );

      // For the multi-pane case --> I'll set the snap_width to the width of a single element
      this.snap_width = visible_width;

    },

    get_event_coordinates: function(e) {
      if(this.touch) {
        if(e.touches.length == 1)
        {
          return {x: e.touches[0].clientX, y: e.touches[0].clientY};
        }
      } else {
        return {x: e.clientX, y: e.clientY};
      }
      return null;
    },

    start_swipe: function(e)
    {
      if(this.increment_flag)
        return false;

      console.log("started touch");

      this.touch_in_progress = true; // For non-touch environments

      var coords = this.get_event_coordinates(e);
      if(coords !== null)
      {
        this.start_pos = coords;
        var x_transform = this.get_transform(this.items);
        this.starting_offset = x_transform;
      }
      this.click = true;
    },
    
    continue_swipe: function(e)
    {
      console.log("move touch");
      stifle(e);

      if(!this.touch_in_progress) // For non-touch environments
        return

      var coords = this.get_event_coordinates(e);
      if(coords !== null)
      {
        this.end_pos = coords;
        var dist = this.swipe_dist() + this.starting_offset;
        translate(this.items, dist);
      }
      this.click = false;    
    },
    
    finish_swipe: function(e)
    {
      console.log("finished touch");
      if(!this.click)
        stifle(e);

      this.touch_in_progress = false; // For non-touch environments
      
      if(!this.touch || e.touches.length == 0)
      {    
        var swipe_distance = this.swipe_dist();
        var sign = this.sign(swipe_distance);
        
        var displacement = this.zero_ceil(swipe_distance/this.snap_width)*this.snap_width;
        this.destination_offset = displacement + this.starting_offset;        

        if ( this.destination_offset < -1*(this.item_count - 1)*this.snap_width || this.destination_offset > 0 ) {
          console.log("boundary!");
          this.destination_offset = this.starting_offset;
        }
        
        this.momentum();      
      }
    },

    sign: function(v) 
    { 
      return (v >= 0) ? 1 : -1;
    },

    zero_ceil: function(num) {
      return (num <= 0) ? Math.floor(num) : Math.ceil(num);
    },

    zero_floor: function(num)
    {
      return (num >= 0) ? Math.floor(num) : Math.ceil(num);
    },

    momentum: function()
    {
      if (this.touch_in_progress)
      {
        return;
      }
      
      this.increment_flag = false;	
      var x_transform = this.get_transform(this.items);
      var distance = this.destination_offset - x_transform;
      var increment = distance - this.zero_floor(distance / 1.1);

      translate(this.items, increment + x_transform);

      if(increment != 0)
      {
	this.increment_flag = true;
      }

      if(this.increment_flag)
      {
        setTimeout(function(obj){return function(){obj.momentum()}}(this),16);		    
      }
    },    

    swipe_dist: function()
    {
      if (this.end_pos === undefined)
        return 0;
      var sw_dist = this.end_pos['x'] - this.start_pos['x'];
      return sw_dist;
    }
  }

  function CarouselLoader(){}
  
  CarouselLoader.prototype.initialize = function() {
    var carousels = x$().find_elements('carousel');
    this.carousels = {};
    for (name in carousels) {
      var carousel = carousels[name];
      this.carousels[name] = new Carousel(carousel);
    }
  }

  CL = new CarouselLoader();

  window.addEventListener('load', function(){ CL.initialize(); }, false);

})();