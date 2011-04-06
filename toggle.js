/* 
  Similar to Accordion, but showing how to properly do unobtrusive JS 
  Requires: XUL 2.0
  By: Hampton Catlin
  
  Take the 'button' element (can be a div or whatever.. the thing you click), add the attribute
  'toggle-selector' that has as its value a relative selector to find all (0 or more!) elements
  to toggle. 
  
  Toggling is basically swapping in and out an 'open' and 'closed' class. Starts with whatever
  is there to begin with. 
  
  You can totally use this to toggle between two results. So, you might have the selector match
  two different elements. One with ".closed" and one with ".open". When the click() event happens,
  they swap.
*/

x$(window).load(function() {
  x$("*[toggle-selector]").each(function() {
    var wrapper = x$(this);
    var buttonSelector = (wrapper.attr("toggle-button")[0] || "button");
    var selector = wrapper.attr("toggle-selector")[0];

    x$(buttonSelector, this).click(function() {
      var button = x$(this);

      if(button.hasClass("pushed")) {
        button.removeClass("pushed");
      } else {
        button.addClass("pushed");
      }

      x$(selector, wrapper[0]).each(function() {
        var content = x$(this);
        if(content.hasClass("closed")) {
          content.removeClass("closed");
          content.addClass("open")
        } else {
          content.removeClass("open");
          content.addClass("closed")
        }
      })

      var message = self.attr("toggle-msg")[0];
      if(message) {
        self.attr("toggle-msg", self.html())
        self.html(message);
      }
    })
  })
})
