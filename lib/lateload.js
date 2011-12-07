

/* lateload takes any element and 
 *
 *
 *
 */

(function () {
  
  function late_load (obj) {
    
    var self = this;
    var components = this.components = obj;

    var setEvents = function () {

      for (var temp in components){

        console.log(temp);
        switch(temp){
          case "scroll":
            x$(window).on(temp, function (e) {
              self.release_group(components["scroll"], "scroll");
            });
          break;
          case "load":
            x$(window).on(temp, function (e) {
              self.release_group(components["load"]);
            });
            break;
          case "DOMContentLoaded":
            x$("html").on(temp, function (e) {
              self.release_group(components["DOMContentLoaded"]);
            });
            break;
          case "click": case "touch":
            x$("html").on(temp, function (e) {
              var type = e.target.getAttribute("data-ur-ll-event")
              if (type == "click" || type == "touch") {
              //  console.log(e.target);
                self.release_element(e.target);
              }
            });
            break;
          default:
            break;
        }
      }
      // only handle scroll, load, domcontentloaded or mouse events

    }

    if (this.components === undefined) {}
    else{
      setEvents();
    }
  };

  late_load.prototype.preferences = {threshold: 300}

  late_load.prototype.release_element = function (obj) {

    if (obj.hasAttribute("data-ur-ll-src")){
      var type = "src";
      var loc = obj.getAttribute("data-ur-ll-src");
    }else if (obj.hasAttribute("data-ur-ll-href")){
      var type = "href";
      var loc = obj.getAttribute("data-ur-ll-href");
    }else{
      console.warn("Uranium Late Load: non-late-load element provided.");
      return
    }

    obj.removeAttribute(loc)
    obj.setAttribute(type, loc)
  }

  late_load.prototype.release_group = function (group, type) {
    var hi = type;
    console.log(type)
    for (var name in group){
      if (group[name].nodeType === undefined && (typeof(group) == "object")){
        late_load.prototype.release_group(group[name], type);
      } else if (typeof(group) == "object") {

        if (type != "scroll"){
          late_load.prototype.release_element(group[name]);
        }else if (scrollHelper(group[name]) == true){
          late_load.prototype.release_element(group[name]);
        }
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

    Ur.Widgets["late_load"] = ll;
  }

  return Ur.QuickLoaders['late_load'] = late_load;
})();
