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
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event",this.handleEvent);
      console.log("initializing carousel");
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
      console.log(this.container)

      x$(this.container).on("webkitAnimationEnd",function(){this.animation_in_progress = false});

      this.adjust_spacing();
      
    },
    translate: function(obj, x) {
      obj.style.webkitTransform = "translate3d(" + x + "px, 0px, 0px)";
    },
    adjust_spacing: function() {
      // Will need to be called if the container's size changes --> orientation change

      // I think the reason I'm seeing offsets is because I need to subtract out the width of these images...
      // So I guess I assume they're uniform width

      // This will have more logic for the multi-pane case
      var visible_width = this.container.offsetWidth;
      x$().iterate(
        x$(this.items).find("img"),
        function(image, i) {
          var previous_images_count = (i == 0) ? 0 : i-1;
          var offset = visible_width*(previous_images_count);
          if ( i != 0 ) {
            offset += visible_width - image.offsetWidth
          }
          translate(image, offset);
        }
      );
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
      console.log("started touch");
      var current_image = e.target;
      this.valid_touch = false;

      if(true) //this.good_target(e))
        stifle(e);
      
      this.touch_in_progress = true;
      // this.apply_current_offsets();
      var coords = this.get_event_coordinates(e);
      if(coords !== null)
      {
        this.start_pos = coords;
        var transform = window.getComputedStyle(this.items).webkitTransform;
        if (transform != "none") {
          transform = new WebKitCSSMatrix(transform);
          var x_transform = transform.m41;
        } else {
          console.log("no webkit transform");
          var x_transform = 0;
        }
        this.start = x_transform;
      }
      
/*      if (this.valid_touch == false)
      {
        //we know its a bad touch -- so animate back now
        e.touches = [];
        this.finish_swipe(e);
      }*/
      this.click = true;    
    },
    
    continue_swipe: function(e)
    {
      console.log("move touch");
      stifle(e);

//      if(this.valid_touch == false)
//        return

      if(!this.touch_in_progress)
        return

      var coords = this.get_event_coordinates(e);
      if(coords !== null)
      {
        this.end_pos = coords;
        var dist = this.swipe_dist() + this.start;
        translate(this.items, dist);
      }
      this.click = false;    
    },
    
    finish_swipe: function(e)
    {
      console.log("finished touch");
      if (true) //this.good_target(e))
        stifle(e);

      this.touch_in_progress = false;
      
      if(!this.touch || e.touches.length == 0)
      {    
        var distance_travelled = this.swipe_dist();
        
        if(this.click)
        {
	  // this.select_image(e);
	  this.click = false;
	  return;
        }
        
        swipe_magnitude = Math.abs(sw_dist);
        var sign = this.sign(distance_travelled);
//        var revert_direction = this.check_bounds(-1*sign);
        
//        this.apply_current_offsets();
//        this.destination_offset = window.innerWidth*sign+this.image_anchor_position;
        
        // this.destination_offset = this.container.offsetWidth*sign+this.start;
        var displacement = this.zero_ceil(distance_travelled/this.snap_width)*this.snap_width;
        console.log("displacement:", displacement);
        console.log("start:", this.start);
        this.destination_offset = displacement + this.start;

        console.log("destination:", this.destination_offset);
        

/*        if (revert_direction != 0)
        {
	  this.destination_offset = this.image_anchor_position;
        }
        else
        {
	  this.current_img_idx -= sign;
	  if(!this.parent_gallery)
	    this.set_count();
	  this.update_arrow_buttons();
        }*/

        // This works, but the momentum does not
        //translate(this.items, this.destination_offset);
        
        this.touch_in_progress = false;
        console.log("first momentum");
        this.momentum();      
      }

      if (this.parent_gallery)
        stifle(e);
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
        this.momentum_in_progress = false;
        return;
      }
      this.momentum_in_progress = true;
      
      var increment_flag = false;	
      var transform = window.getComputedStyle(this.items).webkitTransform;
      transform = new WebKitCSSMatrix(transform);
      var x_transform = transform.m41;
      console.log("current x pos:", x_transform);
      console.log("destination offset:", this.destination_offset);
      var distance = this.destination_offset - x_transform;
      console.log("distance to destination offset:", distance);
      var increment = distance - this.zero_floor(distance / 1.1);
      console.log("increment:",increment);

      if(increment != 0)
      {
        var amount = increment + x_transform;
        console.log("momentum:" + amount);
        this.items.style.webkitTransform = "translate3d(" + amount + "px, 0px, 0px)";
	increment_flag = true;
      }
      else
      {
/*	if(i==0)
	{
	  // this.image_anchor_position = x_transform;
	}*/
	// this.set_image_positions(i, x_transform);
        this.items.style.webkitTransform = "translate3d(" + x_transform + "px, 0px, 0px)";
	this.momentum_in_progress = false;
      }

      if(increment_flag)
      {
        setTimeout(function(obj){return function(){obj.momentum()}}(this),16);		    
      }
    },    
    swipe_dist: function()
    {
      if (this.end_pos == null)
        return 0;
      sw_dist = this.end_pos['x'] - this.start_pos['x'];
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

  window.addEventListener('load', function(){ console.log("woah");CL.initialize();}, false);

})();