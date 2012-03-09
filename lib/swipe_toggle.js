
/* 

basic structure of swipe toggler
you must define the swipe toggle name and one active element
from there this will create the swipe toggle ability.

show this off with a fade in and card deck carousel.

<div data-ur-swipe-toggle="my_name">
<span data-ur-state="active">item1</span><span>itme2</span><span>itme3</span>
</div>

*/

// this is a swipe toggler
Ur.QuickLoaders['SwipeToggle'] = (function () {

  function swipeToggleComponents (group, content_component) {
    // This is a 'collection' of components
    // -- if I see it again, I'll make this abstract
    if(group["slider"] === undefined) {
      group["slider"] = [];
    }
    group["slider"].push(content_component);
  }

  function SwipeToggle (swipe_element, name){
    var myName = name;
    var components = swipe_element;
    var self = this;
    var touch = {};

    var preferences = this.preferences = { dots: false, axis: "x", swipeUpdate: true, sensitivity: 10, loop: true,
                         touchbuffer: 20, tapActive: false,  touch: true, jump: 1, loop: true,
                         autoSpeed: 500 };
    

    this.flags = {touched: false, autoID: null}
    var flags = this.flags;

                                    
    var startPos = endPos = markerPos = {x: 0, y: 0, time: 0};

    var loadEvent = function (obj) {
      var event = document.createEvent("Event");
      event.initEvent("loaded", false, true);
      obj.dispatchEvent(event);
    }

    var autoScroll = function(mili_sec){
      name = setInterval(function (){
        console.log(name);
        var imageArray = slider.children.length;
        
        if(SwipeToggle.prototype.flags  == true){
          window.clearInterval(name);
          wipeToggle.prototype.flags  == false;
        }else{
          myCarousel.next(1);
        }
        
      },mili_sec);
    }

    var setTouch = function () {

      var pef_touch = self.preferences.touch;

      slider.addEventListener('touchstart', function (e){
        if (pef_touch == true){
          touch.start(e, this);
        }
      }, false);

      slider.addEventListener('touchmove', function (e){
        if (pef_touch == true){
          touch.move(e, this);
        }
      }, false);

      slider.addEventListener('touchend', function (e){
        if (pef_touch == true){
          touch.end(e, this);
        }
      }, false);
    }

    var swipeDirection = function (){

      if (preferences) {
        var buff = preferences.touchbuffer;
      }else{
        var buff = 0;
      }

      if(startPos[axis] < endPos[axis] - buff){
        return 1;//right or top >>
      }else if(startPos[axis] > endPos[axis] + buff){
        return 2;//left or bottom <<
      }else{
        return 3;//tap
      }
    }

    SwipeToggle.prototype.getActive = function (e) {
      var test = this.components.name;
      var active = x$('[data-ur-id="' + test + '"][data-ur-swipe-toggle-component="slider"] > [data-ur-state="active"]')[0];
      return active;
    }

    SwipeToggle.prototype.next = function () {

      var activeObj = this.getActive();
      var jump = this.preferences.jump;
      var children = activeObj.parentNode.children;

      for(var i = 0; i < jump; i++){
        if(lookAhead(activeObj) == true){
          var update = activeObj.nextElementSibling;
          activeObj = this.setActive(update);
        }else if(lookAhead(activeObj) == false && this.preferences.loop == true){
          this.setActive(children[0])
        } 
      }

      return activeObj;
    }

    SwipeToggle.prototype.prev = function () {
      var activeObj = this.getActive();
      var jump = this.preferences.jump;
      var children = activeObj.parentNode.children;
      var last = children.length -1;

      for(var i = 0; i < jump; i++){
        if(lookBehind(activeObj) == true){
          var update = activeObj.previousElementSibling;
          activeObj = this.setActive(update);
        }else if(lookBehind(activeObj) == false && this.preferences.loop == true){
          this.setActive(children[last])
        }
      }

      return activeObj;
    }

    var touch = {};

    touch.start = function (e) {
      flags.touched = true;

      markerPos = startPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: e.timeStamp
      };

    }

    touch.move = function (e) {

      endPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      if(self.preferences.swipeUpdate == true){
        swipeUpdate(e);
      }

      var swipeDist =  endPos[axis] - startPos[axis];
    }

    touch.end = function (e) {
      endPos.time = e.timeStamp;

      touchMove(e)

      touch.clear();
    }

    touch.clear = function () {
      startPos = {};
      endPos = {};
      markerPos = {};
    }

    var swipeUpdate = function (e) {
      if(endPos[axis] + self.preferences.sensitivity < markerPos[axis]){
        self.next();
        markerPos = endPos;
        e.stopPropagation();
        e.preventDefault();
      }
      if(endPos[axis] - self.preferences.sensitivity > markerPos[axis]){
        self.prev();
        markerPos = endPos;
        e.stopPropagation();
        e.preventDefault();
      }
    }

    var touchMove = function (e) {
      var direction = swipeDirection();
      var target = e.target
      if (direction == 1) {
        self.prev()
      }else if (direction == 2){
        self.next()
      }else{
        if (target.parentNode == slider){
          self.setActive(target);
        }
      }
    }

    var activeIndex = function (Element){
      if (Element === undefined) {
        var obj = self.components.slider;
      } else {
        var obj = Element;
      }

      var length = obj.children.length;
      var i = 0;

      if (length > i) {
        for(i ; i < length; i++){
          if(obj.children[i].getAttribute('data-ur-state') == 'active'){
            break;
          }
        }
      }

      return i;
    }

    SwipeToggle.prototype.autoScroll = function (direction) {
      var imageArray = this.components.slider.children.length;
      var self = this;

      var autoID = name;

      window.clearInterval(this.flags.autoID);
       if (direction == "next" || direction == "prev"){}else{
        console.log("swipe_toggle: impropper autoScroll direction setting");
        direction = "next";
      }

     this.flags.autoID = autoID = window.setInterval(function (){
        var position = activeIndex();

        if((self.preferences.loop == false && position + 1 == imageArray) || flags.touched == true){
          window.clearInterval(self.flags.autoID);
        }else{
          self[direction]()
        }

      }, this.preferences.autoSpeed);
    }

    SwipeToggle.prototype.dots = function () {
      // create dots for the carousel
      
      var index = activeIndex(this.components.slider);
      var slider_name = this.components.name;
      var slider = this.components.slider;
      var imageLength = x$(slider)[0].children.length -1;
      var dotsDiv = document.createElement('div');
      var attributeName = "mw_swipe_toggle_dot"

      dotsDiv.setAttribute("class", "mw_" + slider_name + "_dots mw_swipe_dots")

      for(var i = 0; i < imageLength + 1; i++){
        tempDivHolder = document.createElement("div");
        tempDivHolder.id = 'mw_image_dot' + (i+1);
        dotsDiv.appendChild(tempDivHolder);
      }
      if (dotsDiv.children[0] === undefined){} else {
        dotsDiv.children[index].setAttribute(attributeName, "active");
      }
      x$(slider).after(dotsDiv);

      slider.addEventListener('update', function (e){
        // make new dot active
        var eventSlider = e.slider;
        var name = slider_name;
        var dots_name = "mw_" + slider_name + "_dots";

        var index = activeIndex(e.slider);

        for (var i = 0; i < imageLength + 1; i++) {
          dotsDiv.children[i].setAttribute(attributeName, "");
        }
        dotsDiv.children[index].setAttribute(attributeName, "active");
      });
    }

    SwipeToggle.prototype.autoPopulate = function (autoPopulateList, append) {
      var location = this.components.slider;
      if (autoPopulateList === undefined) {
        console.warn("Swipe Toggle: no items listed")
      }else if (append == "top" || append == "bottom"){
        for (var items in autoPopulateList) {
          x$(location)[append](autoPopulateList[items]);
        }
        this.setActive(this.components.slider.children[0]);
      }
    }

    if(components === undefined){}else{
      this.components = swipe_element;
      var slider = this.components.slider;

      x$(swipe_element['next']).on("click", function(e){
        Ur.Widgets.SwipeToggle[self.components.name].next(e);
      });
      x$(swipe_element['prev']).on("click", function(e){ 
        Ur.Widgets.SwipeToggle[self.components.name].prev(e);
      });

      if (this.components.slider.children[0] === undefined) {}else{
        this.setActive(this.getActive());
      }


      var axis = this.preferences.axis;
      if (axis == "x" || axis == "Y") {
      }else{
        Ur.error("incorrect axis set")
      }

      setTouch();

      if (this.preferences.dots == true) {
        this.dots()
      }
      loadEvent(this.components.slider);
    }
  }

  SwipeToggle.prototype.components = {}

  SwipeToggle.prototype.setActive = function (obj) {

    var activeChangeEvent = function (obj, parent) {
      var event = document.createEvent("Event");
      event.initEvent("update", false, true);
      event.active = obj;
      event.slider = obj.parentNode;
      event.activeElement = obj;
      parent.dispatchEvent(event);
    }

    var i;
    var slider = obj.parentNode;
    var siblings = slider.children.length;
    var previousSibling = obj.previousElementSibling;
    var nextSibling = obj.nextElementSibling;
    var nodeType = obj.nodeType;

    if (nodeType == 1 && slider == slider){
      obj.setAttribute("data-ur-state", "active");

      for(i=0; i<=siblings; i++){
        if(previousSibling === null || previousSibling === undefined){
          break;
        }else{
          previousSibling.setAttribute("data-ur-state", "prev" + (i+1));
          previousSibling = previousSibling.previousElementSibling;
        }
      }

      for(i=0; i<=siblings; i++){
        if(nextSibling === null || nextSibling === undefined){
          break;
        }else{
          nextSibling.setAttribute("data-ur-state", "next" + (i+1));
          nextSibling = nextSibling.nextElementSibling;
        }
      }
    }

    activeChangeEvent(obj, slider)

    return obj;
  }

  var lookAhead = function (obj) {
    if(obj.nextElementSibling === null){
      return false;
    }else{
      return true;
    }
  }

  var lookBehind = function (obj) {
    if(obj.previousElementSibling === null){
      return false;
    }else{
      return true;
    }
  }

  var find = function(fragment){
    var swipe_group = x$(fragment).find_elements('swipe-toggle');

    for(var component_id in swipe_group) {
      var carousel_group = swipe_group[component_id];
      carousel_group.name = component_id;
      if (carousel_group["slider"] === undefined) {
        Ur.error("no slider found for toggler with id = " + component_id);
        continue;
      }else if (carousel_group["slider"].children[0] === undefined){
        Ur.warn("no children in slider: " + carousel_group )
      }else{
        carousel_group["slider"]["active"] = x$(carousel_group["slider"]).find("[data-ur-state='active']")[0];
        Ur.warn("no active element found for toggler with id = " + component_id);
        if (carousel_group["slider"]["active"] === undefined) {
          console.log("no active element in slider: " + component_id)
          carousel_group["slider"]["active"] = carousel_group["slider"].children[0];
          carousel_group["slider"]["active"].setAttribute("data-ur-state", "active")
          console.log("set active element")
          continue;
        }
      }
    }
    return swipe_group;
  }

  SwipeToggle.prototype.initialize = function (fragment) {
    var swipe_group = find(fragment);
    Ur.Widgets["SwipeToggle"] = {};

    var prefEvent = function (obj) {
      var event = document.createEvent("Event");
      event.initEvent("preferences", false, true);
      obj.components.slider.dispatchEvent(event);
    }


    for(var name in swipe_group){
      Ur.Widgets["SwipeToggle"][name] = new SwipeToggle(swipe_group[name]);
      prefEvent(Ur.Widgets["SwipeToggle"][name]);
    }

    return swipe_group;
  }

  return new SwipeToggle;
})


