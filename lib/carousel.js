(function(){

  function Carousel(components) {
    this.container = components["container"];
    this.items = components["items"];
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

  Carousel.prototype = {
    initialize: function() {
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event",this.handleEvent);
      console.log("initializing carousel");
      this.touch = false;
      if(xui.touch) {
	this.touch = true;
      }
      x$(this.container).attr("data-ur-touch", this.touch);      
      console.log(this.container)
      x$(this.container).on("touchstart",this.start_swipe);
      x$(this.container).on("touchmove",this.continue_swipe);
      x$(this.container).on("touchend",this.finish_swipe);
      x$(this.container).on("webkitAnimationEnd",function(){this.animation_in_progress = false});
      
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
      if(e.touches.length == 1)
      {
        this.start_pos = {x: e.touches[0].clientX, y: e.touches[0].clientY};
      }
      
      if (this.valid_touch == false)
      {
        //we know its a bad touch -- so animate back now
        e.touches = [];
        this.finish_swipe(e);
      }
      this.click = true;    
    },
    
    continue_swipe: function(e)
    {
      console.log("move touch");
      stifle(e);

      if(this.valid_touch == false)
        return

      if(e.touches.length == 1) // && this.image_ids.length > 1)
      {
        this.end_pos = {x: e.touches[0].clientX, y: e.touches[0].clientY};	  
        
	  // this.set_image_offsets(i,this.swipe_dist());
        var transform = window.getComputedStyle(this.container).webkitTransform;
        transform = new WebKitCSSMatrix(transform);
        var x_transform = transform.m41;
        
        var dist = this.swipe_dist() + this.container.style.left; //use x_transform if inadequate
        this.container.style.webkitTransform = "translate3d(" + dist + "px, 0px, 0px)";
      }
      this.click = false;    
    },
    
    finish_swipe: function(e)
    {
      console.log("finished touch");
      if (true) //this.good_target(e))
        stifle(e);

      this.touch_in_progress = false;
      
      if(e.touches.length == 0)
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
        this.destination_offset = window.innerWidth*sign+this.image_anchor_position;
        
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
        
        this.momentum();      
      }

      if (this.parent_gallery)
        stifle(e);
    },
    sign: function(v) 
    { 
      return (v >= 0) ? 1 : -1;
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
      var transform = window.getComputedStyle(this.container).webkitTransform;
      transform = new WebKitCSSMatrix(transform);
      var x_transform = transform.m41;
      var distance = this.destination_offset - x_transform;
      var increment = distance - this.zero_floor(distance / 1.1);
      
      for(var i = 0; i < this.images.length; i++)
      {
        if(increment != 0)
        {
	  this.set_image_offsets(i,increment+x_transform-this.get_image_positions(i));
	  increment_flag = true;
        }
        else
        {
	  if(i==0)
	  {
	    this.image_anchor_position = x_transform;
	  }
	  this.set_image_positions(i, x_transform);
	  this.momentum_in_progress = false;
        }
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
    for (name in carousels) {
      var carousel = carousels[name];
      var c = new Carousel(carousel);
    }
  }

  CL = new CarouselLoader();

  window.addEventListener('load', function(){ console.log("woah");CL.initialize();}, false);

})();