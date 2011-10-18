/* Font Resizer
   ------------
   Font Resizer displays three components:
   (1) a button which, when pressed, increases the font size of some
       specified page elements
   (2) a button which, when pressed, decreases the font size of some
       specified page elements
   (3) a label which reports the current font size of the aforementioned
       page elements
*/

Ur.QuickLoaders["font-resizer"] = (function() {
  
  var labelText = "Text Size: ";
  var minSize = 100, maxSize = 200;
  var delta = 20, up = 1, down = -1;

  function FontResizer(components) {
    this.size = 100;
    this.increase = components["increase"];
    this.decrease = components["decrease"];
    this.label = components["label"];
    this.content = components["content"];
    this.initialize();
  }

  FontResizer.prototype.initialize = function() {
    x$(this.increase).click(function (obj) { return function() { obj.change(up); }; }(this));
    x$(this.decrease).click(function (obj) { return function() { obj.change(down); }; }(this));
    x$(this.label).inner(labelText + this.size + "%");
  }

  FontResizer.prototype.change = function(direction) {
    if ((direction == down && this.size > minSize) ||
        (direction == up && this.size < maxSize)) {
      this.size += direction * delta;
      this.content.style["font-size"] = this.size + "%";
      this.label.innerText = labelText + this.size + "%";
    }
  }

  function FontResizerLoader() {}
  
  FontResizerLoader.prototype.initialize = function(fragment) {
    var font_resizers = x$(fragment).find_elements('font-resizer');
    for (var name in font_resizers) new FontResizer(font_resizers[name]);
  }
  
  return FontResizerLoader;
})();
