
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
  function SwipeToggle () {
    this.component_constructors = {
      "slider" : swipeSlider,
      "next"   : nextButton,
      "prev"   : prevButton
    };
    
    prefEvent();
    setTouch();
    loadEvent();
  }

  function swipeToggleComponents(){
  }

  SwipeToggle.prototype.preferences = { tapActive: false, jump: 1 };

  var name = "betty";
  var components = [];
  var parent = document.body;
  var container = document.body;

  var prefEvent = function () {
    var event = document.createEvent("Event");
    event.initEvent("preferences", false, true);
    parent.dispatchEvent(event);
  }

  var loadEvent = function () {
    var event = document.createEvent("Event");
    event.initEvent("carouselLoaded", false, true);
    parent.dispatchEvent(event);
  }

  var activeChangeEvent = function (obj) {
    var event = document.createEvent("Event");
    event.initEvent("newActive", false, true);
    event.this = obj;
    event.slider = obj.parentElement;
    event.activeElement = obj;
    parent.dispatchEvent(event);
  }

  SwipeToggle.prototype.getActive = function () {
    var active = x$('[data-ur-swipe-toggle="'+ name +'"] > [data-ur-state="active"]')[0];
    return active;
  }

  SwipeToggle.prototype.setActive = function (obj) {
    var i;
    var siblings = obj.parentElement.children.length;
    var previousSibling = obj.previousElementSibling;
    var nextSibling = obj.nextElementSibling;

    obj.setAttribute("data-ur-state", "active");

    for(i=0; i<=siblings; i++){
      if(previousSibling === null || previousSibling === undefined){}else{
        previousSibling.setAttribute("position", "prev");
        previousSibling = previousSibling.previousElementSibling;
      }
      if(previousSibling === null){
        break;
      }
    }

    for(i=0; i<=siblings; i++){
      if(nextSibling === null || nextSibling === undefined){}else{
        nextSibling.setAttribute("position", "next");
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
      if(obj.nextElementSibling.nextElementSibling === null){
        return false;
      }
      return true;
    }
  }

  var lookBehind = function (obj) {
    if(obj.previousElementSibling === null){
      return false;
    }else{
      if(obj.previousElementSibling.previousElementSibling === null){
        return false;
      }
      return true;
    }
  }

  var setTouch = function () {
    container.addEventListener('touchstart', function (e){
      if(paraScroll[myName].preferences.axis == "y"){
        e.preventDefault();
      }
      touch.start.touchEventGO(e, this);
    e.stopPropagation();
    }, false);

    container.addEventListener('touchmove', function (e){
      touch.continu(e, this);
    e.stopPropagation();
    }, false);

    container.addEventListener('touchend', function (e){
      touch.end(e, this);
    e.stopPropagation();
    }, false);
  }

  SwipeToggle.prototype.next = function () {
    var activeObj = this.getActive();
    var jump = this.preferences.jump;

    for(var i = 0; i <= jump; i++){
      if(lookAhead(activeObj) == true){
        var update = activeObj.nextElementSibling;
        activeObj = this.setActive(update);
      }
    }

    return activeObj;
  }

  SwipeToggle.prototype.prev = function () {console.log('prev')}


  SwipeToggle.prototype.find = function(fragment){
    var swipeGroup = x$(fragment).find_elements('swipe_toggle', this.component_constructors);
  }
  
  SwipeToggle.prototype.initialize = function (fragment) {
    var swipeGroup = this.find(fragment);

    for(var name in swipeGroup){
      var swipeSet = swipeGroup[name];
      
      console.log(swipeGroup[name])
      x$(swipeSet["button"]).click(this.construct_button_callback(swipeSet["content"], swipeSet["set"]));
      x$(swipeSet["set"]).attr("data-ur-state","enabled");
    }
    console.log("initializing swipe toggle")
  }

  return new SwipeToggle;
})

// // side show carousel :: a addition to the slide toggler
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