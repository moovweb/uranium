/* Flex Table *
 * * * * * *
 * The flex table widget will take a full-sized table and make it fit 
 * on a variety of different viewport sizes.  
 * 
 */

Ur.QuickLoaders['flex-table'] = (function(){
  
  // Add an enhanced class to the tables the we'll be modifying
  function addEnhancedClass (tbl) {
    x$(tbl).addClass("enhanced");
  }
  
  
  function flexTable(aTable) {
    
    // TODO :: Add the ability to pass in options
    this.options = {
      idprefix: 'col-',   // specify a prefix for the id/headers values
      persist: "persist", // specify a class assigned to column headers (th) that should always be present; the script not create a checkbox for these columns
      checkContainer: null // container element where the hide/show checkboxes will be inserted; if none specified, the script creates a menu
    };
    
    var self = this, 
        o = self.options,
        table = aTable.table,
        thead = aTable.head,
        tbody = aTable.body,
        hdrCols = x$(thead).find('th'),
        bodyRows = x$(tbody).find('tr'), 
        container = o.checkContainer ? x$(o.checkContainer) : x$('<div class="table-menu table-menu-hidden"><ul /></div>');
    
    addEnhancedClass(table);
    
    hdrCols.each(function(elm, i){
      var th = x$(this),
          id = th.attr('id'),
          classes = th.attr('class');
      
      // assign an id to each header, if none is in the markup
      if (id.length === 0) {
        id = ( o.idprefix ? o.idprefix : "col-" ) + i;
        th.attr('id', id); 
      }
      
      // assign matching "headers" attributes to the associated cells
      // TEMP - needs to be edited to accommodate colspans
      bodyRows.each(function(e, j){
        var cells = x$(e).find("th, td");
        cells.each(function(cell, k) {
          if (cell.cellIndex == i) {
            x$(cell).attr('headers', id);
            if (classes.length !== 0) { x$(cell).addClass(classes[0]); };
          }
        });
      });
      
      // create the show/hide toggles
      if ( !th.hasClass(o.persist) ) {
        var toggle = x$('<li><input type="checkbox" name="toggle-cols" id="toggle-col-'+i+'" value="'+id+'" /> <label for="toggle-col-'+i+'">'+th.html()+'</label></li>');

        container.find('ul').bottom(toggle);
        
        var tgl = toggle.find("input")
        
        tgl.on("change", function() {
          
          var input = x$(this),
              val = input.attr('value');
              cols = x$("#" + val[0] + ", [headers=" + val[0] + "]");
          
          if (!this.checked) { 
            cols.addClass('ur_ft_hide'); 
            cols.removeClass("ur_ft_show"); }
          else { 
            cols.removeClass("ur_ft_hide"); 
            cols.addClass('ur_ft_show'); }
        });
        tgl.on("updateCheck", function(){
          if ( th.getStyle("display") == "table-cell" || th.getStyle("display") == "inline" ) {
            x$(this).attr("checked", true);
          }
          else {
            x$(this).attr("checked", false);
          }
        });
        tgl.fire("updateCheck");
      }
      
    }); // end hdrCols loop
    
    // Update the inputs' checked status
    x$(window).on('orientationchange', function() {
      container.find('input').fire('updateCheck');
    });
    x$(window).on('resize', function() {
      container.find('input').fire('updateCheck');
    });
    
    // Create a "Display" menu      
    if (!o.checkContainer) {
      var menuWrapper = x$('<div class="table-menu-wrapper" />'),
      menuBtn = x$('<a href="#" class="table-menu-btn">Display</a>');

      menuBtn.click(function(){
        container.toggleClass("table-menu-hidden");            
        return false;
      });

      menuWrapper.bottom(menuBtn).bottom(container);
      x$(table).before(menuWrapper);
      
      // TODO: Implement with XUI functions
      // assign click-to-close event
      // x$(document).click(function(e){ 
        // if ( !x$(e.target).is( container ) && !$(e.target).is( container.find("*") ) ) {     
        //   container.addClass("table-menu-hidden");
        // }        
      // });
    };
  }
  
  function TableLoader () {}
  
  TableLoader.prototype.initialize = function(fragment) {
    var tables = x$(fragment).find_elements('flex-table');
    Ur.Widgets["flex-table"] = {};
    
    console.log("tables:  ");
    console.log(tables);
    
    // var tables = this.find(fragment);
  
    for(var name in tables){
      Ur.Widgets["flex-table"][name] = new flexTable(tables[name]);
      // Only supports one table for the moment
      // break;
    }
  }
  
  return TableLoader;
})();
