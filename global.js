// This is not used yet ... but I'm going to put everything under the global scope so that we do it right from the beginning

if (typeof(Moovweb) == "undefined")
   Moovweb = {}
Moovweb.widgets = {}

//////////

var mixins = {
  // Grabbed this from xui's forEach defn
  iterate: function(stuff, fn) {
    var len = stuff.length || 0,
    i = 0,
    that = arguments[1];

    if (typeof fn == 'function') {
      for (; i < len; i++) {
        fn.call(that, stuff[i], i, stuff);
      }
    }
  }
}

xui.extend(mixins);