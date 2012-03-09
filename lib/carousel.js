/* Carousel  *
 * * * * * * *
 * The carousel is a widget to allow for horizontally scrolling
 * (with touch or buttons) between a set of items.
 * 
 * The only assumption is about the items' style -- they must be
 * float: left; so that the real width can be accurately totalled.
 */

Ur.WindowLoaders["carousel"] = (function() {
  function Carousel(components) {
    this.container = components["view_container"];
    this.items = components["scroll_container"];
    if (this.items.length == 0) {
      Ur.error("carousel missing item components");
      return false;
    }

    // Optionally:
    this.button = (components["button"] === undefined) ? {} : components["button"];
    this.count = components["count"]; 
    this.multi = x$(components["view_container"]).attr("data-ur-type")[0] == "multi";
    this.verticalScroll = x$(components["set"]).attr("data-ur-vertical-scroll")[0] == "enabled";

    this.initialize();
    this.onSlideCallbacks = [];
  }

  // Private/Helper methods
  
  function sign(v) 
  { 
    return (v >= 0) ? 1 : -1;
  }

  function zeroCeil(num) {
    return (num <= 0) ? Math.floor(num) : Math.ceil(num);
  }

  function zeroFloor(num) {
    return (num >= 0) ? Math.floor(num) : Math.ceil(num);
  }

  function stifle(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // translate3d is disabled on Android by default because it often causes problems
  // however, on some pages translate3d will work fine so the data-ur-android3d
  // attribute can be set to "enabled" to use translate3d since it can be faster
  // on some Android devices

  var oldAndroid = navigator.userAgent.match(/Android [12]/);
  var no3d = oldAndroid; // TODO: add an actual translate3d test
  var translatePrefix = no3d ? "translate(" : "translate3d(";
  var translateSuffix = no3d ? ")" : ", 0px)";

  function translate(obj, x) {
    obj.style.webkitTransform = obj.style.MozTransform = obj.style.oTransform = obj.style.transform = translatePrefix + x + "px, 0px" + translateSuffix;
  }

  //// Public Methods ////

  Carousel.prototype = {
    initialize: function() {
      // TODO:
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event",this.handleEvent);

      if (this.container.getAttribute("data-ur-android3d") == "enabled" && oldAndroid) {
        translatePrefix = "translate3d(";
        translateSuffix = ", 0px)";
      }


      var touchEnabled = this.container.getAttribute("data-ur-touch") != "disabled";
      x$(this.container).attr("data-ur-touch", touchEnabled ? "enabled" : "disabled");

      if (touchEnabled) {
        if (document.ontouchstart) {
          this.touch = true;
          x$(this.items).touchstart(function(obj){return function(e){obj.startSwipe(e)};}(this));
          x$(this.items).touchmove(function(obj){return function(e){obj.continueSwipe(e)};}(this));
          x$(this.items).touchend(function(obj){return function(e){obj.finishSwipe(e)};}(this));
        } else {
          this.touch = false;
          x$(this.items).on("mousedown", function(obj){return function(e){obj.startSwipe(e)};}(this));
          x$(this.items).on("mousemove", function(obj){return function(e){obj.continueSwipe(e)};}(this));
          x$(this.items).on("mouseup", function(obj){return function(e){obj.finishSwipe(e)};}(this));
        }
      }

      x$(this.button["prev"]).click(function(obj){return function(){obj.moveTo(obj.magazineCount);}}(this));
      x$(this.button["next"]).click(function(obj){return function(){obj.moveTo(-obj.magazineCount);}}(this));

      this.itemIndex = 0;
      this.magazineCount = 1;

      this.infinite = !(this.container.getAttribute("data-ur-infinite") == "disabled");
      x$(this.container).attr("data-ur-infinite", this.infinite ? "enabled" : "disabled");

      if (this.infinite) {
        var items = x$(this.items).find("[data-ur-carousel-component='item']");
        this.realItemCount = items.length;
        this.itemIndex = this.cloneLength = 2;
        this.clones = []; // probaby useless
        for (var i = 0; i < this.cloneLength; i++) {
          var clone = items[i].cloneNode(true);
          this.clones.push(clone);
          x$(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          this.items.appendChild(clone);
        }
        
        for (var i = items.length - this.cloneLength; i < items.length; i++) {
          var clone = items[i].cloneNode(true);
          this.clones.push(clone);
          x$(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          this.items.insertBefore(clone, items[0]);
        }
      }

      this.adjustSpacing();

      this.updateIndex(this.infinite ? this.cloneLength : 0);

      // Expose this function globally: (this will work on webkit / FF)
      this.jumpToIndex = (function(obj) { return function(idx) { obj.__proto__.moveToIndex.call(obj, idx); };})(this);

      x$(window).orientationchange(function(obj){return function(){obj.resize();}}(this));
      // orientationchange isn't supported on some androids
      x$(window).on("resize", function(obj) { return function() {
        obj.resize();
        setTimeout(function(){obj.resize()}, 100);
      }}(this));
      //window.setInterval(function(obj){return function(){obj.resize();}}(this),1000);

      this.flag = {touched: false, timeoutId: null};

      this.autoscroll = !(this.container.getAttribute("data-ur-autoscroll") == "disabled");
      x$(this.container).attr("data-ur-autoscroll", this.autoscroll ? "enabled" : "disabled");

      this.autoscrollDelay = this.container.getAttribute("data-ur-autoscroll-delay");
      if (this.autoscrollDelay == null) {
        this.autoscrollDelay = 5000;
        x$(this.container).attr("data-ur-autoscroll-timing", this.autoscrollDelay);
      }

      this.autoscrollDir = this.container.getAttribute("data-ur-autoscroll-direction");
      if (this.autoscrollDir != "prev")
        this.autoscrollDir = "next";

      x$(this.container).attr("data-ur-autoscroll-direction", this.autoscrollDir);

      this.autoscrollStart();
    },

    getTranslateX: function(obj) {
      var style = getComputedStyle(obj);
      var transform = style["webkitTransform"] || style["MozTransform"] || style["oTransform"] || style["transform"];
      if (transform != "none") {
        if (window.WebKitCSSMatrix)
          return new WebKitCSSMatrix(transform).m41;
        else
          return parseInt(transform.split(",")[4]);
      } else {
        Ur.error("no transform found");
        return 0;
      }
    },

    resize: function() {
      // When I have multi-item carousels, I'll just need to need to make a calculate_snapWidth method
      if (this.snapWidth != this.container.offsetWidth)
        this.adjustSpacing();
    },
    
    adjustSpacing: function() {
      // Will need to be called if the container's size changes --> orientation change
      var visibleWidth = this.container.offsetWidth;
      
      if (this.oldWidth !== undefined && this.oldWidth == visibleWidth)
        return;
      var oldSnapWidth = this.snapWidth;
      this.oldWidth = visibleWidth;
      
      var cumulativeOffset = 0;
      var items = x$(this.items).find("[data-ur-carousel-component='item']");
      this.itemCount = items.length;

      // Adjust the container to be the necessary width.
      // I have to do this because the alternative is assuming the container expands to its full width (display:table-row) which is non-standard if the container isn't a <tr>
      var totalWidth = 0;
      for (var i = 0; i < items.length; i++)
        totalWidth += items[i].offsetWidth;
      
      this.items.style.width = totalWidth + "px";
      
      // For the multi-pane case --> I'll set the snapWidth to the width of a single element
      this.snapWidth = visibleWidth;
      
      if (this.multi) {
        var itemWidth = items[0].offsetWidth; // I'm making an assumption here that all items have the same width
        var magazineCount = Math.floor(visibleWidth / itemWidth);
        
        magazineCount = (magazineCount > this.itemCount) ? this.itemCount : magazineCount;
        this.magazineCount = magazineCount;
        
        var space = (visibleWidth - magazineCount*itemWidth);
        this.snapWidth = space / (magazineCount - 1) + itemWidth;
        this.lastIndex = this.itemCount - this.magazineCount;
      } else
        this.lastIndex = this.itemCount - 1;
      
      this.preCoords = {x: 0, y: 0};
      
      this.itemIndex = (this.lastIndex < this.itemIndex) ? this.lastIndex : this.itemIndex;
      
      cumulativeOffset -= items[this.itemIndex].offsetLeft; // initial offset
      var centerOffset = parseInt((this.snapWidth - items[0].offsetWidth)/2);
      cumulativeOffset += centerOffset; // CHECK
      
      if (oldSnapWidth) {
        this.destinationOffset = cumulativeOffset;
        translate(this.items, this.getTranslateX(this.items) + parseInt((this.snapWidth - oldSnapWidth)/2));
      } else
        translate(this.items, cumulativeOffset);
      
      var cumulativeItemOffset = 0;
      
      if (this.multi) {
        x$().iterate(
          items,
          function(item, i) {
            var offset = cumulativeItemOffset;
            if ( i != 0 ) {
              offset += space/(magazineCount - 1);
            }
            translate(item, offset);
            cumulativeItemOffset = offset;
          }
        );
        this.updateIndex(this.itemIndex);
      }
    },

    autoscrollStart: function() {
      if (!this.autoscroll)
        return;
      
      var self = this;
      self.flag.timeoutId = setTimeout(function() {
        self.moveTo(self.autoscrollDir == "next" ? -self.magazineCount : self.magazineCount);
      }, self.autoscrollDelay);
    },

    autoscrollStop: function() {
      clearTimeout(this.flag.timeoutId);
    },

    getEventCoords: function(e) {
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

    updateButtons: function() {
      if(this.itemIndex == 0) {
        x$(this.button["prev"]).attr("data-ur-state","disabled")
        x$(this.button["next"]).attr("data-ur-state","enabled")
      } else if (this.itemIndex == this.lastIndex) {
        x$(this.button["next"]).attr("data-ur-state","disabled")
        x$(this.button["prev"]).attr("data-ur-state","enabled")
      } else {
        x$(this.button["next"]).attr("data-ur-state","enabled")
        x$(this.button["prev"]).attr("data-ur-state","enabled")
      }
    },

    getNewIndex: function(direction) {
      var newIndex = this.itemIndex - direction;
      
      if(newIndex > this.lastIndex)
        newIndex = this.lastIndex;
      else if (newIndex < 0)
        newIndex = 0;
      
      return newIndex;
    },

    updateIndex: function(newIndex) {
      if (newIndex === undefined)
        return;

      this.itemIndex = newIndex;
      if (this.itemIndex < 0)
        this.itemIndex = 0;
      else if (this.itemIndex > this.lastIndex)
        this.itemIndex = this.lastIndex - 1;
      
      if (this.count !== undefined) {
        if (this.multi)
          this.count.innerHTML = this.itemIndex + 1 + " to " + (this.itemIndex + this.magazineCount) +" of " + this.itemCount;
        else if (this.infinite) {
          var realIndex = (this.realItemCount + this.itemIndex - this.cloneLength) % this.realItemCount;
          this.count.innerHTML = realIndex + 1 + " of " + this.realItemCount;
        }
        else
          this.count.innerHTML = this.itemIndex + 1 + " of " + this.itemCount;
      }
      
      // TODO: Update to work w multipane
      var activeItem = x$(this.items).find("[data-ur-carousel-component='item'][data-ur-state='active']");
      activeItem.attr("data-ur-state", "inactive");
      var newActiveItem = x$(this.items).find("[data-ur-carousel-component='item']")[this.itemIndex];
      x$(newActiveItem).attr("data-ur-state", "active");

      this.updateButtons();
    },

    startSwipe: function(e) {
      this.flag.touched = true;
      stifle(e);
      this.autoscrollStop();

      this.touchInProgress = true; // For non-touch environments
      var coords = this.getEventCoords(e);

      if (coords !== null) {
        var translateX = this.getTranslateX(this.items);

        if (this.startingOffset === undefined || this.startingOffset === null) {
          this.startingOffset = translateX;
          this.startPos = coords;
        } else {
          // Fast swipe
          this.startingOffset = this.destinationOffset; //Factor incomplete previous swipe
          this.startPos = coords;
        }
      }
      this.click = true;
    },
    
    continueSwipe: function(e) {
      var coords = this.getEventCoords(e);
      
      if (this.verticalScroll) {
        if (this.lock) {
          if (this.lock == "y")
            return;
        }
        else if (Math.abs(this.preCoords.y - coords.y) > 7) {
          this.lock = "y";
          return;
        }
        else if (Math.abs(this.preCoords.x - coords.x) > 5)
          this.lock = "x";
        else
          return;
      }
      stifle(e);
      
      if (!this.touchInProgress) // For non-touch environments
        return;

      var coords = this.getEventCoords(e);
      if (coords !== null) {
        this.endPos = coords;
        var dist = this.swipeDist() + this.startingOffset;
        
        
        
        if (this.infinite) {
          var items = x$(this.items).find("[data-ur-carousel-component='item']");
          var startLimit = items[this.cloneLength - 1].offsetLeft; // almost at the beginning of carousel
          var endLimit = items[this.itemCount - this.cloneLength - 1].offsetLeft; // almost at the end of carousel
          
          if (dist >= -startLimit) {
            //this.itemIndex = this.itemCount - this.cloneLength;
            this.startingOffset -= items[this.lastIndex - this.cloneLength].offsetLeft - items[this.cloneLength - 1].offsetLeft;
            dist -= items[this.lastIndex - this.cloneLength].offsetLeft - items[this.cloneLength - 1].offsetLeft;
            this.itemIndex = this.itemCount - this.cloneLength;
          }
          else if (dist <= -endLimit) {
            this.startingOffset += items[this.lastIndex - this.cloneLength].offsetLeft - items[this.cloneLength - 1].offsetLeft;
            dist += items[this.lastIndex - this.cloneLength].offsetLeft - items[this.cloneLength - 1].offsetLeft;
            this.itemIndex = 0;
          }
        }
        
        
        
        translate(this.items, dist);
      }
      this.click = false;
    },
    
    finishSwipe: function(e) {
      if (!this.click)
        stifle(e);
      else {
        this.touchInProgress = false; // need this or carousel won't scroll after clicking item without dragging
        this.autoscrollStart();
        return;
      }
      this.touchInProgress = false; // For non-touch environments

      if (!this.touch || e.touches.length == 0)
        this.moveHelper(this.getDisplacementIndex());
    },
    getDisplacementIndex: function() {
      var swipeDistance = this.swipeDist();
      var displacementIndex = 0;

      if (this.multi) {
        // Sigmoid FTW:
        var range = this.magazineCount;
        var rangeOffset = range/2.0;
        displacementIndex = zeroCeil(1/(1 + Math.pow(Math.E,-1.0*swipeDistance)) * range - rangeOffset);
      } else
        displacementIndex = zeroCeil(swipeDistance/this.snapWidth);

      return displacementIndex;
    },
    snapTo: function(displacement) {
      this.destinationOffset = displacement + this.startingOffset;

      var maxOffset = -1*(this.lastIndex)*this.snapWidth;
      if (this.infinite)
        maxOffset = -this.items.offsetWidth;
      if (this.destinationOffset < maxOffset || this.destinationOffset > 0) {
        if (Math.abs(this.destinationOffset - maxOffset) < 1) {
          // Hacky -- but there are rounding errors
          // I see this when I'm in multi-mode and using the buttons
          // This only seems to happen on the desktop browser -- ideally its removed at compile time
          this.destinationOffset = maxOffset;
        } else {
          this.destinationOffset = this.startingOffset;
        }
      }
      
      this.momentum();
    },

    moveTo: function(direction) {
      // The animation isnt done yet
      if (this.incrementFlag)
        return;
      
      this.startingOffset = this.getTranslateX(this.items);
      this.moveHelper(direction);
    },

    moveHelper: function(direction) {
      this.autoscrollStop();

      var newIndex = this.getNewIndex(direction);

      var items = x$(this.items).find("[data-ur-carousel-component='item']");

      if (this.infinite) {
       
        var oldTransform = this.getTranslateX(this.items);

        if (newIndex == this.lastIndex) { // at the end of carousel
          this.itemIndex = this.cloneLength;
          newIndex = this.itemIndex + 1;

          var altTransform = oldTransform;
          altTransform += this.clones[0].offsetLeft - items[this.cloneLength].offsetLeft; // CHECK
          translate(this.items, altTransform);
          this.startingOffset = -items[this.cloneLength].offsetLeft;
          this.startingOffset += parseInt((this.snapWidth - this.clones[0].offsetWidth)/2); // CHECK
        }
        else if (newIndex == 0) { // at the beginning of carousel
          this.itemIndex = this.lastIndex - this.cloneLength;
          newIndex = this.itemIndex - 1;

          var altTransform = oldTransform;
          altTransform += items[this.cloneLength].offsetLeft - this.clones[0].offsetLeft; // CHECK
          translate(this.items, altTransform);
          this.startingOffset = -items[this.lastIndex - this.cloneLength].offsetLeft;
          this.startingOffset += parseInt((this.snapWidth - this.clones[0].offsetWidth)/2); // CHECK
        }
        
      }

      var newItem = items[newIndex];
      var currentItem = items[this.itemIndex];

      var displacement = currentItem.offsetLeft - newItem.offsetLeft; // CHECK
      this.snapTo(displacement);
      this.updateIndex(newIndex);
    },

    moveToIndex: function(index) {
      var direction = this.itemIndex - index;
      this.moveTo(direction);
    },

    momentum: function() {
      if (this.touchInProgress)
        return;

      this.incrementFlag = false;

      var translateX = this.getTranslateX(this.items);
      var distance = this.destinationOffset - translateX;
      var increment = distance - zeroFloor(distance / 1.1);

      // Hacky -- this is for the desktop browser only -- to fix rounding errors
      // Ideally, this is removed at compile time
      if(Math.abs(increment) < 0.01)
        increment = 0;

      var newTransform = increment + translateX;

      /*
      if (this.infinite) {
        var items = x$(this.items).find("[data-ur-carousel-component='item']");
        var startLimit = items[this.cloneLength - 1].offsetLeft; // almost at the beginning of carousel
        var endLimit = items[this.itemCount - this.cloneLength].offsetLeft; // almost at the end of carousel
        
        if (newTransform >= -startLimit) { // almost at the beginning of carousel
          this.destinationOffset  -= items[this.lastIndex - this.cloneLength].offsetLeft - items[this.cloneLength - 1].offsetLeft;
          newTransform -= items[this.lastIndex - this.cloneLength].offsetLeft - items[this.cloneLength - 1].offsetLeft;
        }
        //else if (newTransform >= endLimit) // almost at the end of carousel
          //newTransform -= items[this.itemCount - this.cloneLength].offsetLeft - items[this.cloneLength].offsetLeft;
        console.log(newTransform);
        //var altTransform = -x$(this.items).find("[data-ur-carousel-component='item']")[this.itemIndex].offsetLeft;
        //altTransform += parseInt((this.snapWidth - this.clones[0].offsetWidth)/2); // CHECK
        //translate(this.items, altTransform);
      }*/

      translate(this.items, newTransform);

      if (increment != 0)
        this.incrementFlag = true;

      if (this.incrementFlag)
        setTimeout(function(obj){return function(){obj.momentum()}}(this), 16);
      else {
        this.startingOffset = null;
        
        if (this.infinite) {
          /*
          if (this.itemIndex == this.itemCount - this.cloneLength) // almost at the end of carousel
            this.itemIndex = this.cloneLength;
          else if (this.itemIndex == this.cloneLength - 1) // almost at the beginning of carousel
            this.itemIndex = this.lastIndex - this.cloneLength;
          
          this.updateIndex(this.itemIndex);
          
          var altTransform = -x$(this.items).find("[data-ur-carousel-component='item']")[this.itemIndex].offsetLeft;
          altTransform += parseInt((this.snapWidth - this.clones[0].offsetWidth)/2); // CHECK
          translate(this.items, altTransform);
          */
        }
        
        this.autoscrollStart();
        
        x$().iterate(
          this.onSlideCallbacks,
          function(callback) {
            callback();
          }
        );
      }
    },

    swipeDist: function() {
      if (this.endPos === undefined)
        return 0;
      return this.endPos.x - this.startPos.x;
    }
  }

  // Private constructors
  var ComponentConstructors = {
    button: function(group, component, type) {
      if (group["button"] === undefined)
        group["button"] = {};
      
      var type = component.getAttribute("data-ur-carousel-button-type");
      
      // Declaration error
      if (type === undefined)
        Ur.error("malformed carousel button type on:" + component.outerHTML);

      group["button"][type] = component;

      // Maybe in the future I'll make it so any of the items can be the starting item
      x$(component).attr("data-ur-state", type == "prev" ? "disabled" : "enabled");
    }
  };
  function CarouselLoader(){}
  
  CarouselLoader.prototype.initialize = function(fragment) {
    var carousels = x$(fragment).findElements("carousel", ComponentConstructors);
    Ur.Widgets["carousel"] = {};
    for (var name in carousels) {
      var carousel = carousels[name];
      Ur.Widgets["carousel"][name] = new Carousel(carousel);
      x$(carousel["set"]).attr("data-ur-state", "enabled");
    }
  }

  return CarouselLoader;
})();
