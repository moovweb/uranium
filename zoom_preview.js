function ZoomPreview(elements){
  this.elements = elements;
  this.dimensions = {};
  this.centers = {};
  this.offsets = {};
  this.origins = {};
  this.zoom = false;

  this.update();
  this.events = {"move" : "touchmove", "end" : "touchend"}

  // Would be cool to compile this out
  if (!x$().touch_events())
    this.events = {"move" : "mousemove", "end" : "mouseout"}

  this.initialize();
  console.log("Zoom Preview Loaded");
}

ZoomPreview.prototype.update = function() {
  var self = this;
  x$().iterate(
    ["zoom_button","zoom_image","zoom_container"],
    function(elem) {
      self.dimensions[elem] = [self.elements[elem].offsetWidth, self.elements[elem].offsetHeight];
      var offset = x$(self.elements[elem]).offset();
      self.offsets[elem] = [offset["left"], offset["top"]];
      self.centers[elem] = [self.dimensions[elem][0]/2.0 + self.offsets[elem][0],
                            self.dimensions[elem][1]/2.0 + self.offsets[elem][1]];
      self.origins[elem] = [-1.0/2.0*self.dimensions[elem][0], -1.0/2.0*self.dimensions[elem][1]];
    }
  );  
  console.log(JSON.stringify(this.dimensions));
  console.log(this.elements);
}

ZoomPreview.prototype.get_event_coordinates = function(event) {
  console.log("type:" + event.type);
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
  x$(this.elements["zoom_button"]).on(this.events["move"],function(obj){return function(evt){obj.scroll_zoom(evt)};}(this));
  x$(this.elements["zoom_button"]).on(this.events["end"],function(obj){return function(evt){obj.scroll_end(evt)};}(this));

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
  this.elements["zoom_image"].style.visibility = "hidden";
}

ZoomPreview.prototype.scroll_zoom = function(event) {
  this.elements["zoom_image"].style.visibility = "visible";

    var position = this.get_event_coordinates(event);

    if (position === null) {return false};

    var percents = [(position[0] - this.centers["zoom_button"][0])/this.dimensions["zoom_button"][0],
                    (position[1] - this.centers["zoom_button"][1])/this.dimensions["zoom_button"][1]];

    var delta = [this.dimensions["zoom_image"][0] * percents[0],
                this.dimensions["zoom_image"][1] * percents[1]];

    var translate = [this.origins["zoom_image"][0] - delta[0],
                     this.origins["zoom_image"][1] - delta[1]];
    
    translate = this.check_bounds(translate);
    this.elements["zoom_image"].style.webkitTransform = "translate3d(" + translate[0] + "px," + translate[1] + "px,0px)";

  event.preventDefault();
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
  var self = this;

  raw_elements.filter(
    function() {
      var name = x$(this).attr("mw-zoom-preview");

      if (x$(this).hasClass("mw_zoom_preview") && x$(this).hasClass("mw_container")) {
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

