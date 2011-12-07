

/*
 * lateload takes any element that has the data-ur-ll-src or
 * data-ur-ll-href attribute and then once requested, loads that
 * object
 */

(function () {
  
  function late_load (obj) {
    
    var self = this;
    var components = this.components = obj;
  }

  late_load.prototype.preferences = {threshold: 300}

  late_load.prototype.release_element = function (obj) {

    if (obj.hasAttribute("data-ur-ll-src")){
      var type = "src";
      var att = "data-ur-ll-src";
      var loc = obj.getAttribute(att);
    }else if (obj.hasAttribute("data-ur-ll-href")){
      var type = "href";
      var att = "data-ur-ll-href";
      var loc = obj.getAttribute();
    }else{
      //console.warn("Uranium Late Load: non-late-load element provided.");
      return
    }

    obj.removeAttribute(att)
    obj.setAttribute(type, loc)
  }

  late_load.prototype.release_group = function (group) {

    for (var name in group){
        if (group[name][1] != "scroll"){
          late_load.prototype.release_element(group[name][0]);
        }else if (scrollHelper(group[name][0]) == true){
          late_load.prototype.release_element(group[name][0]);
        }
    }

  }

  var scrollHelper = function (obj) {
    var fold = window.innerHeight + window.pageYOffset;

    var findPos = function(obj) {
      var curleft = curtop = 0;curtop
      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
      }
      return [curleft,curtop];
    }
    var pos = findPos(obj)
    return fold >= pos[1] - obj.offsetHeight - late_load.prototype.preferences.threshold;
  }

  var setEvents = function (obj) {
    var components = obj;

    for (var temp in components){

      console.log(temp);
      switch(temp){
        case "scroll":
          x$(window).on(temp, function (e) {
            late_load.prototype.release_group(components["scroll"], "scroll");
          });
        break;
        case "load":
          x$(window).on(temp, function (e) {
            late_load.prototype.release_group(components["load"]);
          });
          break;
        case "DOMContentLoaded":
          late_load.prototype.release_group(components["DOMContentLoaded"]);
          break;
        case "click": case "touch":
          x$("html").on(temp, function (e) {
            var type = e.target.getAttribute("data-ur-ll-event")
            if (type == "click" || type == "touch") {
              late_load.prototype.release_element(e.target);
            }
          });
          break;
        default:
        break;
      }
    }
  }


  var find = function () {
    var obj = {};
    var temp = [];
    var group;

    x$(document).find('[data-ur-ll-href],[data-ur-ll-src]').each( function () {
      group = this.getAttribute("data-ur-ll-event")
      if (group === null){
        group = "DOMContentLoaded";
      }
      obj[group] = []
      temp.push([this, group]);
    });

    for (var element in temp){
      obj[temp[element][1]].push(temp[element]);
    }

    return obj;
  }

  late_load.prototype.initialize = function() {
    var lateObj = find();
    var ll = new late_load(lateObj);
    setEvents(ll.components)
    Ur.Widgets["late_load"] = ll;
  }

  return Ur.QuickLoaders['late_load'] = late_load;
})();
