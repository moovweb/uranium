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
  },
  offset: function(elm) {
    if(typeof(elm == "undefined")) {
      elm = this[0];
    }

    cumulative_top = 0;
    cumulative_left = 0;
    while(elm.offsetParent) {
      cumulative_top += elm.offsetTop;
      cumulative_left += elm.offsetLeft;
      elm = elm.offsetParent;
    }
    return {left: cumulative_left, top:cumulative_top};
  },
  touch_events: function() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch(e) {
      return false;
    }
  }
}

xui.extend(mixins);

