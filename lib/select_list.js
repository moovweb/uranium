/* Select List *
 * * * * * * * *
 * The select-list binds a set of uranium-elements to corresponding <option> 
 * elements of a <select>. Clicking the uranium-element sets the <select>'s 
 * value to match the corresponding <option> element.
 * 
 */

// A concern here is the initial state -- I think the default should be just
// that there is no initial state -- the user must click to update the state
// -- the reason is, if there is an initial state, the underlying selector's
// state may be different on render, and there will be a gap until onload 
// while the states mismatch -- if the user is fast enough to click a form 
// in that time, they will get unexpected results.

Ur.QuickLoaders['select-list'] = (function(){

  function SelectList(select_element, list_element){
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
    iterate(this, selected_list_option);
    //  x$(this.select).attr("value",value); //Odd - this doesn't work, but the following line does
    // -- I think 'value' is a special attribute ... its not in the attributes[] property of a node
    this.select.value = value;

    return true;
  }

  function iterate (obj, selected_obj) {
    x$().iterate(
      obj.list.children,
      function(element, index){
        var val1 = element.getAttribute("value");
        var val2 = selected_obj.getAttribute("value");
        if(val1 == val2) {
          x$(element).attr("data-ur-state","enabled");
          value = x$(element).attr("value");
        } else {
          x$(element).attr("data-ur-state","disabled");
        }
      }
    );
  }

  function matchSelected (obj) {
    var active;
    var option = x$(obj).find("option").each(function () {
      var selected = x$(this).attr("selected")[0];
      if (selected === undefined ){
      }else{
        active = this;
      } 
    });
    iterate(obj, active);
  }

  function SelectListLoader(){
    this.SelectLists = {};
    // Keep instances here because we may need them in the future
    // - In v1 we had to listen for changes on the <select>'s and update appropriately
    // - Sometimes we had to listen for different events
  }


  SelectListLoader.prototype.initialize = function(fragment) {
    var select_lists = x$(fragment).find_elements('select-list');
    var self = this;
    for (var name in select_lists) {
      var select_list = select_lists[name];
      self.SelectLists[name] = new SelectList(select_lists[name]["select"],select_lists[name]["content"]);
      x$(select_list["set"]).attr("data-ur-state","enabled");
      matchSelected(self.SelectLists[name])
    }
  }

  return SelectListLoader;
})();
