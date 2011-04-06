function ZoomPreview(elements){
  this.elements = elements;
  this.dimensions = {};
  this.centers = {};
  this.offsets = {};
  this.origins = {};
  this.zoom = false;

  this.update();
  
  this.initialize();
}

ZoomPreview.prototype.update = function() {
  var self = this;
  x$().iterate(
    ["zoom_button","zoom_image"],
    function(elem) {
      self.dimensions[elem] = [self.elements[elem].offsetWidth, self.elements[elem].offsetHeight];
      var offset = x$(self.elements[elem]).offset();
      self.offsets[elem] = [offset["left"], offset["top"]];
      self.centers[elem] = [self.dimensions[elem][0]/2.0 + self.offsets[elem][0],
                            self.dimensions[elem][1]/2.0 + self.offsets[elem][1]];
      self.origins[elem] = [-1.0/2.0*self.dimensions[elem][0], -1.0/2.0*self.dimensions[elem][1]];
    }
  );  
}

ZoomPreview.prototype.get_event_coordinates = function(event) {
  if (/mouse/.exec(event.type)){
    return [event.pageX, event.pageY];
  } else {
   if(event.touches.length == 1)
    {
      return [event.touches[0].clientX, event.touches[0].clientY];
    }
  }
}

ZoomPreview.prototype.initialize = function() {
  console.log(this.elements);

  
  // This will be touchmove
  x$(this.elements["zoom_button"]).on('mousemove',function(obj){return function(evt){obj.scroll_zoom(evt)};}(this));
  x$(this.elements["zoom_button"]).on('mouseout',function(obj){return function(evt){obj.scroll_end(evt)};}(this));

  x$(this.elements["zoom_button"]).on('touchmove',function(obj){return function(evt){obj.scroll_zoom(evt)};}(this));
  x$(this.elements["zoom_button"]).on('touchend',function(obj){return function(evt){obj.scroll_end(evt)};}(this));

  x$(this.elements["zoom_button"]).on('scroll', function() {console.log("scrolllllll")});
  x$(this.elements["zoom_button"]).on('mouseover', function(e) {console.log("mouseover"); e.preventDefault(); e.stopPropagation();}, true);


  var self = this;
  x$().iterate(
    this.elements["thumbnails"],
    function(thumbnail) {
      x$(thumbnail).click(
        function(obj){
          return function(evt){
            obj.elements["zoom_button"].src = evt.currentTarget.src;
            obj.elements["zoom_image"].src = evt.currentTarget.src;
            obj.update();
          };
        }(self)
      );
    }
  );

}

ZoomPreview.prototype.scroll_end = function(event) {
  this.zoom = false;
  this.elements["zoom_image"].style.visibility = "hidden";
}


ZoomPreview.prototype.scroll_zoom = function(event) {
  
  if (!this.zoom) {
    //Center the image
    this.elements["zoom_image"].style.webkitTransform = "translate3d(" + this.origins["zoom_image"][0] + "px," + this.origins["zoom_image"][1] + "px,0px)";
    this.elements["zoom_image"].style.visibility = "visible";
    console.log("zoom image styles:");
    console.log(getComputedStyle(this.elements["zoom_image"]));
    this.zoom = true;
  } else {
    var position = this.get_event_coordinates(event);
    if (position === null) {return false};

    var percents = [(position[0] - this.centers["zoom_button"][0])/this.dimensions["zoom_button"][0],
                    (position[1] - this.centers["zoom_button"][1])/this.dimensions["zoom_button"][1]];

    var translate = [this.origins["zoom_image"][0] + this.dimensions["zoom_image"][0] * percents[0],
                     this.origins["zoom_image"][1] + this.dimensions["zoom_image"][1] * percents[1]];

    console.log("origins:" + JSON.stringify(this.origins));
    console.log("dimensions:" + JSON.stringify(this.dimensions));
    console.log("percents:" + JSON.stringify(percents));
    console.log(translate);

    this.elements["zoom_image"].style.webkitTransform = "translate3d(" + translate[0] + "px," + translate[1] + "px,0px)";
  }
  event.preventDefault();
  event.stopPropagation();
  return false;
}


function ZoomPreviewLoader(){
}

ZoomPreviewLoader.prototype.collect_elements = function() {
  var raw_elements = x$("*[mw-zoom-preview]");
  this.zoom_previews = {};
  var self = this;

  raw_elements.filter(
    function() {
      var name = x$(this).attr("mw-zoom-preview");

      if (x$(this).hasClass("mw_zoom_preview")) {
        self.add_element(name,"zoom_container",this);
        x$().iterate(
          this.children,
          function(elem) {
            if(x$(elem).hasClass("mw_zoom_image")) {
              self.add_element(name, "zoom_image", elem);
            } else if (x$(elem).hasClass("mw_button")) {
              self.add_element(name, "zoom_button", elem);
            } else if (x$(elem).hasClass("mw_normal_image")) {
              self.add_element(name, "normal_image",elem);
            }
          }
        );
      }

      if(x$(this).hasClass("mw_thumbnails")) {
        var thumbnails = [];
        x$(this).find("img").each(
          function(elem) {
            thumbnails.push(elem);
          }
        );
        self.add_element(name, "thumbnails", thumbnails);
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

ZoomPreviewLoader.prototype.initialize = function() {
  this.collect_elements();
  for (name in this.zoom_previews) {
    new ZoomPreview(this.zoom_previews[name]);
  }
}

ZPL = new ZoomPreviewLoader();
window.addEventListener('load', function(){ ZPL.initialize();}, false);

