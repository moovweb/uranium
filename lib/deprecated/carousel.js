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
    var self = this;
    
    this.container = components["view_container"];
    this.items = components["scroll_container"];
    if (this.items.length == 0) {
      Ur.error("carousel missing item components");
      return false;
    }

    // Optionally:
    this.button = components["button"] === undefined ? {} : components["button"];
    this.count = components["count"];
    this.dots = components["dots"];

    this.flag = {
      click: false,
      increment: false,
      loop: false,
      lock: null,
      timeoutId: null,
      touched: false
    };

    this.options = {
      autoscroll: true,
      autoscrollDelay: 5000,
      autoscrollForward: true,
      center: true,
      cloneLength: 1,
      fill: 0,
      infinite: true,
      speed: 1.1,
      transform3d: true,
      touch: true,
      verticalScroll: true
    };
    
    this.itemIndex = 0;
    this.translate = 0;
    
    var $container = x$(this.container);
    var preCoords = {x: 0, y: 0};
    var startPos = {x: 0, y: 0}, endPos = {x: 0, y: 0};
    
    var snapWidth = 0;
    
    var startingOffset = null;
    
    var translatePrefix = "translate3d(", translateSuffix = ", 0px)";
    
    function initialize() {
      // TODO:
      // add an internal event handler to handle all events on the container:
      // x$(self.container).on("event", self.handleEvent);

      readAttributes();

      if (!self.options.transform3d) {
        translatePrefix = "translate(";
        translateSuffix = ")";
      }

      x$(self.items).find("[data-ur-carousel-component='item']").each(function(obj, i) {
        if (x$(obj).attr("data-ur-state")[0] == "active")
          self.itemIndex = i;
      });

      if (self.options.infinite) {
        var items = x$(self.items).find("[data-ur-carousel-component='item']");
        self.realItemCount = items.length;
        for (var i = 0; i < self.options.cloneLength; i++) {
          var clone = items[i].cloneNode(true);
          x$(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          items[items.length - 1].parentNode.appendChild(clone);
        }

        for (var i = items.length - self.options.cloneLength; i < items.length; i++) {
          var clone = items[i].cloneNode(true);
          x$(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          items[0].parentNode.insertBefore(clone, items[0]);
        }
      }

      updateIndex(self.itemIndex + self.options.cloneLength);

      self.update();

      if (self.options.touch) {
        var hasTouch = "ontouchstart" in window;
        var start = hasTouch ? "touchstart" : "mousedown";
        var move = hasTouch ? "touchmove" : "mousemove";
        var end = hasTouch ? "touchend" : "mouseup";

        x$(self.items).on(start, startSwipe);
        x$(self.items).on(move, continueSwipe);
        x$(self.items).on(end, finishSwipe);
        x$(self.items).click(function(e) {if (!self.flag.click) stifle(e);});
      }

      x$(self.button["prev"]).click(function(){self.moveTo(1);});
      x$(self.button["next"]).click(function(){self.moveTo(-1);});

      x$(window).orientationchange(resize);
      // orientationchange isn't supported on some androids
      x$(window).on("resize", function() {
        resize();
        setTimeout(resize, 100);
      });

      self.autoscrollStart();
    }

    function readAttributes() {
      
      // translate3d is disabled on Android by default because it often causes problems
      // however, on some pages translate3d will work fine so the data-ur-android3d
      // attribute can be set to "enabled" to use translate3d since it can be smoother
      // on some Android devices

      var oldAndroid = /Android [12]/.test(navigator.userAgent);
      if (oldAndroid && $container.attr("data-ur-android3d")[0] != "enabled") {
        self.options.transform3d = false;
        var speed = parseFloat($container.attr("data-ur-speed"));
        self.options.speed = speed > 1 ? speed : 1.3;
      }

      $container.attr("data-ur-speed", self.options.speed);

      self.options.verticalScroll = $container.attr("data-ur-vertical-scroll")[0] != "disabled";
      $container.attr("data-ur-vertical-scroll", self.options.verticalScroll ? "enabled" : "disabled");

      self.options.touch = $container.attr("data-ur-touch")[0] != "disabled";
      $container.attr("data-ur-touch", self.options.touch ? "enabled" : "disabled");

      self.options.infinite = $container.attr("data-ur-infinite")[0] != "disabled";
      if ($container.find("[data-ur-carousel-component='item']").length == 1)
        self.options.infinite = false;
      $container.attr("data-ur-infinite", self.options.infinite ? "enabled" : "disabled");

      self.options.center = $container.attr("data-ur-center")[0] == "enabled";
      $container.attr("data-ur-center", self.options.center ? "enabled" : "disabled");

      var fill = parseInt($container.attr("data-ur-fill"));
      if (fill > 0)
        self.options.fill = fill;
      $container.attr("data-ur-fill", self.options.fill);

      var cloneLength = parseInt($container.attr("data-ur-clones"));
      if (!self.options.infinite)
        cloneLength = 0;
      else if (isNaN(cloneLength) || cloneLength < self.options.fill)
        cloneLength = Math.max(1, self.options.fill);
      self.options.cloneLength = cloneLength;
      $container.attr("data-ur-clones", self.options.cloneLength);

      self.options.autoscroll = $container.attr("data-ur-autoscroll")[0] == "enabled";
      $container.attr("data-ur-autoscroll", self.options.autoscroll ? "enabled" : "disabled");

      var autoscrollDelay = parseInt($container.attr("data-ur-autoscroll-delay"));
      if (autoscrollDelay >= 0)
        self.options.autoscrollDelay = autoscrollDelay;
      $container.attr("data-ur-autoscroll-delay", self.options.autoscrollDelay);

      self.options.autoscrollForward = $container.attr("data-ur-autoscroll-dir")[0] != "prev";
      $container.attr("data-ur-autoscroll-dir", self.options.autoscrollForward ? "next" : "prev");
    }

    function updateDots() {
      if (self.dots) {
        var existing = x$(self.dots).find("[data-ur-carousel-component='dot']");
        if (existing.length != self.realItemCount) {
          existing.remove();
          var dot = x$("<div data-ur-carousel-component='dot'></div>")[0];
          var realItemIndex = self.itemIndex - self.options.cloneLength;
          for (var i = 0; i < self.realItemCount; i++) {
            var new_dot = dot.cloneNode();
            if (i == realItemIndex)
              x$(new_dot).attr("data-ur-state", "active");
            self.dots.appendChild(new_dot);
          }
        }
      }
    }

    function resize() {
      var offsetWidth = self.container.offsetWidth;
      if (snapWidth != offsetWidth && offsetWidth != 0)
        self.update();
    }

    this.update = function() {
      var oldWidth = snapWidth;
      snapWidth = self.container.offsetWidth;

      var oldCount = self.itemCount;
      var items = x$(self.items).find("[data-ur-carousel-component='item']");
      self.itemCount = items.length;

      if (oldCount != self.itemCount) {
        self.realItemCount = items.has(":not([data-ur-clone])").length;
        self.lastIndex = self.itemCount - 1;
        if (self.itemIndex > self.lastIndex)
          self.itemIndex = self.lastIndex;
        updateDots();
      }

      // Adjust the container to be the necessary width.
      var totalWidth = 0;

      var divisions = [];
      if (self.options.fill > 0) {
        var remainder = snapWidth;
        for (var i = self.options.fill; i > 0; i--) {
          var length = Math.round(remainder/i);
          divisions.push(length);
          remainder -= length;
        }
      }

      for (var i = 0; i < items.length; i++) {
        if (self.options.fill > 0) {
          var length = divisions[i % self.options.fill];
          items[i].style.width = length + "px";
          totalWidth += length;
        }
        else
          totalWidth += items[i].offsetWidth;
      }

      self.items.style.width = totalWidth + "px";

      if (items && items.length) {
        calculateAndTranslateOffset(items, oldWidth)
      }
    }
    
    function calculateAndTranslateOffset(items, oldWidth) {      
      var cumulativeOffset = -items[self.itemIndex].offsetLeft; // initial offset
      if (self.options.center) {
        var centerOffset = parseInt((snapWidth - items[self.itemIndex].offsetWidth)/2);
        cumulativeOffset += centerOffset; // CHECK
      }
      if (oldWidth)
        self.destinationOffset = cumulativeOffset;

      translateX(cumulativeOffset);
    };

    this.autoscrollStart = function() {
      if (!self.options.autoscroll)
        return;

      self.flag.timeoutId = setTimeout(function() {
        if (self.container.offsetWidth != 0) {
          if (!self.options.infinite && self.itemIndex == self.lastIndex && self.options.autoscrollForward)
            self.jumpToIndex(0);
          else if (!self.options.infinite && self.itemIndex == 0 && !self.options.autoscrollForward)
            self.jumpToIndex(self.lastIndex);
          else
            self.moveTo(self.options.autoscrollForward ? -1 : 1);
        }
        else
          self.autoscrollStart();
      }, self.options.autoscrollDelay);
    };

    this.autoscrollStop = function() {
      clearTimeout(self.flag.timeoutId);
    };

    function getEventCoords(event) {
      if (event.touches && event.touches.length > 0)
        return {x: event.touches[0].clientX, y: event.touches[0].clientY};
      else if (event.clientX != undefined)
        return {x: event.clientX, y: event.clientY};
      return null;
    }

    function updateButtons() {
      x$(self.button["prev"]).attr("data-ur-state", self.itemIndex == 0 ? "disabled" : "enabled");
      x$(self.button["next"]).attr("data-ur-state", self.itemIndex == self.itemCount - Math.max(self.options.fill, 1) ? "disabled" : "enabled");
    }

    function getNewIndex(direction) {
      var newIndex = self.itemIndex - direction;
      if (!self.options.infinite) {
        if (self.options.fill > 1 && newIndex > self.lastIndex - self.options.fill + 1)
          newIndex = self.lastIndex - self.options.fill + 1;
        else if (newIndex > self.lastIndex)
          newIndex = self.lastIndex;
        else if (newIndex < 0)
          newIndex = 0;
      }
      
      return newIndex;
    }

    function updateIndex(newIndex) {
      if (newIndex === undefined)
        return;

      self.itemIndex = newIndex;
      if (self.itemIndex < 0)
        self.itemIndex = 0;
      else if (self.itemIndex > self.lastIndex)
        self.itemIndex = self.lastIndex - 1;

      var realIndex = self.itemIndex;
      if (self.options.infinite)
        realIndex = (self.realItemCount + self.itemIndex - self.options.cloneLength) % self.realItemCount;
      if (self.count !== undefined)
        self.count.innerHTML = realIndex + 1 + " of " + self.realItemCount;

      x$(self.items).find("[data-ur-carousel-component='item'][data-ur-state='active']").attr("data-ur-state", "inactive");
      x$(x$(self.items).find("[data-ur-carousel-component='item']")[self.itemIndex]).attr("data-ur-state", "active");

      if (self.dots)
        x$(x$(self.dots).find("[data-ur-carousel-component='dot']").attr("data-ur-state", "inactive")[realIndex]).attr("data-ur-state", "active");

      updateButtons();

      $container.fire("slidestart", {index: realIndex});
    }

    function startSwipe(e) {
      if (!self.options.verticalScroll)
        stifle(e);
      self.autoscrollStop();

      self.flag.touched = true; // For non-touch environments
      self.flag.lock = null;
      self.flag.loop = false;
      self.flag.click = true;
      var coords = getEventCoords(e);
      preCoords.x = coords.x;
      preCoords.y = coords.y;

      if (coords !== null) {
        var translate = getTranslateX();

        if (startingOffset == null || self.destinationOffset == undefined)
          startingOffset = translate;
        else
          // Fast swipe
          startingOffset = self.destinationOffset; //Factor incomplete previous swipe
        
        startPos = endPos = coords;
      }
    }

    function continueSwipe(e) {
      if (!self.flag.touched) // For non-touch environments
        return;

      self.flag.click = false;

      var coords = getEventCoords(e);

      if (document.ontouchstart !== undefined && self.options.verticalScroll) {
        var slope = Math.abs((preCoords.y - coords.y)/(preCoords.x - coords.x));
        if (self.flag.lock) {
          if (self.flag.lock == "y")
            return;
        }
        else if (slope > 1.2) {
          self.flag.lock = "y";
          return;
        }
        else if (slope <= 1.2)
          self.flag.lock = "x";
        else
          return;
      }
      stifle(e);

      if (coords !== null) {
        endPos = coords;
        var dist = swipeDist() + startingOffset;

        if (self.options.infinite) {
          var items = x$(self.items).find("[data-ur-carousel-component='item']");
          var endLimit = items[self.lastIndex].offsetLeft + items[self.lastIndex].offsetWidth - self.container.offsetWidth;

          if (dist > 0) { // at the beginning of carousel
            var srcNode = items[self.realItemCount];
            var offset = srcNode.offsetLeft - items[0].offsetLeft;
            startingOffset -= offset;
            dist -= offset;
            self.flag.loop = !self.flag.loop;
          }
          else if (dist < -endLimit) {  // at the end of carousel
            var srcNode = items[self.lastIndex - self.realItemCount];
            var offset = srcNode.offsetLeft - items[self.lastIndex].offsetLeft;
            startingOffset -= offset;
            dist -= offset;
            self.flag.loop = !self.flag.loop;
          }
        }

        translateX(dist);
      }
    }

    function finishSwipe(e) {
      if (!self.flag.click || self.flag.lock)
        stifle(e);
      else if (e.target.tagName == "AREA")
        location.href = e.target.href;
      
      self.flag.touched = false; // For non-touch environments
      
      moveHelper(getDisplacementIndex());
    }
    
    function getDisplacementIndex() {
      var swipeDistance = swipeDist();
      var displacementIndex = zeroCeil(swipeDistance/x$(self.items).find("[data-ur-carousel-component='item']")[0].offsetWidth);
      return displacementIndex;
    }
    
    function snapTo(displacement) {
      self.destinationOffset = displacement + startingOffset;
      var maxOffset = -1*self.lastIndex*snapWidth;
      var minOffset = parseInt((snapWidth - x$(self.items).find("[data-ur-carousel-component='item']")[0].offsetWidth)/2);

      if (self.options.infinite)
        maxOffset = -self.items.offsetWidth;
      if (self.destinationOffset < maxOffset || self.destinationOffset > minOffset) {
        if (Math.abs(self.destinationOffset - maxOffset) < 1) {
          // Hacky -- but there are rounding errors
          // I see this when I'm in multi-mode and using the buttons
          // This only seems to happen on the desktop browser -- ideally its removed at compile time
          self.destinationOffset = maxOffset;
        } else
          self.destinationOffset = minOffset;
      }

      momentum();
    }

    this.moveTo = function(direction) {
      // The animation isnt done yet
      if (self.flag.increment)
        return;

      startingOffset = getTranslateX();
      moveHelper(direction);
    };

    function moveHelper(direction) {
      self.autoscrollStop();

      var newIndex = getNewIndex(direction);
      
      var items = x$(self.items).find("[data-ur-carousel-component='item']");

      if (self.options.infinite) {
        var oldTransform = getTranslateX();
        var altTransform = oldTransform;

        if (newIndex < self.options.cloneLength) { // at the beginning of carousel
          var offset = items[self.options.cloneLength].offsetLeft - items[self.itemCount - self.options.cloneLength].offsetLeft;
          if (!self.flag.loop) {
            altTransform += offset;
            translateX(altTransform);
            startingOffset += offset;
          }
          newIndex += self.realItemCount;
          self.itemIndex = newIndex + direction;
        }
        else if (newIndex > self.lastIndex - self.options.cloneLength) { // at the end of carousel
          var offset = items[self.itemCount - self.options.cloneLength].offsetLeft - items[self.options.cloneLength].offsetLeft;
          if (!self.flag.loop) {
            altTransform += offset;
            translateX(altTransform);
            startingOffset += offset;
          }
          newIndex -= self.realItemCount;
          self.itemIndex = newIndex + direction;
        }
      }
      var newItem = items[newIndex];
      var currentItem = items[self.itemIndex];
      var displacement = currentItem.offsetLeft - newItem.offsetLeft; // CHECK
      if (self.options.center)
        displacement += (currentItem.offsetWidth - newItem.offsetWidth) / 2;
      setTimeout(function() {
        snapTo(displacement);
        updateIndex(newIndex);
      }, 0);
    }

    this.jumpToIndex = function(index) {
      self.moveTo(self.itemIndex - index);
    };

    function momentum() {
      if (self.flag.touched)
        return;

      self.flag.increment = false;

      var translate = getTranslateX();
      var distance = self.destinationOffset - translate;
      var increment = distance - zeroFloor(distance / self.options.speed);

      // Hacky -- this is for the desktop browser only -- to fix rounding errors
      // Ideally, this is removed at compile time
      if(Math.abs(increment) < 0.01)
        increment = 0;

      var newTransform = increment + translate;

      translateX(newTransform);

      if (increment != 0)
        self.flag.increment = true;

      if (self.flag.increment)
        setTimeout(momentum, 16);
      else {
        startingOffset = null;
        self.autoscrollStart();

        var itemIndex = self.itemIndex;
        x$(self.container).fire("slideend", {index: itemIndex});
      }
    }

    function swipeDist() {
      return endPos === undefined ? 0 : endPos.x - startPos.x;
    }
    
    function translateX(x) {
      self.translate = x;
      var items = self.items;
      items.style.webkitTransform = items.style.msTransform = items.style.OTransform = items.style.MozTransform = items.style.transform = translatePrefix + x + "px, 0px" + translateSuffix;
    }
    
    function getTranslateX() {
      return self.translate;
    }
    
    initialize();
  }

  // Private/Helper methods

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
