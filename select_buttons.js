(function(){

function SelectButtons(options) {
  this.select = options["select"];
  this.increment = options["mw_increment"];
  this.decrement = options["mw_decrement"];
  this.initialize();
}

SelectButtons.prototype.initialize = function() {
  x$(this.increment).click(function(obj){return function(evt){obj.trigger_option(evt, 1)};}(this));
  x$(this.decrement).click(function(obj){return function(evt){obj.trigger_option(evt, -1)};}(this));
}


SelectButtons.prototype.trigger_option = function(event, direction) {
  var button = event.currentTarget;
  if (x$(button).hasClass("disabled")) {
    return false;
  }
  var current_option = {};
  var value = this.select.value;
  var newValue = {"prev":null, "next":null};

  x$().iterate(
    this.select.children,
    function(option, index) {
      if(x$(option).attr("value")[0] == value) {
        current_option = {"element": option, "index": index};
      }

      if(typeof(current_option["index"]) == "undefined") {
        newValue["prev"] = x$(option).attr("value")[0];
      }

      if(index == current_option["index"] + 1) {
        newValue["next"] = x$(option).attr("value")[0];
      }
    }
  );

  var child_count = this.select.children.length;
  var new_index = current_option["index"] + direction;
  
  if (new_index == 0) {
    x$(this.decrement).addClass("disabled");
  } else {
    x$(this.decrement).removeClass("disabled");
  }

  if (new_index == child_count - 1) {
    x$(this.increment).addClass("disabled");
  } else {
    x$(this.increment).removeClass("disabled");
  }

  if (new_index < 0 || new_index == child_count) {
    return false;
  }

  direction = direction == 1 ? "next" : "prev";
  this.select.value = newValue[direction];

  return true;
}



// Potential bug: (not going to worry about it now)
// This is a bit tricky since I need to update the classes on the buttons if they're on an extreme/edge
// If the page can be loaded w any of the options selected, I can't apply these classes till onload
// -- so the solution i guess is to add the disable classes to the html, and they'll be removed when initialized

function SelectButtonsLoader(){
}

SelectButtonsLoader.prototype.find_select_buttons = function() {
  var raw_elements = x$("*[select-buttons]");
  var select_buttons = {};

  raw_elements.filter(
    function() {
      var name = x$(this).attr("select-buttons");
      if (x$(this)[0].tagName == "SELECT") {
        if (typeof(select_buttons[name]) == "undefined") {
          select_buttons[name] = {};
          select_buttons[name]["select"] = this;
        }
      } else {
        if (typeof(select_buttons[name]) == "undefined") {
          select_buttons[name] = {};
        }
        if(x$(this).hasClass("mw_button")) {
          var button = this;
          x$().iterate(
            ["mw_increment","mw_decrement"],
            function(type) {
              if(x$(button).hasClass(type)) {
                select_buttons[name][type] = button;
              }
            }
          );
        }
      }
    }
  );

  return select_buttons;
}

SelectButtonsLoader.prototype.initialize = function() {
  var select_buttons = this.find_select_buttons();
  var self = this;
  this.SelectButtons = {};
  for (name in select_buttons) {
    var select_button = select_buttons[name];
    new SelectButtons(select_buttons[name]);
  }
}

SBL = new SelectButtonsLoader();
window.addEventListener('load', function(){ SBL.initialize();}, false);

})()