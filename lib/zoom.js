// Zoom
interactions.zoom = function ( fragment ) {
  if (fragment.constructor == Object)
    var groups = assignElements(fragment, "zoom");
  else
    var groups = findElements(fragment, "zoom");

  // Private shared variables

  var loadedImgs = []; // sometimes the load event doesn't fire when the image src has been previously loaded

  // Private shared methods

  // note that this accepts a reversed range
  function bound(num, range) {
    return Math.max(Math.min(range[0], num), range[1]);
  }

  $.each(groups, function(id, group) {
    Uranium.zoom[id] = new Zoom(this);
    $(group["set"]).data("urInit", true);
  });

  function Zoom(set) {
    var self = this;
    this.container = set["set"];
    this.img = set["img"] && set["img"][0];
    if (!this.img)
      this.img = this.container;
    this.prescale = false;
    this.width = this.height = 0;
    this.bigWidth = this.bigHeight = 0;
    this.canvasWidth = this.canvasHeight = 0;
    this.ratio = 1;
    this.state = "disabled";
    this.transform3d = transform3d;

    // Optionally:
    this.button = set["button"];
    this.idler = set["loading"];

    var $container = $(this.container);
    var $img = $(this.img);
    var $idler = $(this.idler);
    var $btn = $(this.button);

    var boundX, boundY;
    var relX, relY;
    var offsetX = 0, offsetY = 0;
    var destOffsetX = 0, destOffsetY = 0;
    var touchX = 0, touchY = 0;
    var mouseDown = false; // only used on non-touch browsers
    var mouseDrag = true;

    var translatePrefix = "translate(", translateSuffix = ")";
    var scalePrefix = " scale(", scaleSuffix = ")";

    var startCoords, click, down; // used for determining if zoom element is actually clicked

    // momentum sliding
    var frictionTime, frictionTimer;
    var dx1 = 0, dy1 = 0;
    var dx2 = 0, dy2 = 0;
    var time1 = 0, time2 = 0;
    var slidex, slidey;


    loadedImgs.push($img.attr("src"));

    function initialize() {
      var custom3d = $container.attr("data-ur-transform3d");
      if (custom3d)
        self.transform3d = custom3d != "disabled";
      if (self.transform3d) {
        translatePrefix = "translate3d(";
        translateSuffix = ",0)";
        scalePrefix = " scale3d(";
        scaleSuffix = ",1)";
      }
      $container.attr("data-ur-transform3d", self.transform3d ? "enabled" : "disabled");
      
      self.canvasWidth = self.canvasWidth || $container.outerWidth();
      self.canvasHeight = self.canvasHeight || $container.outerHeight();
      self.width = self.width || parseInt($img.attr("width")) || parseInt($img.css("width")) || $img[0].width;
      self.height = self.height || parseInt($img.attr("height")) || parseInt($img.css("height")) || $img[0].height;

      self.bigWidth = parseInt($img.attr("data-ur-width")) || $img[0].naturalWidth;
      self.bigHeight = parseInt($img.attr("data-ur-height")) || $img[0].naturalHeight;
      
      if (!$img.attr("data-ur-src"))
        $img.attr("data-ur-src", $img.attr("src"));
      
      if (($img.attr("data-ur-width") && $img.attr("data-ur-height")) || $img.attr("src") == $img.attr("data-ur-src"))
        self.prescale = true;

      self.ratio = self.bigWidth/self.width;

      boundX = (self.canvasWidth - self.bigWidth)/2;    // horizontal translation to view middle of image
      boundY = (self.canvasHeight - self.bigHeight)/2;  // vertical translation to view middle of image
    }

    function panStart(event) {
      if (self.state == "enabled-slide") {
        setState("enabled");
        var t = (Date.now() - frictionTime) / 300;
        if (t < 1) {
          clearTimeout(frictionTimer);
          var cb = 1 - Math.pow(1 - t, 1.685); // approximate cubic bezier y(x)
          var currentOffsetX = bound(destOffsetX + cb * slidex, [-boundX, boundX]);
          var currentOffsetY = bound(destOffsetY + cb * slidey, [-boundY, boundY]);
          transform(currentOffsetX, currentOffsetY, self.ratio);
        }
      }
      
      mouseDrag = false;
      touchX = event.pageX;
      touchY = event.pageY;
      mouseDown = true;
      var touches = event.originalEvent.touches;
      if (touches) {
        touchX = touches[0].pageX;
        touchY = touches[0].pageY;
      }

      var style = $img[0].style;
      if (window.WebKitCSSMatrix) {
        var matrix = new WebKitCSSMatrix(style.webkitTransform);
        offsetX = matrix.m41;
        offsetY = matrix.m42;
      }
      else {
        var css = style.MozTransform || style.msTransform || style.transform || "translate(0, 0)";
        css = css.replace(/.*?\(|\)/, "").split(",");

        offsetX = parseInt(css[0]);
        offsetY = parseInt(css[1]);
      }

      stifle(event);
    }

    function panMove(event) {
      if (!mouseDown) // NOTE: mouseDown should always be true on touch-enabled devices
        return;

      stifle(event);
      var x = event.pageX;
      var y = event.pageY;
      var touches = event.originalEvent.touches;
      if (touches) {
        x = touches[0].pageX;
        y = touches[0].pageY;
      }
      var dx = x - touchX;
      var dy = y - touchY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
        mouseDrag = true;
      destOffsetX = bound(offsetX + dx, [-boundX, boundX]);
      destOffsetY = bound(offsetY + dy, [-boundY, boundY]);
      transform(destOffsetX, destOffsetY, self.ratio);
      dx1 = dx2;
      dy1 = dy2;
      dx2 = dx;
      dy2 = dy;
      time1 = time2;
      time2 = Date.now();
    }

    function panEnd(event) {
      if (!mouseDrag)
        self.zoomOut();
      else if (Date.now() < time2 + 50)
        slide();
      stifle(event);
      mouseDown = false;
      mouseDrag = true;
    }
    
    function slide() {
      setState("enabled-slide");
      var ddx = dx2 - dx1, ddy = dy2 - dy1;
      var scalar = 100 * Math.sqrt((ddx * ddx + ddy * ddy)/(dx2 * dx2 + dy2 * dy2))/(time2 - time1);
      slidex = scalar * dx2;
      slidey = scalar * dy2;
      var newOffsetX = bound(destOffsetX + slidex, [-boundX, boundX]);
      var newOffsetY = bound(destOffsetY + slidey, [-boundY, boundY]);
      transform(newOffsetX, newOffsetY, self.ratio);
      frictionTime = Date.now();
      frictionTimer = setTimeout(function() {
        setState("enabled");
      }, 300);
    }

    function transitionEnd() {
      if (self.state == "enabled-in") {
        $img.css({ webkitTransitionDelay: "", MozTransitionDelay: "", OTransitionDelay: "", transitionDelay: "" });

        $img.attr("src", $img.attr("data-ur-src"));
        if (loadedImgs.indexOf($img.attr("data-ur-src")) == -1) {
          setTimeout(function() {
            if (loadedImgs.indexOf($img.attr("data-ur-src")) == -1)
              $idler.attr("data-ur-state", "enabled");
          }, 16);
        }
        setState("enabled");

        $img
          .on(downEvent + ".zoom", panStart)
          .on(moveEvent + ".zoom", panMove)
          .on(upEvent + ".zoom", panEnd);
      }
      else if (self.state == "enabled-out") {
        setState("disabled");

        $img
          .off(downEvent + ".zoom", panStart)
          .off(moveEvent + ".zoom", panMove)
          .off(upEvent + ".zoom", panEnd);
      }
    }

    function setState(state) {
      self.state = state;
      $container.attr("data-ur-state", state);
    }

    function zoomHelper(x, y) {
      $btn.attr("data-ur-state", "enabled");
      setState("enabled-in");

      transform(x || 0, y || 0, self.ratio);
    }

    function transform(x, y, scale) {
      var t = "";
      if (x != null)
        t = translatePrefix + x + "px, " + y + "px" + translateSuffix;
      if (scale != null)
        t += scalePrefix + scale + ", " + scale + scaleSuffix;
      
      return $img.css({ webkitTransform: t, MozTransform: t, msTransform: t, transform: t });
    }

    // attempts to zoom in centering in on the area that was touched
    this.zoomIn = function(event) {
      if (self.state != "disabled")
        return;

      if (!self.width) {
        initialize();
        $img.css("width", self.width + "px");
        $img.css("height", self.height + "px");
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
        var offset = $img[0].getBoundingClientRect();
        relX = x - offset.left;
        relY = y - offset.top;
      }

      if (!self.prescale) {
        self.state = "enabled-in";
        $img.attr("src", $img.attr("data-ur-src"));
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
      setState("enabled-out");
      transform(0, 0, 1);
    };

    if ($container.attr("data-ur-touch") != "disabled") {
      // make sure zoom works when dragged inside carousel
      $container.on(downEvent + ".zoom", function(e) {
        click = down = true;
        startCoords = getEventCoords(e);
      });
      $container.on(moveEvent + ".zoom", function(e) {
        var coords = getEventCoords(e);
        if (down && (Math.abs(startCoords.x - coords.x) + Math.abs(startCoords.x - coords.x)) > 0)
          click = false;
      });
      $container.on("click.ur.zoom", function(e) {
        if (click)
          self.zoomIn(e);
      });
    }

    $img.on("load.ur.zoom", function() {
      if ($img.attr("src") == $img.attr("data-ur-src"))
        loadedImgs.push($img.attr("src"));
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
          $img.css("width", self.width + "px");
          $img.css("height", self.height + "px");
        }

        if (self.prescale)
          zoomHelper(0, 0);
        else {
          self.state = "enabled-in";
          $img.attr("src", $img.attr("data-ur-src"));
          setTimeout(function() {
            // if prescale ?
            if (loadedImgs.indexOf($img.attr("data-ur-src")) == -1)
              $idler.attr("data-ur-state", "enabled");
          }, 0);
        }
      }
      else
        self.zoomOut();
    };

    // zoom in/out button, zooms in to the center of the image
    $(self.button).on(touchscreen ? "touchstart.ur.zoom" : "click.ur.zoom", self.zoom);

    $img.on("webkitTransitionEnd.ur.zoom transitionend.ur.zoom", transitionEnd);

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
};
