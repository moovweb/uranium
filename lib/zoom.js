// Zoom
interactions.zoom = function ( fragment, options ) {
  options = $.extend({touch: true}, options);
  if (fragment.constructor == Object)
    var groups = assignElements(fragment, "zoom");
  else
    var groups = findElements(fragment, "zoom");

  // Private shared variables

  var loadedImgs = []; // sometimes the load event doesn't fire when the image src has been previously loaded

  $.each(groups, function(id, group) {
    Uranium.zoom[id] = new Zoom(this);
    $(group["set"]).data("urInit", true);
  });

  function Zoom(set) {
    var self = this;
    var zoomer = this;
    this.container = set["set"];
    this.img = set["img"];
    this.state = "disabled";

    // Optionally:
    this.button = set["button"];
    this.idler = set["loading"];

    var $container = $(this.container);
    var $img;
    var $idler = $(this.idler);
    var $btn = $(this.button);

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

    this.transform3d = transform3d;
    var custom3d = $container.attr("data-ur-transform3d");
    if (custom3d)
      this.transform3d = custom3d != "disabled";
    else if ("transform3d" in options)
      this.transform3d = options.transform3d;
      
    if (self.transform3d) {
      translatePrefix = "translate3d(";
      translateSuffix = ",0)";
      scalePrefix = " scale3d(";
      scaleSuffix = ",1)";
    }

    $(self.img).each(function() {
      loadedImgs.push($(this).attr("src"));
      $(this).data("urZoomImg", new Img(this));
    });
    
    function Img(img) {
      var self = this;
      var $img = $(img);
      var canvasWidth, canvasHeight;
      var width, height;
      var bigWidth, bigHeight;
      var boundX, boundY;
      var ratio;
      var prescale;
      

    function initialize() {
      $container.attr("data-ur-transform3d", zoomer.transform3d ? "enabled" : "disabled");
      
      canvasWidth = canvasWidth || $img.parent().outerWidth();
      canvasHeight = canvasHeight || $img.parent().outerHeight();
      width = width || parseInt($img.attr("width")) || parseInt($img.css("width")) || $img[0].width;
      height = height || parseInt($img.attr("height")) || parseInt($img.css("height")) || $img[0].height;
      
      bigWidth = parseInt($img.attr("data-ur-width")) || $img[0].naturalWidth;
      bigHeight = parseInt($img.attr("data-ur-height")) || $img[0].naturalHeight;
      
      if (!$img.attr("data-ur-src"))
        $img.attr("data-ur-src", $img.attr("src"));
      
      if (($img.attr("data-ur-width") && $img.attr("data-ur-height")) || $img.attr("src") == $img.attr("data-ur-src"))
        prescale = true;
      
      ratio = bigWidth/width;
      
      boundX = (bigWidth - canvasWidth)/2;    // horizontal translation to view middle of image
      boundY = (bigHeight - canvasHeight)/2;  // vertical translation to view middle of image
    }

    function panStart(event) {
      if (zoomer.state == "enabled-slide") {
        setState("enabled");
        var t = (Date.now() - frictionTime) / 300;
        if (t < 1) {
          clearTimeout(frictionTimer);
          var cb = 1 - Math.pow(1 - t, 1.685); // approximate cubic bezier y(x)
          var currentOffsetX = bound(destOffsetX + cb * slidex, [-boundX, boundX]);
          var currentOffsetY = bound(destOffsetY + cb * slidey, [-boundY, boundY]);
          transform(currentOffsetX, currentOffsetY, ratio);
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
      transform(destOffsetX, destOffsetY, ratio);
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
      transform(newOffsetX, newOffsetY, ratio);
      frictionTime = Date.now();
      frictionTimer = setTimeout(function() {
        setState("enabled");
      }, 300);
    }

    this.transitionEnd = function() {
      if (zoomer.state == "enabled-in") {
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
      else if (zoomer.state == "enabled-out") {
        setState("disabled");

        $img
          .off(downEvent + ".zoom", panStart)
          .off(moveEvent + ".zoom", panMove)
          .off(upEvent + ".zoom", panEnd);
      }
    }

    function setState(state) {
      zoomer.state = state;
      $img.attr("data-ur-state", state);
      if (zoomer.img.length == 1)
        $container.attr("data-ur-state", state); // backwards compatibility
    }

    function zoomHelper(x, y) {
      $btn.attr("data-ur-state", "enabled");
      setState("enabled-in");

      transform(x || 0, y || 0, ratio);
    }

    this.transform = transform;
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
      if (zoomer.state != "disabled")
        return;

      if (!width) {
        initialize();
        $img.css("width", width + "px");
        $img.css("height", height + "px");
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

      if (!prescale) {
        zoomer.state = "enabled-in";
        $img.attr("src", $img.attr("data-ur-src"));
        setTimeout(function() {
          if (!prescale)
            $idler.attr("data-ur-state", "enabled");
        }, 0);
      }
      else {
        var translateX = bound(bigWidth/2 - ratio * relX, [-boundX, boundX]);
        var translateY = bound(bigHeight/2 - ratio * relY, [-boundY, boundY]);
        zoomHelper(translateX, translateY);
      }
    };

    this.zoomOut = function() {
      if (zoomer.state != "enabled")
        return;
      $btn.attr("data-ur-state", "disabled");
      setState("enabled-out");
      transform(0, 0, 1);
    };

    if ($container.attr("data-ur-touch") != "disabled" || options.touch) {
      // make sure zoom works when dragged inside carousel
      $img.on(downEvent + ".zoom", function(e) {
        click = down = true;
        startCoords = getEventCoords(e);
      });
      $img.on(moveEvent + ".zoom", function(e) {
        var coords = getEventCoords(e);
        if (down && (Math.abs(startCoords.x - coords.x) + Math.abs(startCoords.x - coords.x)) > 0)
          click = false;
      });
      $img.on("click.ur.zoom", function(e) {
        if (click) {
          setActive(this);
          if (this == $img[0])
            self.zoomIn(e);
        }
      });
    }

    $img.on("load.ur.zoom", function() {
      if ($img.attr("src") == $img.attr("data-ur-src"))
        loadedImgs.push($img.attr("src"));
      $idler.attr("data-ur-state", "disabled");
      if (!prescale && zoomer.state == "enabled-in") {
        prescale = true;
        initialize();
        var translateX = bound(bigWidth/2 - ratio * relX, [-boundX, boundX]);
        var translateY = bound(bigHeight/2 - ratio * relY, [-boundY, boundY]);

        var delay = "0.3s";
        $img.css({ webkitTransitionDelay: delay, MozTransitionDelay: delay, OTransitionDelay: delay, transitionDelay: delay });

        zoomHelper(translateX, translateY);
      }
    });

    // zooms in to the center of the image
    this.zoom = function() {
      if (zoomer.state == "disabled") {
        if (!width) {
          initialize();
          $img.css("width", width + "px");
          $img.css("height", height + "px");
        }

        if (prescale)
          zoomHelper(0, 0);
        else {
          zoomer.state = "enabled-in";
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

    $img.on("webkitTransitionEnd.ur.zoom transitionend.ur.zoom", this.transitionEnd);
    }

    function setActive(img) {
      if ($img && img != $img[0]) {
        self.state = "enabled-out";
        var zoomImg = $img.data("urZoomImg");
        zoomImg.transform(0, 0, 1);
        zoomImg.transitionEnd();
      }
      $img = $(img);
    }

    // zoom in/out button, zooms in to the center of the image
    $(self.button).on(touchscreen ? "touchstart.ur.zoom" : "click.ur.zoom", function() {
      if (self.img.length > 1)
        setActive($(self.img).filter($container.find("[data-ur-state='active'] *"))[0]);
      else
        setActive(self.img[0]);
      $img.data("urZoomImg").zoom();
    });
  }
};
