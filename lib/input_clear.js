/* Input Clear *
 * * * * * *
 * The input clear widget will provide a small X when a user focuses on a text input
 * that can be clicked to clear the field.
 * 
 * Customize the appearance of the X with CSS
 * 
 */

Ur.QuickLoaders['input-clear'] = (function(){
  
  function inputClear (input) {
    // XUIify the input we're working with
    var that = x$(input.input);
        
    // Create the X div
    var ex = x$('<div class="data-ur-input-clear-ex"></div>')
    // Hide it (even though this should be in CSS)
    ex.hide();
    // Inject it
    that.html('after', ex);
    
    ex.on('click', function() {
      // remove text in the box
      that[0].value='';
    });
    
    that.on('focus', function() {
      if (that[0].value != '') {
        ex.show();
      }
    })
    that.on('keydown', function() {
      ex.show();
    });
    that.on('blur', function() {
      // Delay the hide so that the button can be clicked
      setTimeout(function() { ex.hide();}, 100);
    });
  }
  
  function InputClearLoader () {}
  
  InputClearLoader.prototype.initialize = function(fragment) {
    var inputs = x$(fragment).findElements('input-clear');
    e = inputs;
    
    Ur.Widgets["input-clear"] = {};
    
    for(var input in inputs){
      Ur.Widgets["input-clear"][input] = new inputClear(inputs[input]);
    }
  }
  
  return InputClearLoader;
})();
