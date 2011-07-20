/* Tabs *
 * * * * * *
 * The tabs are like togglers with state. If one is opened, the others are closed
 * 
 * Question: Can I assume order is preserved? Ill use IDs for now
 */

Ur.QuickLoaders['tabs'] = (function(){
  function Tabs(data){
    this.elements = data;
    this.setup_callbacks();
  }

  Tabs.prototype.setup_callbacks = function() {
    var default_tab = null;

    for(tab_id in this.elements["buttons"]) {

      var button = this.elements["buttons"][tab_id];
      var content = this.elements["contents"][tab_id];

      if (default_tab === null) {
        default_tab = tab_id;
      }

      if(content === undefined) {
        console.log("Ur error -- no matching tab content for tab button");
        return
      }
      
      var state = x$(button).attr("data-ur-state")[0];
      if(state !== undefined && state == "enabled") {
        default_tab = -1;
      }

      var self = this;
      x$(button).on(
        "click",
        function(evt) {
          var this_tab_id = x$(evt.target).attr("data-ur-tab-id")[0];
          
          for(tab_id in self.elements["buttons"]) {
            var button = self.elements["buttons"][tab_id];
            var content = self.elements["contents"][tab_id];

            if (tab_id !== this_tab_id) {
              x$(button).attr("data-ur-state","disabled");
              x$(content).attr("data-ur-state","disabled");
            } else {
              x$(button).attr("data-ur-state","enabled");
              x$(content).attr("data-ur-state","enabled");
            }
          }
        }
      ); 

    }

    // Enable the first one
    if(default_tab !== null && default_tab !== -1) {
      var button = this.elements["buttons"][default_tab];
      var content = this.elements["contents"][default_tab];
      
      x$(button).attr("data-ur-state","enabled");
      x$(content).attr("data-ur-state","enabled");      
    }

  }
  
  var ComponentConstructors = {
    "button" : function(group, component, type) {
      if (group["buttons"] === undefined) {
        group["buttons"] = {}
      }
      
      var tab_id = x$(component).attr("data-ur-tab-id")[0];
      if (tab_id === undefined) {
        console.log("Uranium declaration error -- Tab defined without a tab-id");
        return
      }
      
      group["buttons"][tab_id] = component;
    },
    "content" : function(group, component, type) {
      if (group["contents"] === undefined) {
        group["contents"] = {}
      }
      
      var tab_id = x$(component).attr("data-ur-tab-id")[0];
      if (tab_id === undefined) {
        console.log("Uranium declaration error -- Tab defined without a tab-id");
        return
      }
      
      group["contents"][tab_id] = component;
    }
  }

  function TabsLoader(){
  }

  TabsLoader.prototype.initialize = function(fragment) {
    var tabs = x$(fragment).find_elements('tabs', ComponentConstructors);
    console.log("raw tabs:", tabs);
    Ur.Widgets["tabs"] = {};

    for(name in tabs){
      var tab = tabs[name];
      Ur.Widgets["tabs"][name] = new Tabs(tabs[name]);
    }
  }

  return TabsLoader;
})()
