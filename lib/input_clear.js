/* Input Clear *
 * * * * * *
 * The input clear widget will provide a small X when a user focuses on a text input
 * that can be clicked to clear the field.
 * 
 */

Ur.QuickLoaders['input-clear'] = (function(){
  
  
  
  function InputClearLoader () {}
  
  InputClearLoader.prototype.initialize = function(fragment) {
    var inputs = x$(fragment).findElements('input-clear');
    Ur.Widgets["input-clear"] = {};

    for(var table in tables){
      Ur.Widgets["input-clear"][name] = new input_clear(inputs[input]);
    }
  }
  
  return InputClearLoader;
})();
