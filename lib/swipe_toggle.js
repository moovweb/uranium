
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
    var preferences = SwipeToggle.prototype.preferences;
    var flags = SwipeToggle.prototype.flags;
    var touch = {};
    SwipeToggle.prototype.components = {}

    var startPos = {x: 0, y: 0, time: 0};
    var endPos = {x: 0, y: 0, time: 0};

    if(components === undefined){}else{
      this.components = swipe_element;   
      var slider = swipe_element.slider;

      x$(swipe_element['next']).on("click", function(){
        Ur.Widgets.SwipeToggle[myName].next();
      });
      x$(swipe_element['prev']).on("click", function(){ 
        Ur.Widgets.SwipeToggle[myName].prev();
      });
      this.setActive(this.getActive())
    }

    var prefEvent = function () {
      var event = document.createEvent("Event");
      event.initEvent("preferences", false, true);
      slider.dispatchEvent(event);
    }

    var loadEvent = function () {
      var event = document.createEvent("Event");
      event.initEvent("carouselLoaded", false, true);
      slider.dispatchEvent(event);
    }

    var activeChangeEvent = function (obj) {
      var event = document.createEvent("Event");
      event.initEvent("newActive", false, true);
      event.active = obj;
      event.slider = obj.parentNode;
      event.activeElement = obj;
      slider.dispatchEvent(event);
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
      slider.addEventListener('touchstart', function (e){
        touch.start(e, this);
        e.stopPropagation();
      }, false);

      slider.addEventListener('touchmove', function (e){
        touch.continu(e, this);
        e.stopPropagation();
      }, false);

      slider.addEventListener('touchend', function (e){
        touch.end(e, this);
        e.stopPropagation();
      }, false);
    }

    var swipeDirection = function (){
      var buff = preferences.touchbuffer;

      if(startPos[axis] < endPos[axis] - buff){
        return 1;//right or top >>
      }else if(startPos[axis] > endPos[axis] + buff){
        return 2;//left or bottom <<
      }else{
        return 3;//tap
      }
    }

    SwipeToggle.prototype.getActive = function () {
      var active = x$(this.components.slider).find('[data-ur-swipe-toggle-component="slider"] > [data-ur-state="active"]')[0];
      return active;
    }

    SwipeToggle.prototype.next = function () {
      var activeObj = this.getActive();
      var jump = this.preferences.jump;

      for(var i = 0; i < jump; i++){
        if(lookAhead(activeObj) == true){
          var update = activeObj.nextElementSibling;
          activeObj = this.setActive(update);
        }
      }

      return activeObj;
    }

    SwipeToggle.prototype.prev = function () {
      var activeObj = this.getActive();
      var jump = this.preferences.jump;

      for(var i = 0; i < jump; i++){
        if(lookBehind(activeObj) == true){
          var update = activeObj.previousElementSibling;
          activeObj = this.setActive(update);
        }
      }

      return activeObj;
    }

    touch.start = function (e) {
      flags.touched = true;

      startPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: e.timeStamp
      };
      e.target.setAttribute('data-ur-touched', "true");
    }

    touch.continu = function (e) {

      endPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      var swipeDist =  endPos[axis] - startPos[axis];
    }

    touch.end = function (e) {
      endPos.time = e.timeStamp;
      e.target.removeAttribute('data-ur-touched');

      touchMove(e)

      touch.clear();
    }

    touch.clear = function () {
      startPos = {};
      endPos = {};
    }

    var touchMove = function (e) {
      var direction = swipeDirection();
      var target = e.target
      if (direction == 1) {
        SwipeToggle.prototype.prev()
      }else if (direction == 2){
        SwipeToggle.prototype.next()
      }else{
        console.log("tap")
        if (target.parentNode == slider){
          SwipeToggle.prototype.setActive(target);
        }
      }
    }

    if(components === undefined){}else{
      prefEvent();

      var axis = preferences.axis;
      if (axis == "x" || axis == "Y") {
      }else{
        console.log("incorrect axis set")
      }

      if (preferences.touch == true){
        setTouch();
      }

      loadEvent();
    }


  }





  SwipeToggle.prototype.preferences = { axis: "x", loop: true, touchbuffer: 20, tapActive: false,  touch: true, jump: 1 };

  SwipeToggle.prototype.flags = {touched: false};






  SwipeToggle.prototype.setActive = function (obj) {
    var i;
    var siblings = obj.parentNode.children.length;
    var previousSibling = obj.previousElementSibling;
    var nextSibling = obj.nextElementSibling;

    obj.setAttribute("data-ur-state", "active");

    for(i=0; i<=siblings; i++){
      if(previousSibling === null || previousSibling === undefined){}else{
        previousSibling.setAttribute("data-ur-state", "prev");
        previousSibling = previousSibling.previousElementSibling;
      }
      if(previousSibling === null){
        break;
      }
    }

    for(i=0; i<=siblings; i++){
      if(nextSibling === null || nextSibling === undefined){}else{
        nextSibling.setAttribute("data-ur-state", "next");
        nextSibling = nextSibling.nextElementSibling;
      }
      if(nextSibling === null){
        break;
      }
    }

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

      if (carousel_group["slider"] === undefined) {
        console.log("Uranium Declaration Error: No slider found for toggler with id = " + component_id);
        continue;
      }else{
        carousel_group["slider"]["active"] = x$(carousel_group["slider"]).find("[data-ur-state='active']")[0];
        if (carousel_group["slider"]["active"] === undefined) {
          console.log("Uranium Declaration Warning: No active element found for toggler with id = " + component_id);
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

    for(var name in swipe_group){
      var set = new SwipeToggle(swipe_group[name], name);
      Ur.Widgets["SwipeToggle"][name] = set;
    }

    return swipe_group;
  }

  return new SwipeToggle;
})

// // // side show carousel :: a addition to the slide toggler
// Ur.QuickLoaders['SideShow'] = (function(){
//   function SideShow () {
//   }
//   SideShow.prototype = new Ur.QuickLoaders['SwipeToggle'];
//   SideShow.prototype['bunnies'] = console.log('bunnies');
//   
//   SideShow.prototype.initialize = function () {
//     console.log("initializing side show")
//   }
//   
//   return new SideShow();
// })
