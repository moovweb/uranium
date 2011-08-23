console.log("charlie brown rules u know it yeah");
/* Carousel  *
 * * * * * * *
 * The carousel is a widget to allow for horizontally scrolling (with touch or  
 * buttons) between a set of items. 
 * 
 * The only assumption is about the items' style -- they must be (float: left) 
 * and (display:inline-block) so that the real width can be accurately totalled.
 * 
 */

Ur.WindowLoaders['carousel'] = (function(){

  function Carousel(components) {
    this.container = components["view_container"];
    this.items = components["scroll_container"];
    if (this.items.length == 0) {
      console.log("Error -- carousel missing item components");
      return false;
    }

    // Optionally:
    this.button = (components["button"] === undefined) ? {} : components["button"];
    this.count = components["count"]; 
    this.multi = x$(components["view_container"]).attr("data-ur-type")[0] == "multi";
    this.initialize();
    this.onSlideCallbacks = [];
  }

  // Private/Helper methods

  function get_real_width(elem) {
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

  function sign(v) 
  { 
    return (v >= 0) ? 1 : -1;
  }

  function zero_ceil(num) {
    return (num <= 0) ? Math.floor(num) : Math.ceil(num);
  }

  function zero_floor(num)
  {
    return (num >= 0) ? Math.floor(num) : Math.ceil(num);
  }

  function stifle(e)
  {
    e.preventDefault();
    e.stopPropagation();
  }

  function translate(obj, x) {
    obj.style.webkitTransform = "translate3d(" + x + "px, 0px, 0px)";
  }

  //// Public Methods ////

  Carousel.prototype = {
    initialize: function() {
      // TODO:
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event",this.handleEvent);

      var touch_enabled = x$(this.container).attr("data-ur-touch")[0];
      touch_enabled = (touch_enabled === undefined) ? true : (touch_enabled == "enabled" ? true : false);
      x$(this.container).attr("data-ur-touch", touch_enabled ? "enabled" : "disabled");      

      if (touch_enabled) {
        if(xui.touch) {
          this.touch = true;
          x$(this.items).on("touchstart",(function(obj){return function(e){obj.start_swipe(e)};})(this));
          x$(this.items).on("touchmove",(function(obj){return function(e){obj.continue_swipe(e)};})(this));
          x$(this.items).on("touchend",(function(obj){return function(e){obj.finish_swipe(e)};})(this));
        } else {
          this.touch = false;
          x$(this.items).on("mousedown",(function(obj){return function(e){obj.start_swipe(e)};})(this));
          x$(this.items).on("mousemove",(function(obj){return function(e){obj.continue_swipe(e)};})(this));
          x$(this.items).on("mouseup",(function(obj){return function(e){obj.finish_swipe(e)};})(this));
        }
      }

      x$(this.button["prev"]).on("click", (function(obj){return function(){obj.move_to(obj.magazine_count)};})(this));
      x$(this.button["next"]).on("click", (function(obj){return function(){obj.move_to(-obj.magazine_count)};})(this));

      this.item_index = 0;
      this.magazine_count = 1;
      this.adjust_spacing();
      this.update_index(0);
      
      // Expose this function globally: (this will work on webkit / FF)
      this.jump_to_index = (function(obj) { return function(idx) { obj.__proto__.move_to_index.call(obj, idx); };})(this);

      window.setInterval(function(obj){return function(){obj.resize();}}(this),1000);
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

    resize: function(){
      // When I have multi-item carousels, I'll just need to need to make a calculate_snap_width method
      if (this.snap_width != this.container.offsetWidth) {
        this.adjust_spacing();
      }
    },
      
    adjust_spacing: function() {
      // Will need to be called if the container's size changes --> orientation change
      var visible_width = this.container.offsetWidth;

      if (this.old_width !== undefined && this.old_width == visible_width) {
        return
      }
      this.old_width = visible_width;

      var cumulative_offset = 0;
      var items = x$(this.items).find("[data-ur-carousel-component='item']");
      this.item_count = items.length;

      // Adjust the container to be the necessary width.
      // I have to do this because the alternative is assuming the container expands to its full width (display:table-row) which is non-standard if the container isn't a <tr>
      var total_width = 0;
      x$().iterate(
        items,
        function(item) {
          total_width += get_real_width(item);
        }
      );

      this.items.style.width = total_width + "px";

      // For the multi-pane case --> I'll set the snap_width to the width of a single element
      this.snap_width = visible_width;

      if(this.multi) {
        var item_width = get_real_width(items[0]); // I'm making an assumption here that all items have the same width
        var magazine_count = Math.floor(visible_width / item_width);

        magazine_count = (magazine_count > this.item_count) ? this.item_count : magazine_count;
        this.magazine_count = magazine_count;

        var space = (visible_width - magazine_count*item_width);
        this.snap_width = space / (magazine_count - 1) + item_width;
        this.last_index = this.item_count - this.magazine_count;
      } else { 
        this.last_index = this.item_count - 1;
      }

      this.item_index = (this.last_index < this.item_index) ? this.last_index : this.item_index;
      cumulative_offset -= this.snap_width*this.item_index; // initial offset
      translate(this.items, cumulative_offset);
      var cumulative_item_offset = 0;

      if (this.multi) {
        x$().iterate(
          items,
          function(item, i) {
            var offset = cumulative_item_offset;
            if ( i != 0 ) {
              offset += space/(magazine_count - 1);
            }
            translate(item, offset);
            cumulative_item_offset = offset;
          }
        );
        this.update_index(this.item_index);
      } else {
        // Single Pane
        x$().iterate(
          items,
          function(item, i) {
            var offset = cumulative_item_offset;
            if ( i != 0 ) {
              offset += visible_width - items[i-1].offsetWidth;
            }
            translate(item, offset);
            cumulative_item_offset = offset;
          }
        );
      }
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

    update_buttons: function() {
      if(this.item_index == 0) {
        x$(this.button["prev"]).attr("data-ur-state","disabled")
        x$(this.button["next"]).attr("data-ur-state","enabled")
      } else if (this.item_index == this.last_index) {
        x$(this.button["next"]).attr("data-ur-state","disabled")
        x$(this.button["prev"]).attr("data-ur-state","enabled")
      } else {
        x$(this.button["next"]).attr("data-ur-state","enabled")
        x$(this.button["prev"]).attr("data-ur-state","enabled")
      }
    },

    get_new_index: function(direction) {
      var new_idx = this.item_index - direction;

      if(new_idx > this.last_index) {
        new_idx = this.last_index;
      } else if (new_idx < 0) {
        new_idx = 0;
      }

      return new_idx;
    },

    update_index: function(new_index) {
      if (new_index === undefined) { 
        return
      }

      this.item_index = new_index;
      if (this.item_index < 0) {
        this.item_index = 0;
      } else if(this.item_index > this.last_index) {
        this.item_index = this.last_index - 1;
      }
      
      if(this.count !== undefined) {
        if(this.multi) {
          this.count.innerHTML = this.item_index + 1 + " to " + (this.item_index + this.magazine_count) +" of " + this.item_count;
        } else {
          this.count.innerHTML = this.item_index + 1 + " of " + this.item_count;
        }
      }
      
      // TODO: Update to work w multipane
      var active_item = x$(this.items).find("*[data-ur-carousel-component='item'][data-ur-state='active']");
      active_item.attr("data-ur-state","inactive");
      var new_active_item = x$(this.items).find("*[data-ur-carousel-component='item']")[this.item_index];
      x$(new_active_item).attr("data-ur-state","active");

      this.update_buttons();
    },

    start_swipe: function(e)
    {
      this.touch_in_progress = true; // For non-touch environments
      var coords = this.get_event_coordinates(e);
      this.swipe_id = parseInt(Math.random()*100);
      console.log("start swipe(" + this.swipe_id + ")");

      console.log("this.starting_offset(" + this.swipe_id + "):"+this.starting_offset);
      if(coords !== null)
      {
//        this.start_pos = coords;
        var x_transform = this.get_transform(this.items);
        console.log(!this.starting_offset);
        if(this.starting_offset === undefined) {
          // When its undefined its the first swipe and we need to set this guy
          console.log("first swipe!");
          console.log(x_transform);
          this.starting_offset = 0;
          this.start_pos = coords;
        } else if (this.starting_offset === null) {
          console.log("finished previous swipe");
          this.starting_offset = x_transform;
          this.start_pos = coords;
        } else {
          // Fast swipe
          this.is_fast_swipe = true; //to cancel momentum
          this.starting_offset = x_transform + this.swipe_dist(); // Take into account last swipe
          this.start_pos = coords;
        }
      }
      this.click = true;
    },
    
    continue_swipe: function(e)
    {
      stifle(e);

      if(!this.touch_in_progress) // For non-touch environments
        return

//      console.log("continue swipe(" + this.swipe_id + ")");

      var coords = this.get_event_coordinates(e);
      if(coords !== null)
      {
        this.end_pos = coords;
        var dist = this.swipe_dist() + this.starting_offset;
/*        var dist = this.swipe_dist();
        if(this.is_fast_swipe) {
          console.log("fast swipe offset");
          dist += this.get_transform(this.items);
        } else {
          console.log("normal swipe offset");
          dist += this.starting_offset;
        }
*/
        translate(this.items, dist);
      }
      this.click = false;    
    },
    
    finish_swipe: function(e)
    {      
      if(!this.click) {
        stifle(e);
      }

      this.touch_in_progress = false; // For non-touch environments
      
      if(!this.touch || e.touches.length == 0)
      {    
        console.log("finish swipe(" + this.swipe_id + ")");
        this.is_fast_swipe = false; // Try to animate
//        console.log("sw dist:" + swipe_distance);
        this.move_helper(this.get_displacement_index());
      }
    },
    get_displacement_index: function() {
      var swipe_distance = this.swipe_dist();
      var displacement_index = 0;
      
//      console.log("old fast_swipes:" + this.fast_swipes);

//      if(!this.fast_swipes) {
//        console.log("first swipe in cluster");
        this.fast_swipes = zero_ceil(swipe_distance/this.snap_width);
//      } else {
//        console.log("non-first swipe in cluster!");
//        this.fast_swipes += zero_ceil(swipe_distance/this.snap_width);
//      }

//      console.log("new fast_swipes:" + this.fast_swipes);

      if (this.multi) {
        // Sigmoid FTW:
        var range = this.magazine_count;
        var range_offset = range/2.0;
        displacement_index = zero_ceil( 1/(1 + Math.pow(Math.E,-1.0*swipe_distance)) * range - range_offset);
      } else {
//        displacement_index = zero_ceil(swipe_distance/this.snap_width);
        displacement_index = zero_ceil(this.fast_swipes);
      }

      return displacement_index;
    },
    snap_to: function(displacement) {
      this.destination_offset = displacement + this.starting_offset;        
      var max_offset = -1*(this.last_index)*this.snap_width;

      if ( this.destination_offset < max_offset || this.destination_offset > 0 ) {
        if (Math.abs(this.destination_offset - max_offset) < 1) {
          // Hacky -- but there are rounding errors
          // I see this when I'm in multi-mode and using the buttons
          // This only seems to happen on the desktop browser -- ideally its removed at compile time
          this.destination_offset = max_offset;
        } else {
          this.destination_offset = this.starting_offset;
        }
      }
      
      this.momentum();  
    },

    move_to: function(direction) {
      if (this.increment_flag) {
        // The animation isnt done yet
        return
      }
      this.starting_offset = this.get_transform(this.items);
      var new_idx = this.item_index - direction;
      this.move_helper(direction);
    },

    move_helper: function(direction){
//      console.log("move helper(" + this.swipe_id + ")");
      console.log("direction:" + direction);
      var new_idx = this.get_new_index(direction);

      var new_item = x$(this.items).find("*[data-ur-carousel-component='item']")[new_idx];
      var current_item = x$(this.items).find("*[data-ur-carousel-component='item']")[this.item_index];

      var offset = this.get_transform(current_item) - this.get_transform(new_item);
      var displacement = current_item.offsetLeft - new_item.offsetLeft + offset;

      console.log("displacement:" + displacement);

      this.snap_to(displacement);
      this.update_index(new_idx);
    },

    move_to_index: function(index) {
      var direction = this.item_index - index;
      this.move_to(direction);
    },

    momentum: function()
    {
      if (this.touch_in_progress)
      {
        return;
      }     

      this.increment_flag = false;	

      if(this.is_fast_swipe) {
        // Is this necessary? I dont see it being called ... 
        console.log("momentum cancelled by fast swipe");
        return;
      }

      var x_transform = this.get_transform(this.items);
      var distance = this.destination_offset - x_transform;
      var increment = distance - zero_floor(distance / 1.1);

//      console.log("momentum(" + this.swipe_id + "):" + increment);

      // Hacky -- this is for the desktop browser only -- to fix rounding errors
      // Ideally, this is removed at compile time
      if(Math.abs(increment) < 0.01) {
        increment = 0;
      } 

      translate(this.items, increment + x_transform);

      if(increment != 0)
      {
	this.increment_flag = true;
      }

      if(this.increment_flag)
      {
        setTimeout(function(obj){return function(){obj.momentum()}}(this),16);		    
      } else {
        console.log("starting offset (" + this.swipe_id + "):" + this.starting_offset);
        this.starting_offset = null;
        this.fast_swipes = null;
        this.is_fast_swipe = false; 
        x$().iterate(
          this.onSlideCallbacks,
          function(callback) {
            callback();
          }
        );
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

  // Private constructors
  var ComponentConstructors = {
    "button": function(group, component, type) {
      if (group["button"] === undefined) {
        group["button"] = {};
      }
      
      var type = x$(component).attr("data-ur-carousel-button-type")[0];
      if(type === undefined) {
        // Declaration error
        console.log("Uranium declaration error: Malformed carousel button type on:" + component.outerHTML);
      }

      group["button"][type] = component;

      // Maybe in the future I'll make it so any of the items can be the starting item
      if (type == "prev") {
        x$(component).attr("data-ur-state","disabled");
      } else {
        x$(component).attr("data-ur-state","enabled");
      }

    }
  }

  function CarouselLoader(){}
  
  CarouselLoader.prototype.initialize = function(fragment) {
    var carousels = x$(fragment).find_elements('carousel', ComponentConstructors);
    Ur.Widgets["carousel"] = {};
    for (var name in carousels) {
      var carousel = carousels[name];
      Ur.Widgets["carousel"][name] = new Carousel(carousel);
      x$(carousel["set"]).attr("data-ur-state","enabled");
    }
  }

  return CarouselLoader;
})();