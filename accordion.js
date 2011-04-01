// This is not used yet ... but I'm going to put everything under the global scope so that we do it right from the beginning

if (typeof(Moovweb) == "undefined")
   Moovweb = {}
Moovweb.widgets = {}

//////////


function AccordionLoader(){
  this.classes = {
    "button" : "mw_accordion_button",
    "content" : "mw_accordion_content",
    "closed" : "closed"
  }
}

// This will be added to a queue of initialization methods that the global Moovweb object will call onload
AccordionLoader.prototype.find_accordions = function(){
  var accordion_elements = x$('*[mw_accordion]');
  var accordions = {};

  var buttons = accordion_elements.filter( 
    function() {
      if (x$(this).attr("mw_button").length == 1) {
	var name = x$(this).attr("mw_accordion");
	accordions[name] = {};
	accordions[name]["button"] = this;
	return true;
      }
      return false;
    }
  );
  var contents = accordion_elements.filter( 
    function() {
      if (x$(this).attr("mw_content").length == 1){
	var name = x$(this).attr("mw_accordion");
	try{
	  if (typeof(accordions[name]["content"]) == "undefined") {
	    accordions[name]["content"] = [];
	  }
	  accordions[name]["content"].push(this);
	} catch(e) {
	  console.log("Declaration error. Accordion content found for accordion:" + name + ", but no button could be found.");
	}
	return true;
      }
      return false;
    }
  );

  return accordions;
}

AccordionLoader.prototype.construct_button_callback = function(contents) {
  var self = this;
  return function(evt) { 
    var button = evt.currentTarget;
    x$(contents).each(
      function(){
	if(x$(this).hasClass(self.classes["closed"])) {
	  x$(this).removeClass(self.classes["closed"]);
	  x$(button).removeClass(self.classes["closed"])
	} else {
	  x$(this).addClass(self.classes["closed"]);
	  x$(button).addClass(self.classes["closed"])
	}
      }
    );
  }
}

AccordionLoader.prototype.initialize = function() {
  var accordions = this.find_accordions();
  var self = this;
  for(name in accordions){
    var accordion = accordions[name];
    x$(accordion["button"]).addClass(this.classes["closed"]);
    x$(accordion["button"]).addClass(this.classes["button"]);
    x$(accordion["button"]).click(this.construct_button_callback(accordion["content"]));

    x$(accordion["content"]).each(
      function() {
	x$(this).addClass(self.classes["content"]);
	x$(this).addClass(self.classes["closed"]);
      }
    );

  }
}

AL = new AccordionLoader();
window.addEventListener('load',function(){AL.initialize();},false);
