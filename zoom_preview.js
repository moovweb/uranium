(function(){

  function ZoomPreview(elements, modifier){
    this.elements = elements;
    this.modifier = {};
    
    if (modifier !== null) {
      this.modifier = modifier;
    }
    this.dimensions = {};
    this.zoom = false;

    this.update();
    this.events = {"start": "touchstart", "move" : "touchmove", "end" : "touchend"};

    this.touch = x$().touch_events();

    // Would be cool to compile this out
    if (!x$().touch_events())
      this.events = {"move" : "mousemove", "end" : "mouseout"};

    this.initialize();
    console.log("Zoom Preview Loaded");
  }

  ZoomPreview.prototype.rewrite_images = function(src, match, replace) {
    if(typeof(src) == "undefined")
      return false;

    if(match === undefined && replace === undefined) {
      match = this.modifier["zoom_image"]["match"];
      replace = this.modifier["zoom_image"]["replace"];
    }

    this.elements["zoom_image"].src = src.replace(match, replace);

    match = replace = null;

    if(this.modifier["zoom_button"]) {
      match = this.modifier["zoom_button"]["match"];
      replace = this.modifier["zoom_button"]["replace"];
    }

    if(match && replace) {
      this.elements["zoom_button"].src = this.elements["zoom_image"].src.replace(match, replace);
    } else {
      this.elements["zoom_button"].src = this.elements["zoom_image"].src;
    }

    var self = this;
    this.elements["zoom_image"].style.visibility = "hidden";
    x$(this.elements["zoom_image"]).on("load", function(){self.update()});  
    x$(this.elements["zoom_button"]).on("load", function(){x$(self.elements["zoom_button"]).addClass("loaded");});  
  }

  ZoomPreview.prototype.update = function() {
    var self = this;
    x$().iterate(
      ["zoom_button","zoom_image","zoom_container"],
      function(elem) {
        self.dimensions[elem] = [self.elements[elem].offsetWidth, self.elements[elem].offsetHeight];
      }
    );  

    var offset = x$(this.elements["zoom_button"]).offset();
    var button_offset = [offset["left"], offset["top"]];

    this.button_center = [this.dimensions["zoom_button"][0]/2.0 + button_offset[0],
                          this.dimensions["zoom_button"][1]/2.0 + button_offset[1]];

    this.image_origin = [-1.0/2.0*this.dimensions["zoom_image"][0], -1.0/2.0*this.dimensions["zoom_image"][1]];
  }

  ZoomPreview.prototype.get_event_coordinates = function(event) {
    if (!this.touch){
      return [event.pageX, event.pageY];
    } else {
      if(event.touches.length == 1)
      {
        return [event.touches[0].pageX, event.touches[0].pageY];
      }
    }
  }

  ZoomPreview.prototype.initialize = function() {
    x$(this.elements["zoom_button"]).on(this.events["move"],function(obj){return function(evt){obj.scroll_zoom(evt)};}(this));
    x$(this.elements["zoom_button"]).on(this.events["end"],function(obj){return function(evt){obj.scroll_end(evt)};}(this));

    // To prevent scrolling:
    if(this.events["start"]) {
      x$(this.elements["zoom_button"]).on("touchstart",function(obj){return function(evt){evt.preventDefault()};}(this));
    }

    var self = this;
    x$(this.elements["thumbnails"]).click(
      function(obj) {
        return function(evt){
          if (evt.target.tagName != "IMG")
            return false;
          obj.rewrite_images(evt.target.src); //, obj.modifier["match"], obj.modifier["replace"]);
        };
      }(self)
    );

    // Setup the initial button/zoom image:

    img = x$(this.elements["zoom_container"]).find(".mw_normal_image");
    this.rewrite_images(img.attr("src")[0], new RegExp(img.attr("zoom-modifier-match")[0]), img.attr("zoom-modifier-replace")[0]);
  }

  ZoomPreview.prototype.scroll_end = function(event) {
    this.elements["zoom_image"].style.visibility = "hidden";
  }

  ZoomPreview.prototype.scroll_zoom = function(event) {
    this.elements["zoom_image"].style.visibility = "visible";

    var position = this.get_event_coordinates(event);
    if (position === null) {return false};

    var percents = [(position[0] - this.button_center[0])/this.dimensions["zoom_button"][0],
                    (position[1] - this.button_center[1])/this.dimensions["zoom_button"][1]];

    var delta = [this.dimensions["zoom_image"][0] * percents[0],
                 this.dimensions["zoom_image"][1] * percents[1]];

    var translate = [this.image_origin[0] - delta[0],
                     this.image_origin[1] - delta[1]];
    
    translate = this.check_bounds(translate);
    this.elements["zoom_image"].style.webkitTransform = "translate3d(" + translate[0] + "px," + translate[1] + "px,0px)";
  }

  ZoomPreview.prototype.check_bounds = function(translate){
    var min = [this.dimensions["zoom_container"][0]-this.dimensions["zoom_image"][0], this.dimensions["zoom_container"][1]-this.dimensions["zoom_image"][1]];

    x$().iterate(
      [0,1],
      function(index){
        if (translate[index] >= 0)
          translate[index] = 0;
        if (translate[index] <= min[index])
          translate[index] = min[index];
      }
    );

    return translate;
  }


  function ZoomPreviewLoader(){
  }

  ZoomPreviewLoader.prototype.collect_elements = function() {
    var raw_elements = x$("*[mw-zoom-preview]");
    this.zoom_previews = {};
    this.modifiers = {};
    var self = this;

    raw_elements.filter(
      function() {
        var name = x$(this).attr("mw-zoom-preview");

        if (x$(this).hasClass("mw_zoom_container")) {
          self.add_element(name,"zoom_container",this);
          self.modifiers[name] = {};
          x$().iterate(
            this.children,
            function(elem) {
              if(x$(elem).hasClass("mw_zoom_image")) {
                self.add_element(name, "zoom_image", elem);
                self.add_modifiers(elem, name, "zoom_image");
              } else if (x$(elem).hasClass("mw_zoom_button")) {
                self.add_element(name, "zoom_button", elem);
                self.add_modifiers(elem, name, "zoom_button");
              } 
            }
          );
        }

        if(x$(this).hasClass("mw_zoom_thumbnails")) {
          self.add_element(name, "thumbnails", this);
        }
      }
    );

  }

  ZoomPreviewLoader.prototype.add_element = function(name, element_name, value) {
    if(typeof(this.zoom_previews[name]) == "undefined") {
      this.zoom_previews[name] = {};
    }
    this.zoom_previews[name][element_name] = value;
  }

  ZoomPreviewLoader.prototype.add_modifiers = function(element, name, element_name) {
    var match = x$(element).attr("src-modifier-match")[0];
    var replace = x$(element).attr("src-modifier-replace")[0];
    
    if(typeof(match) != "undefined" && typeof(replace) != "undefined") {
      this.modifiers[name][element_name] = {"match":new RegExp(match),"replace":replace};
    }
  }

  ZoomPreviewLoader.prototype.initialize = function() {
    this.collect_elements();
    for (name in this.zoom_previews) {
      new ZoomPreview(this.zoom_previews[name], this.modifiers[name]);
    }
  }

  ZPL = new ZoomPreviewLoader();
  window.addEventListener('load', function(){ ZPL.initialize();}, false);

})()