// Zoom
interactions.zoom = function ( fragment ) {
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
    this.img = set["img"][0];
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

    var $img = $(this.img);
    var $idler = $(this.idler);
    var $btn = $(this.button);

    var boundX, boundY;
    var relX, relY;
    var offsetX = 0, offsetY = 0;
    var touchX = 0, touchY = 0;
    var mouseDown = false; // only used on non-touch browsers
    var mouseDrag = true;

    var translatePrefix = "translate(", translateSuffix = ")";
    var scalePrefix = " scale(", scaleSuffix = ")";


    var startCoords, click, down; // used for determining if zoom element is actually clicked

    loadedImgs.push($img.attr("src"));

    function initialize() {
      var custom3d = $(self.container).attr("data-ur-transform3d");
      if (custom3d)
        self.transform3d = custom3d != "disabled";
      if (self.transform3d) {
        translatePrefix = "translate3d(";
        translateSuffix = ",0)";
        scalePrefix = " scale3d(";
        scaleSuffix = ",1)";
      }
      $(self.container).attr("data-ur-transform3d", self.transform3d ? "enabled" : "disabled");
      
      self.canvasWidth = self.canvasWidth || self.container.offsetWidth;
      self.canvasHeight = self.canvasHeight || self.container.offsetHeight;
      self.width = self.width || parseInt($img.attr("width")) || parseInt($img.css("width")) || self.img.width;
      self.height = self.height || parseInt($img.attr("height")) || parseInt($img.css("height")) || self.img.height;

      self.bigWidth = parseInt($img.attr("data-ur-width")) || self.img.naturalWidth;
      self.bigHeight = parseInt($img.attr("data-ur-height")) || self.img.naturalHeight;
      if (($img.attr("data-ur-width") && $img.attr("data-ur-height")) || $img.attr("src") == $img.attr("data-ur-src"))
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
      var touches = event.originalEvent.touches;
      if (touches) {
        touchX = touches[0].pageX;
        touchY = touches[0].pageY;
      }

      var style = self.img.style;
      if (window.WebKitCSSMatrix) {
        var matrix = new WebKitCSSMatrix(style.webkitTransform);
        offsetX = matrix.m41;
        offsetY = matrix.m42;
      }
      else {
        var transform = style.MozTransform || style.msTransform || style.transform || "translate(0, 0)";
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
      var touches = event.originalEvent.touches;
      if (touches) {
        x = touches[0].pageX;
        y = touches[0].pageY;
      }
      var dx = x - touchX;
      var dy = y - touchY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5)
        mouseDrag = true;
      var newOffsetX = bound(offsetX + dx, [-boundX, boundX]);
      var newOffsetY = bound(offsetY + dy, [-boundY, boundY]);
      transform(newOffsetX, newOffsetY, self.ratio);
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

        self.img.src = $img.attr("data-ur-src");
        if (loadedImgs.indexOf(self.img.getAttribute("data-ur-src")) == -1) {
          setTimeout(function() {
            if (loadedImgs.indexOf(self.img.getAttribute("data-ur-src")) == -1)
              $idler.attr("data-ur-state", "enabled");
          }, 16);
        }
        self.state = "enabled";
        self.container.setAttribute("data-ur-state", self.state);

        $(self.container)
          .on(downEvent + ".zoom", panStart)
          .on(moveEvent + ".zoom", panMove)
          .on(upEvent + ".zoom", panEnd);
      }
      else if (self.state == "enabled-out") {
        self.state = "disabled";
        self.container.setAttribute("data-ur-state", self.state);

        $(self.container)
          .off(downEvent + ".zoom", panStart)
          .off(moveEvent + ".zoom", panMove)
          .off(upEvent + ".zoom", panEnd);
      }
    }

    function zoomHelper(x, y) {
      $btn.attr("data-ur-state", "enabled");
      self.state = "enabled-in";
      self.container.setAttribute("data-ur-state", self.state);

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
        self.img.src = $img.attr("data-ur-src");
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

    if (self.container.getAttribute("data-ur-touch") != "disabled") {
      // make sure zoom works when dragged inside carousel
      $(self.container).on(downEvent + ".zoom", function(e) {
        click = down = true;
        startCoords = getEventCoords(e);
      });
      $(self.container).on(moveEvent + ".zoom", function(e) {
        var coords = getEventCoords(e);
        if (down && (Math.abs(startCoords.x - coords.x) + Math.abs(startCoords.x - coords.x)) > 0)
          click = false;
      });
      $(self.container).on("click.ur.zoom", function(e) {
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
          self.img.style.width = self.width + "px";
          self.img.style.height = self.height + "px";
        }

        if (self.prescale)
          zoomHelper(0, 0);
        else {
          self.state = "enabled-in";
          self.img.src = $img.attr("data-ur-src");
          setTimeout(function() {
            // if prescale ?
            if (loadedImgs.indexOf(self.img.getAttribute("data-ur-src")) == -1)
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
