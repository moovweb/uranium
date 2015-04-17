// Zoom
interactions.zoom = function ( fragment, options ) {
  options = $.extend({touch: true}, options);
  if (isPlainObj(fragment)) {
    var groups = assignElements(fragment, "zoom", function(set) {
      set.img = [];
      $.each(set.imgs, function() {
        $(this.img).attr({
          "data-ur-zoom-component": "img",
          "data-ur-width": this.width,
          "data-ur-height": this.height,
          "data-ur-src": this.src});
        set.img.push($(this.img));
      });
      $(set.loading).attr({"data-ur-zoom-component": "loading", "data-ur-state": "disabled"});
    });
  }
  else
    var groups = findElements(fragment, "zoom");

  $.each(groups, function(id, group) {
    Uranium.zoom[id] = new Zoom(this);
    $(group["set"]).data("urInit", true);
  });

  function Zoom(set) {
    var zoomer = this;
    this.container = set["set"];
    this.img = set["img"];

    // Optionally:
    this.button = set["button"];
    this.idler = set["loading"];

    var $container = $(this.container);
    var $idler = $(this.idler);
    var $btn = $(this.button);
    var activeImg; // needed for carousel zoom combination

    var gesturesEnabled = $container.attr("data-ur-touch") != "disabled" || options.touch;
    var translatePrefix = "translate(", translateSuffix = ")";
    var scalePrefix = " scale(", scaleSuffix = ")";

    this.transform3d = transform3d;
    var custom3d = $container.attr("data-ur-transform3d");
    if (custom3d)
      this.transform3d = custom3d != "disabled";
    else if ("transform3d" in options)
      this.transform3d = options.transform3d;

    if (zoomer.transform3d) {
      translatePrefix = "translate3d(";
      translateSuffix = ",0)";
      scalePrefix = " scale3d(";
      scaleSuffix = ",1)";
    }

    var imgs = $(zoomer.img).map(function() {
      return new Img(this);
    });

    function setActive(img) {
      if (activeImg && activeImg != img) {
        activeImg.zoomOut(true);
      }
      activeImg = img;
    }

    function closeEnough(coords1, coords2) {
      return Math.abs(coords1.x - coords2.x) < 8 && Math.abs(coords1.y - coords2.y) < 8;
    }

    function multiTouch(event) {
      var touches = event.originalEvent.touches;
      if (touches)
        return touches.length > (event.type == "touchend" ? 0 : 1);
    }

    function relativeCoords(event) {
      var coords = getEventCoords(event);
      var rect = event.target.getBoundingClientRect();
      return {
        x: coords.x - rect.left,
        y: coords.y - rect.top,
        x2: coords.x2 - rect.left,
        y2: coords.y2 - rect.top
      };
    }

    // zoom in/out button, zooms in to the center of the image
    $(zoomer.button).on("click.ur.zoom", function() {
      var active = imgs[0];
      // handle carousel zoom combination
      if (imgs.length > 1)
        active = imgs.filter(function() { return $(this.img).closest("[data-ur-state='active']", zoomer.container)[0]; })[0];
      setActive(active);
      active.zoom();
    });

    function Img(img) {
      var self = this;
      var state = "disabled";
      var $img = $(img);
      var canvasWidth, canvasHeight;
      var width, height;
      var bigWidth, bigHeight;
      var bigBounds; // translation bounds
      var currentBounds; // translation bounds
      var imgRatio;
      var prescale; // bigWidth and bigHeight are known
      var initAbsCoords, absCoords;
      var clickFlag, downFlag;
      var timeStamp;
      var transXY;

      // momentum sliding
      var frictionTime, frictionTimer;
      var dx1 = 0, dy1 = 0;
      var dx2 = 0, dy2 = 0;
      var time1 = 0, time2 = 0;
      var slidex, slidey;

      // pinch to zoom
      var initScale = 1, currentScale = 1;
      var initDist;
      var midpointCoords;

      this.img = img;

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

        imgRatio = bigWidth/width;

        var xb = (bigWidth - canvasWidth)/2; // horizonal translation to show left side of image
        var yb = (bigHeight - canvasHeight)/2; // vertical translation to show left top side of image
        currentBounds = bigBounds = { x: [-xb, xb], y: [-yb, yb] };

        $img.css("width", width + "px");
        $img.css("height", height + "px");
      }

      function getTranslate() {
        var style = $img[0].style;
        if (window.WebKitCSSMatrix) {
          var matrix = new WebKitCSSMatrix(style.webkitTransform);
          return { x: matrix.m41, y: matrix.m42 };
        }
        var css = style.msTransform || style.transform || "translate(0, 0)";
        css = css.substring(css.indexOf("(") + 1).split(",");
        return { x: parseFloat(css[0]), y: parseFloat(css[1]) };
      }

      function panMove(event) {
        stifle(event);
        var coords = getEventCoords(event);
        var dx = coords.x - absCoords.x;
        var dy = coords.y - absCoords.y;
        destOffsetX = clamp(transXY.x + dx, currentBounds.x);
        destOffsetY = clamp(transXY.y + dy, currentBounds.y);
        transform(destOffsetX, destOffsetY, currentScale);
        dx1 = dx2;
        dy1 = dy2;
        dx2 = dx;
        dy2 = dy;
        time1 = time2;
        time2 = event.timeStamp;
      }

      function panEnd(event) {
        stifle(event);
        if (event.timeStamp < time2 + 50)
          slide();
      }

      function slide() {
        setState("enabled-slide");
        var ddx = dx2 - dx1, ddy = dy2 - dy1;
        var scalar = 100 * Math.sqrt((ddx * ddx + ddy * ddy)/(dx2 * dx2 + dy2 * dy2))/(time2 - time1);
        slidex = scalar * dx2;
        slidey = scalar * dy2;
        var newOffsetX = clamp(destOffsetX + slidex, currentBounds.x);
        var newOffsetY = clamp(destOffsetY + slidey, currentBounds.y);
        transform(newOffsetX, newOffsetY, currentScale);
        frictionTime = Date.now();
        frictionTimer = setTimeout(function() {
          setState("enabled");
        }, 300);
      }

      function stopSlide() {
        setState("enabled");
        var t = (Date.now() - frictionTime) / 300;
        clearTimeout(frictionTimer);
        var cb = 1 - Math.pow(1 - t, 1.685); // approximate cubic bezier y(x)
        var currentOffsetX = clamp(destOffsetX + cb * slidex, currentBounds.x);
        var currentOffsetY = clamp(destOffsetY + cb * slidey, currentBounds.y);
        transform(currentOffsetX, currentOffsetY, currentScale);
      }

      // should this be separated into pinchIn/Out?
      // zoom in/out with midpoint as the "tranform origin"
      function pinchZoom(event) {
        var coords = getEventCoords(event);
        var dx = coords.x2 - coords.x;
        var dy = coords.y2 - coords.y;
        var dist = dx * dx + dy * dy;
        var diagonal = width * width + height * height;
        var deltaDist = dist - initDist;
        currentScale = clamp(initScale + 4 * imgRatio * deltaDist/diagonal, [1, imgRatio]);
        var dScale = currentScale/initScale;
        var xb = (currentScale * width - canvasWidth)/2, yb = (currentScale * height - canvasHeight)/2;
        currentBounds = { x: [-xb, xb], y: [-yb, yb] };
        var newX = clamp(transXY.x * dScale + (dScale - 1) * (canvasWidth/2 - midpointCoords.x), currentBounds.x);
        var newY = clamp(transXY.y * dScale + (dScale - 1) * (canvasHeight/2 - midpointCoords.y), currentBounds.y);
        transform(newX, newY, currentScale);
      }

      function setState(s) {
        state = s;
        $img.attr("data-ur-state", state);
        if (zoomer.img.length == 1)
          $container.attr("data-ur-state", state); // backwards compatibility
      }

      function transform(x, y, scale) {
        currentScale = scale;
        var t = "";
        if (x != null)
          t = translatePrefix + x + "px, " + y + "px" + translateSuffix;
        if (scale != null)
          t += scalePrefix + scale + ", " + scale + scaleSuffix;

        return $img.css({ webkitTransform: t, msTransform: t, transform: t });
      }

      function loadImg() {
        if ($img.attr("src") == $img.attr("data-ur-src"))
          return;
        $img.attr("src", $img.attr("data-ur-src"));
        setTimeout(function() {
          if (!prescale)
            $idler.attr("data-ur-state", "enabled");
        }, 13);
      }

      function zoomload(coords) {
        state = "enabled-in";
        $img.one("load.ur.zoom", function() {
          initialize();
          state = "disabled";
          self.zoomIn(coords);
        });

        loadImg();
      }

      function carouselSnapping() {
        return $container.parent().closest("[data-ur-state='enabled-slide']")[0];
      }

      // attempts to zoom in centering in on the area that was touched
      this.zoomIn = function(coords) {
        if (state != "disabled")
          return;

        if (!width)
          initialize();

        if (prescale) {
          currentBounds = bigBounds;
          var trX = 0, trY = 0; // relative to center of image
          if (coords) {
            trX = clamp(bigWidth/2 - imgRatio * coords.x, bigBounds.x);
            trY = clamp(bigHeight/2 - imgRatio * coords.y, bigBounds.y);
          }
          $btn.attr("data-ur-state", "enabled");
          setState("enabled-in");
          transform(trX, trY, imgRatio);
        }
        else
          zoomload(coords);
      };

      this.zoomOut = function(now) {
        $btn.attr("data-ur-state", "disabled");
        setState(now ? "disabled" : "enabled-out");
        transform(0, 0, 1);
      };

      // zoom in/out center of image
      this.zoom = function() {
        if (state == "disabled")
          self.zoomIn();
        else if (state == "enabled")
          self.zoomOut();
      };

      $img.on(downEvent + ".zoom", function(event) {
        if (carouselSnapping())
          return;
        downFlag = true;
        if (state == "enabled-slide")
          stopSlide();
        if (state != "enabled-in" && state != "enabled-out") {
          absCoords = getEventCoords(event);
          initScale = currentScale;
          transXY = getTranslate();
          if (multiTouch(event)) {
            clickFlag = false;
            var dx = absCoords.x2 - absCoords.x;
            var dy = absCoords.y2 - absCoords.y;
            initDist = dx * dx + dy * dy;
            initialize();

            var rel = relativeCoords(event);
            midpointCoords = {
              x: ((rel.x + rel.x2)/2 + transXY.x)/initScale,
              y: ((rel.y + rel.y2)/2 + transXY.y)/initScale
            };
            initAbsCoords = absCoords;
          }
          else {
            clickFlag = true;
            initAbsCoords = absCoords;
            timeStamp = event.timeStamp;
            // panStart
            if (state == "enabled")
              stifle(event);
          }
        }
      });

      $img.on(moveEvent + ".zoom", function(event) {
        var mt = multiTouch(event);
        if (mt) {
          stifle(event); // prevent native browser pinch zoom
        }
        if (carouselSnapping())
          return;
        if (!downFlag)
          return;
        var close = closeEnough(getEventCoords(event), initAbsCoords)
        if (mt || !close)
          clickFlag = false;
        if (mt) {
          if (state == "disabled" && close) { // make sure not currently dragging carousel
            $btn.attr("data-ur-state", "enabled");
            setState("enabled");
          }
        }
        if (gesturesEnabled && state == "enabled") {
          if (mt) {
            if (prescale)
              pinchZoom(event);
            else
              zoomload();
          }
          else
            panMove(event);
        }
      });

      $img.on(upEvent + ".zoom", function(event) {
        if (carouselSnapping())
          return;
        var mt = multiTouch(event);
        if (mt) {
          // desired behavior?
          // allow panning right after pinch zoom
          transXY = getTranslate();
          absCoords = getEventCoords(event);
        }
        else
          downFlag = false;
        if (clickFlag) {
          if (event.timeStamp - timeStamp < 400) {
            if (state == "enabled") {
              self.zoomOut();
            }
            else if (state == "disabled") {
              setActive(self);
              self.zoomIn(relativeCoords(event));
            }
          }
        }
        else if (state == "enabled") {
          loadImg(); // after initial pinch zoom
          if (currentScale == 1) {
            // fully pinch zoomed out
            $btn.attr("data-ur-state", "disabled");
            setState("disabled");
          }
          else if (!mt)
            panEnd(event);
        }
      });

      $img.on("webkitTransitionEnd.ur.zoom transitionend.ur.zoom", function() {
        // done zooming in
        if (state == "enabled-in") {
          loadImg();
          setState("enabled");
          initScale = imgRatio;
        }
        // done zooming out
        else if (state == "enabled-out") {
          setState("disabled");
        }
      });

      $img.on("load.ur.zoom", function() {
        $idler.attr("data-ur-state", "disabled");
      });
    }
  }
};
