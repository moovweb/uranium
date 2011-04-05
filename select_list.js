function SelectList(select_element, list_element){
  this.classes = {"selected" : "mw_list_item_selected"};
  this.select = select_element;
  this.list = list_element;
  this.initialize();
}

SelectList.prototype.initialize = function() {
  x$(this.list).click(function(obj){return function(evt){obj.trigger_option(evt)}}(this));  
}

SelectList.prototype.trigger_option = function(event) {
  var selected_list_option = event.target;
  var value = "";
  var self = this;
  x$().iterate(
    this.list.children,
    function(element, index){
      if(element == selected_list_option) {
	x$(element).addClass(self.classes["selected"]);
	value = x$(element).attr("value");
      } else {
	x$(element).removeClass(self.classes["selected"]);
      }
    }
  );

  //  x$(this.select).attr("value",value); //Odd - this doesn't work, but the following line does
  this.select.value = value;

  return true;
}


function SelectListLoader(){
  this.SelectLists = {};
}

SelectListLoader.prototype.find_select_lists = function() {
  var select_list_elements = x$("*[select-list]");
  var select_lists = {};

  select_list_elements.filter(
    function() {
      var name = x$(this).attr("select-list");
      if (x$(this)[0].tagName == "SELECT") {
	if (typeof(select_lists[name]) == "undefined") {
	  select_lists[name] = {};
	  select_lists[name]["select"] = this;
	}
      } else {
	if (typeof(select_lists[name]) == "undefined") {
	  select_lists[name] = {};
	  select_lists[name]["content"] = this;
	} else {
	  if (typeof(select_lists[name]["content"]) != "undefined") {
	    console.log("Declaration error. Duplicate select content found for select: " + name);
	  } else {
	    select_lists[name]["content"] = this;
	  }
	}
      }
    }
  );

  return select_lists;
}

SelectListLoader.prototype.initialize = function() {
  var select_lists = this.find_select_lists();
  var self = this;
  for (name in select_lists) {
    var select_list = select_lists[name];
    self.SelectLists[name] = new SelectList(select_lists[name]["select"],select_lists[name]["content"]);
  }
}

SLL = new SelectListLoader();
window.addEventListener('load', function(){ SLL.initialize();}, false);

