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
    this.button = components["button"] === undefined ? {} : components["button"];
    this.count = components["count"];

    this.initialize();
    this.onSlideCallbacks = [];
  }

  // Private/Helper methods

  function sign(num) {
    return num < 0 ? -1 : 1;
  }

  function zeroCeil(num) {
    return num <= 0 ? Math.floor(num) : Math.ceil(num);
  }

  function zeroFloor(num) {
    return num >= 0 ? Math.floor(num) : Math.ceil(num);
  }

  function stifle(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function getTranslateX(obj) {
    var style = getComputedStyle(obj);
    var transform = style["webkitTransform"] || style["MozTransform"] || style["oTransform"] || style["transform"];
    if (transform != "none") {
      if (window.WebKitCSSMatrix)
        return new WebKitCSSMatrix(transform).m41;
      else
        return parseInt(transform.split(",")[4]);
    }
    else {
      Ur.error("no transform found");
      return 0;
    }
  }

  //// Public Methods ////

  Carousel.prototype = {
    initialize: function() {
      // TODO:
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event", this.handleEvent);

      this.flag = {click: false, increment: false, lock: null, timeoutId: null, touched: false};
      this.options = {
        autoscroll: true,
        autoscrollDelay: 5000,
        autoscrollForward: true,
        cloneLength: 1,
        dotCounter: true,
        infinite: true,
        transform3d: true,
        touch: true,
        verticalScroll: true
      };

      this.readAttributes();

      if (this.options.touch) {
        var hasTouch = document.ontouchstart !== undefined;
        var start = hasTouch ? "touchstart" : "mousedown";
        var move = hasTouch ? "touchmove" : "mousemove";
        var end = hasTouch ? "touchend" : "mouseup";
        x$(this.items).on(start, function(obj){return function(e){obj.startSwipe(e)};}(this));
        x$(this.items).on(move, function(obj){return function(e){obj.continueSwipe(e)};}(this));
        x$(this.items).on(end, function(obj){return function(e){obj.finishSwipe(e)};}(this));
        x$(this.items).click(function(obj){return function(e){if (!obj.click) stifle(e);}}(this));
      }

      x$(this.button["prev"]).click(function(obj){return function(){obj.moveTo(obj.magazineCount);}}(this));
      x$(this.button["next"]).click(function(obj){return function(){obj.moveTo(-obj.magazineCount);}}(this));

      this.preCoords = {x: 0, y: 0};

      this.itemIndex = 0;
      this.magazineCount = 1;

      if (this.options.infinite) {
        var items = x$(this.items).find("[data-ur-carousel-component='item']");
        this.realItemCount = items.length;
        this.itemIndex = this.options.cloneLength;
        this.clones = []; // probaby useless
        for (var i = 0; i < this.options.cloneLength; i++) {
          var clone = items[i].cloneNode(true);
          this.clones.push(clone);
          x$(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          items[items.length - 1].parentNode.appendChild(clone);
        }

        for (var i = items.length - this.options.cloneLength; i < items.length; i++) {
          var clone = items[i].cloneNode(true);
          this.clones.push(clone);
          x$(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          items[0].parentNode.insertBefore(clone, items[0]);
        }
      }

      this.adjustSpacing();

      this.updateIndex(this.options.infinite ? this.options.cloneLength : 0);

      // Expose this function globally: (this will work on webkit / FF)
      this.jumpToIndex = (function(obj) { return function(idx) { obj.__proto__.moveToIndex.call(obj, idx); };})(this);

      x$(window).orientationchange(function(obj){return function(){obj.resize();}}(this));
      // orientationchange isn't supported on some androids
      x$(window).on("resize", function(obj) { return function() {
        obj.resize();
        setTimeout(function(){obj.resize()}, 100);
      }}(this));
      //window.setInterval(function(obj){return function(){obj.resize();}}(this),1000);

      this.autoscrollStart();
    },

    readAttributes: function() {
      var $container = x$(this.container);

      // translate3d is disabled on Android by default because it often causes problems
      // however, on some pages translate3d will work fine so the data-ur-android3d
      // attribute can be set to "enabled" to use translate3d since it can be smoother
      // on some Android devices

      var oldAndroid = /Android [12]/.test(navigator.userAgent);
      if (oldAndroid && $container.attr("data-ur-android3d")[0] != "enabled")
        this.options.transform3d = false;

      this.options.verticalScroll = $container.attr("data-ur-vertical-scroll")[0] != "disabled";
      $container.attr("data-ur-vertical-scroll", this.options.verticalScroll ? "enabled" : "disabled");

      this.options.touch = $container.attr("data-ur-touch")[0] != "disabled";
      $container.attr("data-ur-touch", this.options.touch ? "enabled" : "disabled");

      this.options.infinite = $container.attr("data-ur-infinite")[0] != "disabled";
      $container.attr("data-ur-infinite", this.options.infinite ? "enabled" : "disabled");
      
      var cloneLength = parseInt($container.attr("data-ur-clones"));
      if (cloneLength > 0)
        this.options.cloneLength = cloneLength;
      $container.attr("data-ur-clones", this.options.cloneLength);
      
      this.options.autoscroll = $container.attr("data-ur-autoscroll")[0] != "disabled";
      $container.attr("data-ur-autoscroll", this.options.autoscroll ? "enabled" : "disabled");

      var autoscrollDelay = parseInt($container.attr("data-ur-autoscroll-delay"));
      if (autoscrollDelay >= 0)
        this.options.autoscrollDelay = autoscrollDelay;
      $container.attr("data-ur-autoscroll-delay", this.options.autoscrollDelay);

      this.options.autoscrollForward = $container.attr("data-ur-autoscroll-direction")[0] != "prev";
      $container.attr("data-ur-autoscroll-direction", this.options.autoscrollForward ? "next" : "prev");
    },

    resize: function() {
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

      this.snapWidth = visibleWidth;

      this.lastIndex = this.itemCount - 1;

      this.itemIndex = (this.lastIndex < this.itemIndex) ? this.lastIndex : this.itemIndex;

      cumulativeOffset -= items[this.itemIndex].offsetLeft; // initial offset
      var centerOffset = parseInt((this.snapWidth - items[0].offsetWidth)/2);
      cumulativeOffset += centerOffset; // CHECK

      if (oldSnapWidth)
        this.destinationOffset = cumulativeOffset;

      this.translate(cumulativeOffset);
    },

    autoscrollStart: function() {
      if (!this.options.autoscroll)
        return;

      var self = this;
      self.flag.timeoutId = setTimeout(function() {
        self.moveTo(self.options.autoscrollForward ? -self.magazineCount : self.magazineCount);
      }, self.options.autoscrollDelay);
    },

    autoscrollStop: function() {
      clearTimeout(this.flag.timeoutId);
    },

    getEventCoords: function(event) {
      if (event.touches && event.touches.length > 0)
        return {x: event.touches[0].clientX, y: event.touches[0].clientY};
      else
        return {x: event.clientX, y: event.clientY};
      return null;
    },

    updateButtons: function() {
      x$(this.button["prev"]).attr("data-ur-state", this.itemIndex == 0 ? "disabled" : "enabled")
      x$(this.button["next"]).attr("data-ur-state", this.itemIndex == this.lastIndex ? "disabled" : "enabled")
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
        if (this.options.infinite) {
          var realIndex = (this.realItemCount + this.itemIndex - this.options.cloneLength) % this.realItemCount;
          this.count.innerHTML = realIndex + 1 + " of " + this.realItemCount;
        }
        else
          this.count.innerHTML = this.itemIndex + 1 + " of " + this.itemCount;
      }

      var activeItem = x$(this.items).find("[data-ur-carousel-component='item'][data-ur-state='active']");
      activeItem.attr("data-ur-state", "inactive");
      var newActiveItem = x$(this.items).find("[data-ur-carousel-component='item']")[this.itemIndex];
      x$(newActiveItem).attr("data-ur-state", "active");

      this.updateButtons();
    },

    startSwipe: function(e) {
      stifle(e);
      this.autoscrollStop();

      this.flag.touched = true; // For non-touch environments
      var coords = this.getEventCoords(e);
      this.preCoords.x = coords.x;
      this.preCoords.y = coords.y;
      this.flag.lock = document.ontouchstart === undefined ? "x" : null;

      if (coords !== null) {
        var translateX = getTranslateX(this.items);

        if (this.startingOffset === undefined || this.startingOffset === null) {
          this.startingOffset = translateX;
          this.startPos = this.endPos = coords;
        } else {
          // Fast swipe
          this.startingOffset = this.destinationOffset; //Factor incomplete previous swipe
          this.startPos = this.endPos = coords;
        }
      }
      this.flag.click = true;
    },

    continueSwipe: function(e) {
      if (!this.flag.touched) // For non-touch environments
        return;

      this.flag.click = false;

      var coords = this.getEventCoords(e);

      if (document.ontouchstart !== undefined && this.options.verticalScroll) {
        if (this.flag.lock) {
          if (this.flag.lock == "y")
            return;
        }
        else if (Math.abs(this.preCoords.y - coords.y) > 7) {
          this.flag.lock = "y";
          return;
        }
        else if (Math.abs(this.preCoords.x - coords.x) > 5)
          this.flag.lock = "x";
        else
          return;
      }
      stifle(e);

      if (coords !== null) {
        this.endPos = coords;
        var dist = this.swipeDist() + this.startingOffset;

        if (this.options.infinite) {
          var items = x$(this.items).find("[data-ur-carousel-component='item']");
          var endLimit = items[this.lastIndex].offsetLeft + items[this.lastIndex].offsetWidth - this.container.offsetWidth;

          if (dist > 0) { // at the beginning of carousel
            var srcNode = items[this.realItemCount];
            var offset = srcNode.offsetLeft - items[0].offsetLeft;
            this.startingOffset -= offset;
            dist -= offset;
          }
          else if (dist < -endLimit) {  // at the end of carousel
            var srcNode = items[this.lastIndex - this.realItemCount];
            var offset = srcNode.offsetLeft - items[this.lastIndex].offsetLeft;
            this.startingOffset -= offset;
            dist -= offset;
          }
        }

        this.translate(dist);
      }
    },

    finishSwipe: function(e) {
      if (!this.flag.click || this.flag.lock)
        stifle(e);
      else
        x$(e.target).click();
      
      this.flag.touched = false; // For non-touch environments
      
      if (!this.options.verticalScroll || this.flag.lock == "x")
        this.moveHelper(this.getDisplacementIndex());
      else if (this.flag.lock == "y")
        this.autoscrollStart();
    },
    getDisplacementIndex: function() {
      var swipeDistance = this.swipeDist();
      var displacementIndex = zeroCeil(swipeDistance/this.snapWidth);
      return displacementIndex;
    },
    snapTo: function(displacement) {
      this.destinationOffset = displacement + this.startingOffset;
      var maxOffset = -1*(this.lastIndex)*this.snapWidth;
      var minOffset = parseInt((this.snapWidth - x$(this.items).find("[data-ur-carousel-component='item']")[0].offsetWidth)/2);

      if (this.options.infinite)
        maxOffset = -this.items.offsetWidth;
      if (this.destinationOffset < maxOffset || this.destinationOffset > minOffset) {
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
      if (this.flag.increment)
        return;

      this.startingOffset = getTranslateX(this.items);
      this.moveHelper(direction);
    },

    moveHelper: function(direction) {
      this.autoscrollStop();

      var newIndex = this.getNewIndex(direction);

      var items = x$(this.items).find("[data-ur-carousel-component='item']");

      if (this.options.infinite) {
        var oldTransform = getTranslateX(this.items);

        if (newIndex < this.options.cloneLength) { // at the beginning of carousel
          var altTransform = oldTransform;
          var offset = items[this.options.cloneLength].offsetLeft - items[this.itemCount - this.options.cloneLength].offsetLeft;
          altTransform += offset;
          this.translate(altTransform);
          this.startingOffset += offset;
          newIndex += this.realItemCount;
          this.itemIndex = newIndex + 1;
        }
        else if (newIndex > this.lastIndex - this.options.cloneLength) { // at the end of carousel
          var altTransform = oldTransform;
          var offset = items[this.itemCount - this.options.cloneLength].offsetLeft - items[this.options.cloneLength].offsetLeft;
          altTransform += offset;
          this.translate(altTransform);
          this.startingOffset += offset;
          newIndex -= this.realItemCount;
          this.itemIndex = newIndex - 1;
        }
      }
      var newItem = items[newIndex];
      var currentItem = items[this.itemIndex];
      var displacement = currentItem.offsetLeft - newItem.offsetLeft; // CHECK

      setTimeout(function(obj) {
        return function() {
          obj.snapTo(displacement);
          obj.updateIndex(newIndex);
        }
      }(this), 6);
    },

    moveToIndex: function(index) {
      var direction = this.itemIndex - index;
      this.moveTo(direction);
    },

    momentum: function() {
      if (this.flag.touched)
        return;

      this.flag.increment = false;

      var translateX = getTranslateX(this.items);
      var distance = this.destinationOffset - translateX;
      var increment = distance - zeroFloor(distance / 1.1);

      // Hacky -- this is for the desktop browser only -- to fix rounding errors
      // Ideally, this is removed at compile time
      if(Math.abs(increment) < 0.01)
        increment = 0;

      var newTransform = increment + translateX;

      this.translate(newTransform);

      if (increment != 0)
        this.flag.increment = true;

      if (this.flag.increment)
        setTimeout(function(obj){return function(){obj.momentum()}}(this), 16);
      else {
        this.startingOffset = null;
        this.autoscrollStart();

        x$().iterate(this.onSlideCallbacks, function(callback) { callback(); });
      }
    },

    swipeDist: function() {
      if (this.endPos === undefined)
        return 0;
      return this.endPos.x - this.startPos.x;
    },
    
    translate: function(x) {
      var container = this.items;
      var translatePrefix = this.options.transform3d ? "translate3d(" : "translate(";
      var translateSuffix = this.options.transform3d ? ", 0px)" : ")";
      ["webkitTransform", "MozTransform", "oTransform", "transform"].forEach(function(i) {
        container.style[i] = translatePrefix + x + "px, 0px" + translateSuffix;
      });
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
