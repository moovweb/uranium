(function(){
  function AccordionLoader(){
    this.classes = {
      "button" : "mw_accordion_button",
      "content" : "mw_accordion_content",
      "closed" : "closed"
    }
  }

  AccordionLoader.prototype.find_accordions = function(){
    var accordion_elements = x$('*[mw_accordion]');
    var accordions = {};
    var self=this;
    var buttons = accordion_elements.filter( 
      function() {
        if (x$(this).hasClass(self.classes["button"])) {
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
        if (x$(this).hasClass(self.classes["content"])){
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

  // This will be added to a queue of initialization methods that the global Moovweb object will call onload
  AccordionLoader.prototype.initialize = function() {
    var accordions = this.find_accordions();
    var self = this;
    for(name in accordions){
      var accordion = accordions[name];
      x$(accordion["button"]).click(this.construct_button_callback(accordion["content"]));

    }
  }

  AL = new AccordionLoader();
  window.addEventListener('load', function(){ AL.initialize();}, false);
})()
