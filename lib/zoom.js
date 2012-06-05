/* Zoom  *
 * * * * * * *
 * This is a zoom widget that zooms images to larger images
 * within the same container and allows for basic panning
 *
 */

Ur.WindowLoaders["zoom"] = (function() {

  function Zoom(components) {
    var self = this;
    
    this.container = components["view_container"];
    this.img = components["img"];
    this.prescale = false;
    this.width = this.height = 0;
    this.bigWidth = this.bigHeight = 0;
    this.canvasWidth = this.canvasHeight = 0;
    this.ratio = 1;
    this.state = "disabled";

    // Optionally:
    this.button = components["button"];
    this.idler = components["loading"];

    var $img = x$(this.img);
    var $idler = x$(this.idler);
    var $btn = x$(this.button);

    var boundX, boundY;
    var relX, relY;
    var offsetX = 0, offsetY = 0;
    var touchX = 0, touchY = 0;
    var mouseDown = false; // only used on non-touch browsers
    var mouseDrag = true;

    function initialize() {
      self.canvasWidth = self.canvasWidth || self.container.offsetWidth;
      self.canvasHeight = self.canvasHeight || self.container.offsetHeight;
      self.width = self.width || parseInt($img.attr("width")) || parseInt($img.getStyle("width")) || self.img.width;
      self.height = self.height || parseInt($img.attr("height")) || parseInt($img.getStyle("height")) || self.img.height;

      self.bigWidth = parseInt($img.attr("data-ur-width")) || self.img.naturalWidth;
      self.bigHeight = parseInt($img.attr("data-ur-height")) || self.img.naturalHeight;
      if ($img.attr("data-ur-width")[0] && $img.attr("data-ur-height")[0])
        self.prescale = true;

      self.ratio = self.bigWidth/self.width;

      boundX = (self.canvasWidth - self.bigWidth)/2;    // horizontal translation to view middle of image
      boundY = (self.canvasHeight - self.bigHeight)/2;  // vertical translation to view middle of image
    }

    function panStart(event) {
      if (event.target != self.img)
        return;
      mouseDrag = false;
      touchX = event.pageX;
      touchY = event.pageY;
      mouseDown = true;
      if (event.touches) {
        touchX = event.touches[0].pageX;
        touchY = event.touches[0].pageY;
      }

      var style = self.img.style;
      if (window.WebKitCSSMatrix) {
        var matrix = new WebKitCSSMatrix(style.webkitTransform);
        offsetX = matrix.m41;
        offsetY = matrix.m42;
      }
      else {
        var transform = style.MozTransform || style.OTransform || style.transform || "translate(0, 0)";
        transform = transform.replace(/.*?\(|\)/, "").split(",");

        offsetX = parseInt(transform[0]);
        offsetY = parseInt(transform[1]);
      }

      stifle(event);
    }

    function panMove(event) {
      if (!mouseDown || event.target != self.img) // NOTE: mouseDown should always be true on touch-enabled devices
        return;

      stifle(event);
      var x = event.pageX;
      var y = event.pageY;
      if (event.touches) {
        x = event.touches[0].pageX;
        y = event.touches[0].pageY;
      }
      var dx = x - touchX;
      var dy = y - touchY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
        mouseDrag = true;
      var new_offsetX = bound(offsetX + dx, [-boundX, boundX]);
      var new_offsetY = bound(offsetY + dy, [-boundY, boundY]);
      transform(new_offsetX, new_offsetY, self.ratio);
    }

    function panEnd(event) {
      if (!mouseDrag)
        self.zoomOut();
      stifle(event);
      mouseDown = false;
      mouseDrag = true;
    }

    function transitionEnd() {
      if (self.state == "enabled-in") {
        $img.css({ webkitTransitionDelay: "", MozTransitionDelay: "", OTransitionDelay: "", transitionDelay: "" });
        
        if (loaded_imgs.indexOf(self.img.getAttribute("data-ur-src")) == -1) {
          self.img.src = $img.attr("data-ur-src")[0];

          setTimeout(function() {
            if (loaded_imgs.indexOf(self.img.getAttribute("data-ur-src")) == -1)
              $idler.attr("data-ur-state", "enabled");
          }, 16);
        }
        self.state = "enabled";
        self.container.setAttribute("data-ur-state", self.state);

        var touch = "ontouchstart" in window;
        var $container = x$(self.container);
        $container.on(touch ? "touchstart" : "mousedown", panStart);
        $container.on(touch ? "touchmove" : "mousemove", panMove);
        $container.on(touch ? "touchend" : "mouseup", panEnd);
      }
      else if (self.state == "enabled-out") {
        self.state = "disabled";
        self.container.setAttribute("data-ur-state", self.state);
        
        var touch = "ontouchstart" in window;
        var $container = x$(self.container);
        $container.un(touch ? "touchstart" : "mousedown", panStart);
        $container.un(touch ? "touchmove" : "mousemove", panMove);
        $container.un(touch ? "touchend" : "mouseup", panEnd);
      }
    }

    function zoomHelper(x, y) {
      $btn.attr("data-ur-state", "enabled");
      self.state = "enabled-in";
      self.container.setAttribute("data-ur-state", self.state);
      
      x = x ? x : 0;
      y = y ? y : 0;
      transform(x, y, self.ratio);
    }

    function transform(x, y, scale) {
      var t = "";
      if (x != undefined)
        t = translatePrefix + x + "px, " + y + "px" + translateSuffix;
      if (scale != undefined) {
        if (noScale3d)
          t += " scale(" + scale + ")";
        else
          t += " scale3d(" + scale + ", " + scale + ", 1)";
      }
      return $img.css({ webkitTransform: t, MozTransform: t, OTransform: t, transform: t });
    }

    // attempts to zoom in centering in on the area that was touched
    this.zoomIn = function(event) {
      if (self.state != "disabled")
        return;

      if (!self.width) {
        initialize();
        self.img.style.width = self.width + "px";
        self.img.style.height = self.height + "px";
      }

      var x = event.pageX, y = event.pageY;
      if (event.touches) {
        x = event.touches[0].pageX;
        y = event.touches[0].pageY;
      }

      // find touch location relative to image
      relX = event.offsetX;
      relY = event.offsetY;
      if (relX == undefined || relY == undefined) {
        var offset = self.img.getBoundingClientRect();
        relX = x - offset.left;
        relY = y - offset.top;
      }

      if (!self.prescale) {
        self.state = "enabled-in";
        self.img.src = $img.attr("data-ur-src")[0];
        setTimeout(function() {
          if (!self.prescale)
            $idler.attr("data-ur-state", "enabled");
        }, 0);
      }
      else {
        var translateX = bound(self.bigWidth/2 - self.ratio * relX, [-boundX, boundX]);
        var translateY = bound(self.bigHeight/2 - self.ratio * relY, [-boundY, boundY]);
        zoomHelper(translateX, translateY);
      }
    };

    this.zoomOut = function() {
      if (self.state != "enabled")
        return;
      $btn.attr("data-ur-state", "disabled");
      self.state = "enabled-out";
      self.container.setAttribute("data-ur-state", self.state);
      transform(0, 0, 1);
    };

    if (self.container.getAttribute("data-ur-touch") != "disabled")
      x$(self.container).click(self.zoomIn);

    $img.load(function() {
      if ($img.attr("src")[0] == $img.attr("data-ur-src")[0])
        loaded_imgs.push($img.attr("src")[0]);
      $idler.attr("data-ur-state", "disabled");
      if (!self.prescale && self.state == "enabled-in") {
        self.prescale = true;
        initialize();
        var translateX = bound(self.bigWidth/2 - self.ratio * relX, [-boundX, boundX]);
        var translateY = bound(self.bigHeight/2 - self.ratio * relY, [-boundY, boundY]);

        var delay = "0.3s";
        $img.css({ webkitTransitionDelay: delay, MozTransitionDelay: delay, OTransitionDelay: delay, transitionDelay: delay });

        zoomHelper(translateX, translateY);
      }
    });

    // zooms in to the center of the image
    this.zoom = function() {
      if (self.state == "disabled") {
        if (!self.width) {
          initialize();
          self.img.style.width = self.width + "px";
          self.img.style.height = self.height + "px";
        }

        if (self.prescale)
          zoomHelper(0, 0);
        else {
          self.state = "enabled-in";
          self.img.src = $img.attr("data-ur-src")[0];
          setTimeout(function() {
            // if prescale ?
            if (loaded_imgs.indexOf(self.img.getAttribute("data-ur-src")) == -1)
              $idler.attr("data-ur-state", "enabled");
          }, 0);
        }
      }
      else
        self.zoomOut();
    };

    // zoom in/out button, zooms in to the center of the image
    x$(self.button).click(self.zoom);

    x$.fn.iterate(["webkitTransitionEnd", "transitionend", "oTransitionEnd"], function(eventName) {
      $img.on(eventName, transitionEnd);
    });

    this.reset = function() {
      self.prescale = false;
      self.width = self.height = 0;
      $img.css({width: "", height: ""});
      transform();
      self.state = "enabled-out";
      transitionEnd();
      $idler.attr("data-ur-state", "disabled");
      $btn.attr("data-ur-state", "disabled");
    };
  }
  
  // Private shared variables
  
  var loaded_imgs = []; // sometimes the load event doesn't fire when the image src has been previously loaded
  
  var no3d = /Android [12]|Opera/.test(navigator.userAgent);

  var noTranslate3d = no3d;
  var noScale3d = no3d;

  var translatePrefix = noTranslate3d ? "translate(" : "translate3d(";
  var translateSuffix = noTranslate3d ? ")" : ", 0)";

  var scalePrefix = noScale3d ? " scale(" : " scale3d(";
  var scaleSuffix = noScale3d ? ")" : ", 1)";


  // Private shared methods

  function bound(num, range) {
    return Math.max(Math.min(range[0], num), range[1]);
  }

  function stifle(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Private constructors
  var ComponentConstructors = {
    
  };

  function ZoomLoader(){}

  ZoomLoader.prototype.initialize = function(fragment) {
    var zooms = x$(fragment).findElements("zoom", ComponentConstructors);
    Ur.Widgets["zoom"] = {};
    for (var name in zooms) {
      var zoom = zooms[name];
      Ur.Widgets["zoom"][name] = new Zoom(zoom);
    }
  }

  return ZoomLoader;
})();
