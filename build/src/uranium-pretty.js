(function () {
/**
  Basics
  ======
    
    xui is available as the global `x$` function. It accepts a CSS selector string or DOM element, or an array of a mix of these, as parameters,
    and returns the xui object. For example:
    
        var header = x$('#header'); // returns the element with id attribute equal to "header".
        
    For more information on CSS selectors, see the [W3C specification](http://www.w3.org/TR/CSS2/selector.html). Please note that there are
    different levels of CSS selector support (Levels 1, 2 and 3) and different browsers support each to different degrees. Be warned!
    
  The functions described in the docs are available on the xui object and often manipulate or retrieve information about the elements in the
  xui collection.

*/
var undefined,
    xui,
    window     = this,
    string     = new String('string'), // prevents Goog compiler from removing primative and subsidising out allowing us to compress further
    document   = window.document,      // obvious really
    simpleExpr = /^#?([\w-]+)$/,   // for situations of dire need. Symbian and the such        
    idExpr     = /^#/,
    tagExpr    = /<([\w:]+)/, // so you can create elements on the fly a la x$('<img href="/foo" /><strong>yay</strong>')
    slice      = function (e) { return [].slice.call(e, 0); };
    try { var a = slice(document.documentElement.childNodes)[0].nodeType; }
    catch(e){ slice = function (e) { var ret=[]; for (var i=0; e[i]; i++) ret.push(e[i]); return ret; }; }

window.x$ = window.xui = xui = function(q, context) {
    return new xui.fn.find(q, context);
};

// patch in forEach to help get the size down a little and avoid over the top currying on event.js and dom.js (shortcuts)
if (! [].forEach) {
    Array.prototype.forEach = function(fn) {
        var len = this.length || 0,
            i = 0,
            that = arguments[1]; // wait, what's that!? awwww rem. here I thought I knew ya!
                                 // @rem - that that is a hat tip to your thats :)

        if (typeof fn == 'function') {
            for (; i < len; i++) {
                fn.call(that, this[i], i, this);
            }
        }
    };
}
/*
 * Array Remove - By John Resig (MIT Licensed) 
 */
function removex(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from: from;
    return array.push.apply(array, rest);
}

// converts all CSS style names to DOM style names, i.e. margin-left to marginLeft
function domstyle(name) {
  return name.replace(/\-[a-z]/g,function(m) { return m[1].toUpperCase(); });
}

// converts all DOM style names to CSS style names, i.e. marginLeft to margin-left
function cssstyle(name) {
  return name.replace(/[A-Z]/g, function(m) { return '-'+m.toLowerCase(); })
}

xui.fn = xui.prototype = {

/**
  extend
  ------

  Extends XUI's prototype with the members of another object.

  ### syntax ###

    xui.extend( object );

  ### arguments ###

  - object `Object` contains the members that will be added to XUI's prototype.
 
  ### example ###

  Given:

    var sugar = {
        first: function() { return this[0]; },
        last:  function() { return this[this.length - 1]; }
    }

  We can extend xui's prototype with members of `sugar` by using `extend`:

    xui.extend(sugar);

  Now we can use `first` and `last` in all instances of xui:

    var f = x$('.button').first();
    var l = x$('.notice').last();
*/
    extend: function(o) {
        for (var i in o) {
            xui.fn[i] = o[i];
        }
    },

/**
  find
  ----

  Find the elements that match a query string. `x$` is an alias for `find`.

  ### syntax ###

    x$( window ).find( selector, context );

  ### arguments ###

  - selector `String` is a CSS selector that will query for elements.
  - context `HTMLElement` is the parent element to search from _(optional)_.
 
  ### example ###

  Given the following markup:

    <ul id="first">
        <li id="one">1</li>
        <li id="two">2</li>
    </ul>
    <ul id="second">
        <li id="three">3</li>
        <li id="four">4</li>
    </ul>

  We can select list items using `find`:

    x$('li');                 // returns all four list item elements.
    x$('#second').find('li'); // returns list items "three" and "four"
*/
    find: function(q, context) {
        var ele = [], tempNode;
            
        if (!q) {
            return this;
        } else if (context == undefined && this.length) {
            ele = this.each(function(el) {
                ele = ele.concat(slice(xui(q, el)));
            }).reduce(ele);
        } else {
            context = context || document;
            // fast matching for pure ID selectors and simple element based selectors
            if (typeof q == string) {
              if (simpleExpr.test(q) && context.getElementById && context.getElementsByTagName) {
                  ele = idExpr.test(q) ? [context.getElementById(q.substr(1))] : context.getElementsByTagName(q);
                  // nuke failed selectors
                  if (ele[0] == null) { 
                    ele = [];
                  }
              // match for full html tags to create elements on the go
              } else if (tagExpr.test(q)) {
                  tempNode = document.createElement('i');
                  tempNode.innerHTML = q;
                  slice(tempNode.childNodes).forEach(function (el) {
                    ele.push(el);
                  });
              } else {
                  // one selector, check if Sizzle is available and use it instead of querySelectorAll.
                  if (window.Sizzle !== undefined) {
                    ele = Sizzle(q, context);
                  } else {
                    ele = context.querySelectorAll(q);
                  }
              }
              // blanket slice
              ele = slice(ele);
            } else if (q instanceof Array) {
                ele = q;
            } else if (q.nodeName || q === window) { // only allows nodes in
                // an element was passed in
                ele = [q];
            } else if (q.toString() == '[object NodeList]' ||
q.toString() == '[object HTMLCollection]' || typeof q.length == 'number') {
                ele = slice(q);
            }
        }
        // disabling the append style, could be a plugin (found in more/base):
        // xui.fn.add = function (q) { this.elements = this.elements.concat(this.reduce(xui(q).elements)); return this; }
        return this.set(ele);
    },

/**
  set
  ---

  Sets the objects in the xui collection.

  ### syntax ###

    x$( window ).set( array );
*/
    set: function(elements) {
        var ret = xui();
        ret.cache = slice(this.length ? this : []);
        ret.length = 0;
        [].push.apply(ret, elements);
        return ret;
    },

/**
  reduce
  ------

  Reduces the set of elements in the xui object to a unique set.

  ### syntax ###

    x$( window ).reduce( elements, index );

  ### arguments ###

  - elements `Array` is an array of elements to reduce _(optional)_.
  - index `Number` is the last array index to include in the reduction. If unspecified, it will reduce all elements _(optional)_.
*/
    reduce: function(elements, b) {
        var a = [],
        elements = elements || slice(this);
        elements.forEach(function(el) {
            // question the support of [].indexOf in older mobiles (RS will bring up 5800 to test)
            if (a.indexOf(el, 0, b) < 0)
            a.push(el);
        });

        return a;
    },

/**
  has
  ---

  Returns the elements that match a given CSS selector.

  ### syntax ###

    x$( window ).has( selector );

  ### arguments ###

  - selector `String` is a CSS selector that will match all children of the xui collection.

  ### example ###

  Given:

    <div>
        <div class="round">Item one</div>
        <div class="round">Item two</div>
    </div>
  
  We can use `has` to select specific objects:

    var divs    = x$('div');          // got all three divs.
    var rounded = divs.has('.round'); // got two divs with the class .round
*/
     has: function(q) {
         var list = xui(q);
         return this.filter(function () {
             var that = this;
             var found = null;
             list.each(function (el) {
                 found = (found || el == that);
             });
             return found;
         });
     },

/**
  filter
  ------

  Extend XUI with custom filters. This is an interal utility function, but is also useful to developers.

  ### syntax ###

    x$( window ).filter( fn );

  ### arguments ###

  - fn `Function` is called for each element in the XUI collection.

          // `index` is the array index of the current element
          function( index ) {
              // `this` is the element iterated on
              // return true to add element to new XUI collection
          }

  ### example ###

  Filter all the `<input />` elements that are disabled:

    x$('input').filter(function(index) {
        return this.checked;
    });
*/
    filter: function(fn) {
        var elements = [];
        return this.each(function(el, i) {
            if (fn.call(el, i)) elements.push(el);
        }).set(elements);
    },

/**
  not
  ---

  The opposite of `has`. It modifies the elements and returns all of the elements that do __not__ match a CSS query.

  ### syntax ###

    x$( window ).not( selector );

  ### arguments ###

  - selector `String` a CSS selector for the elements that should __not__ be matched.

  ### example ###

  Given:

    <div>
        <div class="round">Item one</div>
        <div class="round">Item two</div>
        <div class="square">Item three</div>
        <div class="shadow">Item four</div>
    </div>

  We can use `not` to select objects:

    var divs     = x$('div');          // got all four divs.
    var notRound = divs.not('.round'); // got two divs with classes .square and .shadow
*/
    not: function(q) {
        var list = slice(this),
            omittedNodes = xui(q);
        if (!omittedNodes.length) {
            return this;
        }
        return this.filter(function(i) {
            var found;
            omittedNodes.each(function(el) {
                return found = list[i] != el;
            });
            return found;
        });
    },

/**
  each
  ----

  Element iterator for an XUI collection.

  ### syntax ###

    x$( window ).each( fn )

  ### arguments ###

  - fn `Function` callback that is called once for each element.

        // `element` is the current element
        // `index` is the element index in the XUI collection
        // `xui` is the XUI collection.
        function( element, index, xui ) {
            // `this` is the current element
        }

  ### example ###

    x$('div').each(function(element, index, xui) {
        alert("Here's the " + index + " element: " + element);
    });
*/
    each: function(fn) {
        // we could compress this by using [].forEach.call - but we wouldn't be able to support
        // fn return false breaking the loop, a feature I quite like.
        for (var i = 0, len = this.length; i < len; ++i) {
            if (fn.call(this[i], this[i], i, this) === false)
            break;
        }
        return this;
    }
};

xui.fn.find.prototype = xui.fn;
xui.extend = xui.fn.extend;
/**
  DOM
  ===

  Set of methods for manipulating the Document Object Model (DOM).

*/
xui.extend({
/**
  html
  ----

  Manipulates HTML in the DOM. Also just returns the inner HTML of elements in the collection if called with no arguments.

  ### syntax ###

    x$( window ).html( location, html );

  or this method will accept just a HTML fragment with a default behavior of inner:

    x$( window ).html( html );

  or you can use shorthand syntax by using the location name argument as the function name:

    x$( window ).outer( html );
    x$( window ).before( html );
  
  or you can just retrieve the inner HTML of elements in the collection with:
  
      x$( document.body ).html();

  ### arguments ###

  - location `String` can be one of: _inner_, _outer_, _top_, _bottom_, _remove_, _before_ or _after_.
  - html `String` is a string of HTML markup or a `HTMLElement`.

  ### example ###

    x$('#foo').html('inner', '<strong>rock and roll</strong>');
    x$('#foo').html('outer', '<p>lock and load</p>');
    x$('#foo').html('top',   '<div>bangers and mash</div>');
    x$('#foo').html('bottom','<em>mean and clean</em>');
    x$('#foo').html('remove');
    x$('#foo').html('before', '<p>some warmup html</p>');
    x$('#foo').html('after',  '<p>more html!</p>');

  or

    x$('#foo').html('<p>sweet as honey</p>');
    x$('#foo').outer('<p>free as a bird</p>');
    x$('#foo').top('<b>top of the pops</b>');
    x$('#foo').bottom('<span>bottom of the barrel</span>');
    x$('#foo').before('<pre>first in line</pre>');
    x$('#foo').after('<marquee>better late than never</marquee>');
*/
    html: function(location, html) {
        clean(this);

        if (arguments.length == 0) {
            var i = [];
            this.each(function(el) {
                i.push(el.innerHTML);
            });
            return i;
        }
        if (arguments.length == 1 && arguments[0] != 'remove') {
            html = location;
            location = 'inner';
        }
        if (location != 'remove' && html && html.each !== undefined) {
            if (location == 'inner') {
                var d = document.createElement('p');
                html.each(function(el) {
                    d.appendChild(el);
                });
                this.each(function(el) {
                    el.innerHTML = d.innerHTML;
                });
            } else {
                var that = this;
                html.each(function(el){
                    that.html(location, el);
                });
            }
            return this;
        }
        return this.each(function(el) {
            var parent, 
                list, 
                len, 
                i = 0;
            if (location == "inner") { // .html
                if (typeof html == string || typeof html == "number") {
                    el.innerHTML = html;
                    list = el.getElementsByTagName('SCRIPT');
                    len = list.length;
                    for (; i < len; i++) {
                        eval(list[i].text);
                    }
                } else {
                    el.innerHTML = '';
                    el.appendChild(html);
                }
            } else {
              if (location == 'remove') {
                el.parentNode.removeChild(el);
              } else {
                var elArray = ['outer', 'top', 'bottom'],
                    wrappedE = wrapHelper(html, (elArray.indexOf(location) > -1 ? el : el.parentNode )),
                    children = wrappedE.childNodes;
                if (location == "outer") { // .replaceWith
                  el.parentNode.replaceChild(wrappedE, el);
                } else if (location == "top") { // .prependTo
                    el.insertBefore(wrappedE, el.firstChild);
                } else if (location == "bottom") { // .appendTo
                    el.insertBefore(wrappedE, null);
                } else if (location == "before") { // .insertBefore
                    el.parentNode.insertBefore(wrappedE, el);
                } else if (location == "after") { // .insertAfter
                    el.parentNode.insertBefore(wrappedE, el.nextSibling);
                }
                var parent = wrappedE.parentNode;
                while(children.length) {
                  parent.insertBefore(children[0], wrappedE);
                }
                parent.removeChild(wrappedE);
              }
            }
        });
    },

/**
  attr
  ----

  Gets or sets attributes on elements. If getting, returns an array of attributes matching the xui element collection's indices.

  ### syntax ###

    x$( window ).attr( attribute, value );

  ### arguments ###

  - attribute `String` is the name of HTML attribute to get or set.
  - value `Varies` is the value to set the attribute to. Do not use to get the value of attribute _(optional)_.

  ### example ###

  To get an attribute value, simply don't provide the optional second parameter:

    x$('.someClass').attr('class');

  To set an attribute, use both parameters:

    x$('.someClass').attr('disabled', 'disabled');
*/
    attr: function(attribute, val) {
        if (arguments.length == 2) {
            return this.each(function(el) {
                if (el.tagName && el.tagName.toLowerCase() == 'input' && attribute == 'value') el.value = val;
                else if (el.setAttribute) {
                  if (attribute == 'checked' && (val == '' || val == false || typeof val == "undefined")) el.removeAttribute(attribute);
                  else el.setAttribute(attribute, val);
                }
            });
        } else {
            var attrs = [];
            this.each(function(el) {
                if (el.tagName && el.tagName.toLowerCase() == 'input' && attribute == 'value') attrs.push(el.value);
                else if (el.getAttribute && el.getAttribute(attribute)) {
                    attrs.push(el.getAttribute(attribute));
                }
            });
            return attrs;
        }
    }
});
"inner outer top bottom remove before after".split(' ').forEach(function (method) {
  xui.fn[method] = function(where) { return function (html) { return this.html(where, html); }; }(method);
});
// private method for finding a dom element
function getTag(el) {
    return (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
}

function wrapHelper(html, el) {
  if (typeof html == string) return wrap(html, getTag(el));
  else { var e = document.createElement('div'); e.appendChild(html); return e; }
}

// private method
// Wraps the HTML in a TAG, Tag is optional
// If the html starts with a Tag, it will wrap the context in that tag.
function wrap(xhtml, tag) {
  var e = document.createElement('div');
  e.innerHTML = xhtml;
  return e;
}

/*
* Removes all erronious nodes from the DOM.
* 
*/
function clean(collection) {
    var ns = /\S/;
    collection.each(function(el) {
        var d = el,
            n = d.firstChild,
            ni = -1,
            nx;
        while (n) {
            nx = n.nextSibling;
            if (n.nodeType == 3 && !ns.test(n.nodeValue)) {
                d.removeChild(n);
            } else {
                n.nodeIndex = ++ni; // FIXME not sure what this is for, and causes IE to bomb (the setter) - @rem
            }
            n = nx;
        }
    });
}
/**
  Event
  =====

  A good old fashioned events with new skool handling. Shortcuts exist for:

  - click
  - load
  - touchstart
  - touchmove
  - touchend
  - touchcancel
  - gesturestart
  - gesturechange
  - gestureend
  - orientationchange
  
*/
xui.events = {}; var cache = {};
xui.extend({

/**
  on
  --

  Registers a callback function to a DOM event on the element collection.

  ### syntax ###

    x$( 'button' ).on( type, fn );

  or

    x$( 'button' ).click( fn );

  ### arguments ###

  - type `String` is the event to subscribe (e.g. _load_, _click_, _touchstart_, etc).
  - fn `Function` is a callback function to execute when the event is fired.

  ### example ###

    x$( 'button' ).on( 'click', function(e) {
        alert('hey that tickles!');
    });

  or

    x$(window).load(function(e) {
      x$('.save').touchstart( function(evt) { alert('tee hee!'); }).css(background:'grey');
    });
*/
    on: function(type, fn, details) {
        return this.each(function (el) {
            if (xui.events[type]) {
                var id = _getEventID(el), 
                    responders = _getRespondersForEvent(id, type);
                
                details = details || {};
                details.handler = function (event, data) {
                    xui.fn.fire.call(xui(this), type, data);
                };
                
                // trigger the initialiser - only happens the first time around
                if (!responders.length) {
                    xui.events[type].call(el, details);
                }
            } 
            el.addEventListener(type, _createResponder(el, type, fn), false);
        });
    },

/**
  un
  --

  Unregisters a specific callback, or if no specific callback is passed in, 
  unregisters all event callbacks of a specific type.

  ### syntax ###

  Unregister the given function, for the given type, on all button elements:

    x$( 'button' ).un( type, fn );

  Unregisters all callbacks of the given type, on all button elements:

    x$( 'button' ).un( type );

  ### arguments ###

  - type `String` is the event to unsubscribe (e.g. _load_, _click_, _touchstart_, etc).
  - fn `Function` is the callback function to unsubscribe _(optional)_.

  ### example ###

    // First, create a click event that display an alert message
    x$('button').on('click', function() {
        alert('hi!');
    });
    
    // Now unsubscribe all functions that response to click on all button elements
    x$('button').un('click');

  or

    var greeting = function() { alert('yo!'); };
    
    x$('button').on('click', greeting);
    x$('button').on('click', function() {
        alert('hi!');
    });
    
    // When any button is clicked, the 'hi!' message will fire, but not the 'yo!' message.
    x$('button').un('click', greeting);
*/
    un: function(type, fn) {
        return this.each(function (el) {
            var id = _getEventID(el), responders = _getRespondersForEvent(id, type), i = responders.length;

            while (i--) {
                if (fn === undefined || fn.guid === responders[i].guid) {
                    el.removeEventListener(type, responders[i], false);
                    removex(cache[id][type], i, 1);
                }
            }

            if (cache[id][type].length === 0) delete cache[id][type];
            for (var t in cache[id]) {
                return;
            }
            delete cache[id];
        });
    },

/**
  fire
  ----

  Triggers a specific event on the xui collection.

  ### syntax ###

    x$( selector ).fire( type, data );

  ### arguments ###

  - type `String` is the event to fire (e.g. _load_, _click_, _touchstart_, etc).
  - data `Object` is a JSON object to use as the event's `data` property.

  ### example ###

    x$('button#reset').fire('click', { died:true });
    
    x$('.target').fire('touchstart');
*/
    fire: function (type, data) {
        return this.each(function (el) {
            if (el == document && !el.dispatchEvent)
                el = document.documentElement;

            var event = document.createEvent('HTMLEvents');
            event.initEvent(type, true, true);
            event.data = data || {};
            event.eventName = type;
          
            el.dispatchEvent(event);
        });
    }
});

"click load submit touchstart touchmove touchend touchcancel gesturestart gesturechange gestureend orientationchange".split(' ').forEach(function (event) {
  xui.fn[event] = function(action) { return function (fn) { return fn ? this.on(action, fn) : this.fire(action); }; }(event);
});

// patched orientation support - Andriod 1 doesn't have native onorientationchange events
xui(window).on('load', function() {
    if (!('onorientationchange' in document.body)) {
      (function (w, h) {
        xui(window).on('resize', function () {
          var portraitSwitch = (window.innerWidth < w && window.innerHeight > h) && (window.innerWidth < window.innerHeight),
              landscapeSwitch = (window.innerWidth > w && window.innerHeight < h) && (window.innerWidth > window.innerHeight);
          if (portraitSwitch || landscapeSwitch) {
            window.orientation = portraitSwitch ? 0 : 90; // what about -90? Some support is better than none
            xui('body').fire('orientationchange'); // will this bubble up?
            w = window.innerWidth;
            h = window.innerHeight;
          }
        });
      })(window.innerWidth, window.innerHeight);
    }
});

// this doesn't belong on the prototype, it belongs as a property on the xui object
xui.touch = (function () {
  try{
    return !!(document.createEvent("TouchEvent").initTouchEvent)
  } catch(e) {
    return false;
  };
})();

/**
  ready
  ----

  Event handler for when the DOM is ready. Thank you [domready](http://www.github.com/ded/domready)!

  ### syntax ###

    x$.ready(handler);

  ### arguments ###

  - handler `Function` event handler to be attached to the "dom is ready" event.

  ### example ###

    x$.ready(function() {
      alert('mah doms are ready');
    });

    xui.ready(function() {
      console.log('ready, set, go!');
    });
*/
xui.ready = function(handler) {
  domReady(handler);
}

// lifted from Prototype's (big P) event model
function _getEventID(element) {
    if (element._xuiEventID) return element._xuiEventID;
    return element._xuiEventID = ++_getEventID.id;
}

_getEventID.id = 1;

function _getRespondersForEvent(id, eventName) {
    var c = cache[id] = cache[id] || {};
    return c[eventName] = c[eventName] || [];
}

function _createResponder(element, eventName, handler) {
    var id = _getEventID(element), r = _getRespondersForEvent(id, eventName);

    var responder = function(event) {
        if (handler.call(element, event) === false) {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    
    responder.guid = handler.guid = handler.guid || ++_getEventID.id;
    responder.handler = handler;
    r.push(responder);
    return responder;
}
/**
  Fx
  ==

  Animations, transforms, and transitions for getting the most out of hardware accelerated CSS.

*/

xui.extend({

/**
  Tween
  -----

  Transforms a CSS property's value.

  ### syntax ###

    x$( selector ).tween( properties, callback );

  ### arguments ###

  - properties `Object` or `Array` of CSS properties to tween.
      - `Object` is a JSON object that defines the CSS properties.
      - `Array` is a `Object` set that is tweened sequentially.
  - callback `Function` to be called when the animation is complete. _(optional)_.

  ### properties ###

  A property can be any CSS style, referenced by the JavaScript notation.

  A property can also be an option from [emile.js](https://github.com/madrobby/emile):

  - duration `Number` of the animation in milliseconds.
  - after `Function` is called after the animation is finished.
  - easing `Function` allows for the overriding of the built-in animation function.

      // Receives one argument `pos` that indicates position
      // in time between animation's start and end.
      function(pos) {
          // return the new position
          return (-Math.cos(pos * Math.PI) / 2) + 0.5;
      }

  ### example ###

    // one JSON object
    x$('#box').tween({ left:'100px', backgroundColor:'blue' });
    x$('#box').tween({ left:'100px', backgroundColor:'blue' }, function() {
        alert('done!');
    });
    
    // array of two JSON objects
    x$('#box').tween([{left:'100px', backgroundColor:'green', duration:.2 }, { right:'100px' }]); 
*/
  tween: function( props, callback ) {

    // creates an options obj for emile
    var emileOpts = function(o) {
      var options = {};
      "duration after easing".split(' ').forEach( function(p) {
        if (props[p]) {
            options[p] = props[p];
            delete props[p];
        }
      });
      return options;
    }

    // serialize the properties into a string for emile
    var serialize = function(props) {
      var serialisedProps = [], key;
      if (typeof props != string) {
        for (key in props) {
          serialisedProps.push(cssstyle(key) + ':' + props[key]);
        }
        serialisedProps = serialisedProps.join(';');
      } else {
        serialisedProps = props;
      }
      return serialisedProps;
    };

    // queued animations
    /* wtf is this?
    if (props instanceof Array) {
        // animate each passing the next to the last callback to enqueue
        props.forEach(function(a){
          
        });
    }
    */
    // this branch means we're dealing with a single tween
    var opts = emileOpts(props);
    var prop = serialize(props);
    
    return this.each(function(e){
      emile(e, prop, opts, callback);
    });
  }
});
/**
  Style
  =====

  Everything related to appearance. Usually, this is CSS.

*/
function hasClass(el, className) {
    return getClassRegEx(className).test(el.className);
}

// Via jQuery - used to avoid el.className = ' foo';
// Used for trimming whitespace
var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

function trim(text) {
  return (text || "").replace( rtrim, "" );
}

xui.extend({
/**
  setStyle
  --------

  Sets the value of a single CSS property.

  ### syntax ###

    x$( selector ).setStyle( property, value );

  ### arguments ###

  - property `String` is the name of the property to modify.
  - value `String` is the new value of the property.

  ### example ###

    x$('.flash').setStyle('color', '#000');
    x$('.button').setStyle('backgroundColor', '#EFEFEF');
*/
    setStyle: function(prop, val) {
        prop = domstyle(prop);
        return this.each(function(el) {
            el.style[prop] = val;
        });
    },

/**
  getStyle
  --------

  Returns the value of a single CSS property. Can also invoke a callback to perform more specific processing tasks related to the property value.
  Please note that the return type is always an Array of strings. Each string corresponds to the CSS property value for the element with the same index in the xui collection.

  ### syntax ###

    x$( selector ).getStyle( property, callback );

  ### arguments ###

  - property `String` is the name of the CSS property to get.
  - callback `Function` is called on each element in the collection and passed the property _(optional)_.

  ### example ###
        <ul id="nav">
            <li class="trunk" style="font-size:12px;background-color:blue;">hi</li>
            <li style="font-size:14px;">there</li>
        </ul>
        
    x$('ul#nav li.trunk').getStyle('font-size'); // returns ['12px']
    x$('ul#nav li.trunk').getStyle('fontSize'); // returns ['12px']
    x$('ul#nav li').getStyle('font-size'); // returns ['12px', '14px']
    
    x$('ul#nav li.trunk').getStyle('backgroundColor', function(prop) {
        alert(prop); // alerts 'blue' 
    });
*/
    getStyle: function(prop, callback) {
        // shortcut getComputedStyle function
        var s = function(el, p) {
            // this *can* be written to be smaller - see below, but in fact it doesn't compress in gzip as well, the commented
            // out version actually *adds* 2 bytes.
            // return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/([A-Z])/g, "-$1").toLowerCase());
            return document.defaultView.getComputedStyle(el, "").getPropertyValue(cssstyle(p));
        }
        if (callback === undefined) {
          var styles = [];
          this.each(function(el) {styles.push(s(el, prop))});
          return styles;
        } else return this.each(function(el) { callback(s(el, prop)); });
    },

/**
  addClass
  --------

  Adds a class to all of the elements in the collection.

  ### syntax ###

    x$( selector ).addClass( className );

  ### arguments ###

  - className `String` is the name of the CSS class to add.

  ### example ###

    x$('.foo').addClass('awesome');
*/
    addClass: function(className) {
        var cs = className.split(' ');
        return this.each(function(el) {
            cs.forEach(function(clazz) {
              if (hasClass(el, clazz) === false) {
                el.className = trim(el.className + ' ' + clazz);
              }
            });
        });
    },

/**
  hasClass
  --------

  Checks if the class is on _all_ elements in the xui collection.

  ### syntax ###

    x$( selector ).hasClass( className, fn );

  ### arguments ###

  - className `String` is the name of the CSS class to find.
  - fn `Function` is a called for each element found and passed the element _(optional)_.

      // `element` is the HTMLElement that has the class
      function(element) {
          console.log(element);
      }

  ### example ###
        <div id="foo" class="foo awesome"></div>
        <div class="foo awesome"></div>
        <div class="foo"></div>
        
    // returns true
    x$('#foo').hasClass('awesome');
    
    // returns false (not all elements with class 'foo' have class 'awesome'),
    // but the callback gets invoked with the elements that did match the 'awesome' class
    x$('.foo').hasClass('awesome', function(element) {
        console.log('Hey, I found: ' + element + ' with class "awesome"');
    });
    
    // returns true (all DIV elements have the 'foo' class)
    x$('div').hasClass('foo');
*/
    hasClass: function(className, callback) {
        var self = this,
            cs = className.split(' ');
        return this.length && (function() {
                var hasIt = true;
                self.each(function(el) {
                  cs.forEach(function(clazz) {
                    if (hasClass(el, clazz)) {
                        if (callback) callback(el);
                    } else hasIt = false;
                  });
                });
                return hasIt;
            })();
    },

/**
  removeClass
  -----------

  Removes the specified class from all elements in the collection. If no class is specified, removes all classes from the collection.

  ### syntax ###

    x$( selector ).removeClass( className );

  ### arguments ###

  - className `String` is the name of the CSS class to remove. If not specified, then removes all classes from the matched elements. _(optional)_

  ### example ###

    x$('.foo').removeClass('awesome');
*/
    removeClass: function(className) {
        if (className === undefined) this.each(function(el) { el.className = ''; });
        else {
          var cs = className.split(' ');
          this.each(function(el) {
            cs.forEach(function(clazz) {
              el.className = trim(el.className.replace(getClassRegEx(clazz), '$1'));
            });
          });
        }
        return this;
    },

/**
  toggleClass
  -----------

  Removes the specified class if it exists on the elements in the xui collection, otherwise adds it. 

  ### syntax ###

    x$( selector ).toggleClass( className );

  ### arguments ###

  - className `String` is the name of the CSS class to toggle.

  ### example ###
        <div class="foo awesome"></div>
        
    x$('.foo').toggleClass('awesome'); // div above loses its awesome class.
*/
    toggleClass: function(className) {
        var cs = className.split(' ');
        return this.each(function(el) {
            cs.forEach(function(clazz) {
              if (hasClass(el, clazz)) el.className = trim(el.className.replace(getClassRegEx(clazz), '$1'));
              else el.className = trim(el.className + ' ' + clazz);
            });
        });
    },
    
/**
  css
  ---

  Set multiple CSS properties at once.

  ### syntax ###

    x$( selector ).css( properties );

  ### arguments ###

  - properties `Object` is a JSON object that defines the property name/value pairs to set.

  ### example ###

    x$('.foo').css({ backgroundColor:'blue', color:'white', border:'2px solid red' });
*/
    css: function(o) {
        for (var prop in o) {
            this.setStyle(prop, o[prop]);
        }
        return this;
    }
});

// RS: now that I've moved these out, they'll compress better, however, do these variables
// need to be instance based - if it's regarding the DOM, I'm guessing it's better they're
// global within the scope of xui

// -- private methods -- //
var reClassNameCache = {},
    getClassRegEx = function(className) {
        var re = reClassNameCache[className];
        if (!re) {
            // Preserve any leading whitespace in the match, to be used when removing a class
            re = new RegExp('(^|\\s+)' + className + '(?:\\s+|$)');
            reClassNameCache[className] = re;
        }
        return re;
    };
/**
  XHR
  ===

  Everything related to remote network connections.

 */
xui.extend({  
/**
  xhr
  ---

  The classic `XMLHttpRequest` sometimes also known as the Greek hero: _Ajax_. Not to be confused with _AJAX_ the cleaning agent.

  ### detail ###

  This method has a few new tricks.

  It is always invoked on an element collection and uses the behaviour of `html`.

  If there is no callback, then the `responseText` will be inserted into the elements in the collection.

  ### syntax ###

    x$( selector ).xhr( location, url, options )

  or accept a url with a default behavior of inner:

    x$( selector ).xhr( url, options );

  or accept a url with a callback:
  
    x$( selector ).xhr( url, fn );

  ### arguments ###

  - location `String` is the location to insert the `responseText`. See `html` for values.
  - url `String` is where to send the request.
  - fn `Function` is called on status 200 (i.e. success callback).
  - options `Object` is a JSON object with one or more of the following:
    - method `String` can be _get_, _put_, _delete_, _post_. Default is _get_.
    - async `Boolean` enables an asynchronous request. Defaults to _false_.
    - data `String` is a url encoded string of parameters to send.
                - error `Function` is called on error or status that is not 200. (i.e. failure callback).
    - callback `Function` is called on status 200 (i.e. success callback).
    - headers `Object` is a JSON object with key:value pairs that get set in the request's header set.

  ### response ###

  - The response is available to the callback function as `this`.
  - The response is not passed into the callback.
  - `this.reponseText` will have the resulting data from the file.

  ### example ###

    x$('#status').xhr('inner', '/status.html');
    x$('#status').xhr('outer', '/status.html');
    x$('#status').xhr('top',   '/status.html');
    x$('#status').xhr('bottom','/status.html');
    x$('#status').xhr('before','/status.html');
    x$('#status').xhr('after', '/status.html');

  or

    // same as using 'inner'
    x$('#status').xhr('/status.html');

    // define a callback, enable async execution and add a request header
    x$('#left-panel').xhr('/panel', {
        async: true,
        callback: function() {
            alert("The response is " + this.responseText);
        },
        headers:{
            'Mobile':'true'
        }
    });

    // define a callback with the shorthand syntax
    x$('#left-panel').xhr('/panel', function() {
        alert("The response is " + this.responseText);
    });
*/
    xhr:function(location, url, options) {

      // this is to keep support for the old syntax (easy as that)
    if (!/^(inner|outer|top|bottom|before|after)$/.test(location)) {
            options = url;
            url = location;
            location = 'inner';
        }

        var o = options ? options : {};
        
        if (typeof options == "function") {
            // FIXME kill the console logging
            // console.log('we been passed a func ' + options);
            // console.log(this);
            o = {};
            o.callback = options;
        };
        
        var that   = this,
            req    = new XMLHttpRequest(),
            method = o.method || 'get',
            async  = (typeof o.async != 'undefined'?o.async:true),
            params = o.data || null,
            key;

        req.queryString = params;
        req.open(method, url, async);

        // Set "X-Requested-With" header
        req.setRequestHeader('X-Requested-With','XMLHttpRequest');

        if (method.toLowerCase() == 'post') req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

        for (key in o.headers) {
            if (o.headers.hasOwnProperty(key)) {
              req.setRequestHeader(key, o.headers[key]);
            }
        }

        req.handleResp = (o.callback != null) ? o.callback : function() { that.html(location, req.responseText); };
        req.handleError = (o.error && typeof o.error == 'function') ? o.error : function () {};
        function hdl(){
            if(req.readyState==4) {
                delete(that.xmlHttpRequest);
                if(req.status===0 || req.status==200) req.handleResp(); 
                if((/^[45]/).test(req.status)) req.handleError();
            }
        }
        if(async) {
            req.onreadystatechange = hdl;
            this.xmlHttpRequest = req;
        }
        req.send(params);
        if(!async) hdl();

        return this;
    }
});
// emile.js (c) 2009 Thomas Fuchs
// Licensed under the terms of the MIT license.

(function(emile, container){
  var parseEl = document.createElement('div'),
    props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth '+
    'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize '+
    'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight '+
    'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft '+
    'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' ');

  function interpolate(source,target,pos){ return (source+(target-source)*pos).toFixed(3); }
  function s(str, p, c){ return str.substr(p,c||1); }
  function color(source,target,pos){
    var i = 2, j, c, tmp, v = [], r = [];
    while(j=3,c=arguments[i-1],i--)
      if(s(c,0)=='r') { c = c.match(/\d+/g); while(j--) v.push(~~c[j]); } else {
        if(c.length==4) c='#'+s(c,1)+s(c,1)+s(c,2)+s(c,2)+s(c,3)+s(c,3);
        while(j--) v.push(parseInt(s(c,1+j*2,2), 16)); }
    while(j--) { tmp = ~~(v[j+3]+(v[j]-v[j+3])*pos); r.push(tmp<0?0:tmp>255?255:tmp); }
    return 'rgb('+r.join(',')+')';
  }
  
  function parse(prop){
    var p = parseFloat(prop), q = prop.replace(/^[\-\d\.]+/,'');
    return isNaN(p) ? { v: q, f: color, u: ''} : { v: p, f: interpolate, u: q };
  }
  
  function normalize(style){
    var css, rules = {}, i = props.length, v;
    parseEl.innerHTML = '<div style="'+style+'"></div>';
    css = parseEl.childNodes[0].style;
    while(i--) if(v = css[props[i]]) rules[props[i]] = parse(v);
    return rules;
  }  
  
  container[emile] = function(el, style, opts, after){
    el = typeof el == 'string' ? document.getElementById(el) : el;
    opts = opts || {};
    var target = normalize(style), comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
      prop, current = {}, start = +new Date, dur = opts.duration||200, finish = start+dur, interval,
      easing = opts.easing || function(pos){ return (-Math.cos(pos*Math.PI)/2) + 0.5; };
    for(prop in target) current[prop] = parse(comp[prop]);
    interval = setInterval(function(){
      var time = +new Date, pos = time>finish ? 1 : (time-start)/dur;
      for(prop in target)
        el.style[prop] = target[prop].f(current[prop].v,target[prop].v,easing(pos)) + target[prop].u;
      if(time>finish) { clearInterval(interval); opts.after && opts.after(); after && setTimeout(after,1); }
    },10);
  }
})('emile', this);
!function (context, doc) {
  var fns = [], ol, fn, f = false,
      testEl = doc.documentElement,
      hack = testEl.doScroll,
      domContentLoaded = 'DOMContentLoaded',
      addEventListener = 'addEventListener',
      onreadystatechange = 'onreadystatechange',
      loaded = /^loade|c/.test(doc.readyState);

  function flush(i) {
    loaded = 1;
    while (i = fns.shift()) { i() }
  }
  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
    doc.removeEventListener(domContentLoaded, fn, f);
    flush();
  }, f);


  hack && doc.attachEvent(onreadystatechange, (ol = function () {
    if (/^c/.test(doc.readyState)) {
      doc.detachEvent(onreadystatechange, ol);
      flush();
    }
  }));

  context['domReady'] = hack ?
    function (fn) {
      self != top ?
        loaded ? fn() : fns.push(fn) :
        function () {
          try {
            testEl.doScroll('left');
          } catch (e) {
            return setTimeout(function() { context['domReady'](fn) }, 50);
          }
          fn();
        }()
    } :
    function (fn) {
      loaded ? fn() : fns.push(fn);
    };

}(this, document);
})();

xui.extend({
	/**
	 * Adds more DOM nodes to the existing element list.
	 */
	add: function(q) {
	  [].push.apply(this, slice(xui(q)));
	  return this.set(this.reduce());
	},

	/**
	 * Pops the last selector from XUI
	 */
	end: function () {	
		return this.set(this.cache || []);	 	
	},
  /**
   * Sets the `display` CSS property to `block`.
   */
  show:function() {
    return this.setStyle('display','block');
  },
  /**
   * Sets the `display` CSS property to `none`.
   */
  hide:function() {
    return this.setStyle('display','none');
  }
});

xui.extend({
   fade:function(to, callback) {
       var target = 0;
       if (typeof to == 'string' && to == 'in') target = 1;
       else if (typeof to == 'number') target = to;
       return this.tween({opacity:target,duration:.2}, callback);
   } 
});

if(typeof(Ur) == "undefined") {
  Ur = {
    QuickLoaders: {},
    WindowLoaders: {},
    Widgets: {},
    onLoadCallbacks: [],
    // Make an easy function that initializes all widgets for a given fragment:
    setup: function(fragment) {
      // Hacky:
      Ur.initialize({type: "DOMContentLoaded"}, fragment);

      if(Ur.loaded) {
        // These widgets _cant_ be initialized till page load
        Ur.initialize({type: "load"}, fragment);
      } else {
        window.addEventListener("load", function(e) { Ur.initialize(e, fragment)}, false);
      }
    },
    initialize: function(event, fragment) {
      var Loaders = (event.type == "DOMContentLoaded") ? Ur.QuickLoaders : Ur.WindowLoaders;
      if(fragment === undefined) {
        fragment = document.body;
      }
      
      for(var name in Loaders) {
        var widget = new Loaders[name];
        widget.initialize(fragment);
      }

      if(event.type == "load") {
        Ur.loaded = true;
        Ur._onLoad();
      }
    },
    error: function(msg) {
      console.error("Uranium: " + msg);
    },
    warn: function(msg) {
      console.warn("Uranium: " + msg);
    },
    // TODO: Make private
    _onLoad: function() {
      //iterate through the callbacks
      x$().iterate(
        Ur.onLoadCallbacks,
        function(callback) {
          callback();
        }
      );
    },
    loaded: false
  };
}

// This event is compatible with FF/Webkit

window.addEventListener("load", Ur.initialize, false);
window.addEventListener("DOMContentLoaded", Ur.initialize, false);

// Do this? OR just initialize as widgets are defined (and have uranium included at the bottom --- but that has limitations in inline JS using all of our x$() mixins) --> I think thats reason enough to try this for now


// Here's an example of initializing a fragment manually:
// Ur.setup("div.test");
// You have to be careful what you select since it searches within for components -- if your selector just matches the components individually, this will fail

// Now, you can re-initialize html fragments like so (After I refactor the widget initializers to search within fragments)
// x$(elem).on('click', Ur.Loaders['zoom-preview'].intialize(fragment));
// or 
// x$(elem).on('click', Ur.initialize(fragment));

var mixins = {
  // Grabbed this from xui's forEach defn
  iterate: function(stuff, fn) {
    if (stuff === undefined) {
      return;
    }
    var len = stuff.length || 0,
    i = 0,
    that = arguments[1];

    if (typeof fn == "function") {
      for (; i < len; i++) {
        fn.call(that, stuff[i], i, stuff);
      }
    }
  },
  offset: function(elm) {
    if (elm == undefined)
      elm = this[0];
    
    var cumulative_top = 0, cumulative_left = 0;
    while (elm.offsetParent) {
      cumulative_top += elm.offsetTop;
      cumulative_left += elm.offsetLeft;
      elm = elm.offsetParent;
    }
    return {left: cumulative_left, top: cumulative_top};
  },
  
  // TODO: Make private:
  findNextAncestor: function(elem, type) {
    //check to make sure there's still a parent:
    if (elem.parentNode != window.document) {
      return x$().findSetAncestor(elem.parentNode, type);
    } else {
      return null;
    }
  },

  findSetAncestor: function(elem, type) {
    var set_name = x$(elem).attr("data-ur-set")[0];
    if (set_name !== undefined && (type == undefined || set_name == type))
      return elem;
    return x$().findNextAncestor(elem, type);
  },

  get_unique_uranium_id: (function() {
    var count = 0;
    return function get_id() {
      count += 1;
      return count;
    }
  })(),

  findElements: function(type, component_constructors) {
    var groups = {};

    this.each(
      (function(type, constructors, groups) {
        return function() {x$().helper_find(this, type, constructors, groups)};
      })(type, component_constructors, groups));

    return groups;
  },
  // TODO: Make helper_find() private since its just a helper function
  helper_find: function(fragment, type, component_constructors, groups) {
    var all_elements = x$(fragment).find("*[data-ur-" + type + "-component]");

    all_elements.each(function() {

      var valid_component = true;

      ///////// Resolve this component to its set ///////////

      // Check if this has the data-ur-id attribute
      var my_set_id = x$(this).attr("data-ur-id")[0];

      if (my_set_id !== undefined) {
        if ( groups[my_set_id] === undefined) {
          groups[my_set_id] = {};
        }
      }
      else {
        //Find any set ancestors
        var my_ancestor = x$().findSetAncestor(this, type);

        var widget_disabled = x$(my_ancestor).attr("data-ur-state")[0];
        if (widget_disabled === "disabled" && Ur.loaded == false) {
          return;
        }

        if (my_ancestor !== null) {
          // Check if the set has an id ... if not, 'set' it up -- HA

          my_set_id = x$(my_ancestor).attr("data-ur-id")[0];

          if (my_set_id === undefined) {
            //generate ID
            my_set_id = x$().get_unique_uranium_id();
            x$(my_ancestor).attr("data-ur-id", my_set_id);
          }

          if (groups[my_set_id] === undefined) {
            //setup group
            groups[my_set_id] = {};
          }
          
          groups[my_set_id]["set"] = my_ancestor;

        }
        else {
          // we're screwed ... report an error
          Ur.error("couldn't find associated ur-set for component:");
          console.log(this);
          valid_component = false;
        }
      }

      //////////// Add this component to its set /////////////

      var component_type = x$(this).attr("data-ur-" + type + "-component");

      if (component_type === undefined) {
        valid_component = false;
      }

      if (valid_component) {
        // This is widget specific behavior
        // -- For toggler, it makes sense for content to be multiple things
        // -- For select-lists, it doesn't
        if (component_constructors !== undefined && component_constructors[component_type] !== undefined)
          component_constructors[component_type](groups[my_set_id], this, component_type);
        else
          groups[my_set_id][component_type] = this;
      }
    });

    return groups;
  }
}

xui.extend(mixins);

/* Carousel  *
 * * * * * * *
 * The carousel is a widget to allow for horizontally scrolling
 * (with touch or buttons) between a set of items.
 *
 * The only assumption is about the items' style -- they must be
 * float: left; so that the real width can be accurately totalled.
 */

Ur.WindowLoaders["carousel"] = (function() {

  function Carousel(components) {
    this.container = components["view_container"];
    this.items = components["scroll_container"];
    if (this.items.length == 0) {
      Ur.error("carousel missing item components");
      return false;
    }

    // Optionally:
    this.button = components["button"] === undefined ? {} : components["button"];
    this.count = components["count"];
    this.dots = components["dots"];

    this.initialize();
    this.onSlideCallbacks = [];
  }

  // Private/Helper methods

  function sign(num) {
    return num < 0 ? -1 : 1;
  }

  function zeroCeil(num) {
    return num <= 0 ? Math.floor(num) : Math.ceil(num);
  }

  function zeroFloor(num) {
    return num >= 0 ? Math.floor(num) : Math.ceil(num);
  }

  function stifle(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function getTranslateX(obj) {
    var style = getComputedStyle(obj);
    var transform = style["webkitTransform"] || style["MozTransform"] || style["oTransform"] || style["transform"];
    if (transform != "none") {
      if (window.WebKitCSSMatrix)
        return new WebKitCSSMatrix(transform).m41;
      else
        return parseInt(transform.split(",")[4]);
    }
    else {
      Ur.error("no transform found");
      return 0;
    }
  }

  //// Public Methods ////

  Carousel.prototype = {
    initialize: function() {
      // TODO:
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event", this.handleEvent);

      this.flag = {click: false, increment: false, loop: false, lock: null, timeoutId: null, touched: false};
      this.options = {
        autoscroll: true,
        autoscrollDelay: 5000,
        autoscrollForward: true,
        cloneLength: 1,
        fill: true,
        infinite: true,
        maps: false,
        transform3d: true,
        touch: true,
        verticalScroll: true
      };

      this.readAttributes();

      if (this.options.touch) {
        var hasTouch = document.ontouchstart !== undefined;
        var start = hasTouch ? "touchstart" : "mousedown";
        var move = hasTouch ? "touchmove" : "mousemove";
        var end = hasTouch ? "touchend" : "mouseup";
        var target = (this.options.maps && hasTouch) ? document : this.items;
        x$(target).on(start, function(obj){return function(e){obj.startSwipe(e)};}(this));
        x$(target).on(move, function(obj){return function(e){obj.continueSwipe(e)};}(this));
        x$(target).on(end, function(obj){return function(e){obj.finishSwipe(e)};}(this));
        x$(this.items).click(function(obj){return function(e){if (!obj.flag.click) stifle(e);}}(this));
      }

      x$(this.button["prev"]).click(function(obj){return function(){obj.moveTo(obj.magazineCount);}}(this));
      x$(this.button["next"]).click(function(obj){return function(){obj.moveTo(-obj.magazineCount);}}(this));

      this.preCoords = {x: 0, y: 0};

      this.itemIndex = 0;
      this.magazineCount = 1;

      if (this.options.infinite) {
        var items = x$(this.items).find("[data-ur-carousel-component='item']");
        this.realItemCount = items.length;
        this.itemIndex = this.options.cloneLength;
        this.clones = []; // probaby useless
        for (var i = 0; i < this.options.cloneLength; i++) {
          var clone = items[i].cloneNode(true);
          this.clones.push(clone);
          x$(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          items[items.length - 1].parentNode.appendChild(clone);
        }

        for (var i = items.length - this.options.cloneLength; i < items.length; i++) {
          var clone = items[i].cloneNode(true);
          this.clones.push(clone);
          x$(clone).attr("data-ur-clone", i).attr("data-ur-state", "inactive");
          items[0].parentNode.insertBefore(clone, items[0]);
        }
      }

      this.adjustSpacing();

      if (!this.options.infinite)
        this.realItemCount = this.itemCount;

      if (this.dots) {
        var existing = x$(this.dots).find("[data-ur-carousel-component='dot']");
        for (var i = existing.length; i < this.realItemCount; i++) {
          var new_dot = document.createElement("div");
          x$(new_dot).attr("data-ur-carousel-component", "dot");
          if (i == 0)
            x$(new_dot).attr("data-ur-state", "active");
          this.dots.appendChild(new_dot);
        }
      }

      this.updateIndex(this.options.infinite ? this.options.cloneLength : 0);

      // Expose this function globally: (this will work on webkit / FF)
      this.jumpToIndex = (function(obj) { return function(idx) { obj.__proto__.moveToIndex.call(obj, idx); };})(this);

      x$(window).orientationchange(function(obj){return function(){obj.resize();}}(this));
      // orientationchange isn't supported on some androids
      x$(window).on("resize", function(obj) { return function() {
        obj.resize();
        setTimeout(function(){obj.resize()}, 100);
      }}(this));
      //window.setInterval(function(obj){return function(){obj.resize();}}(this),1000);

      this.autoscrollStart();
    },

    readAttributes: function() {
      var $container = x$(this.container);

      // translate3d is disabled on Android by default because it often causes problems
      // however, on some pages translate3d will work fine so the data-ur-android3d
      // attribute can be set to "enabled" to use translate3d since it can be smoother
      // on some Android devices

      var oldAndroid = /Android [12]/.test(navigator.userAgent);
      if (oldAndroid && $container.attr("data-ur-android3d")[0] != "enabled")
        this.options.transform3d = false;

      this.options.fill = $container.attr("data-ur-fill")[0] == "enabled";
      $container.attr("data-ur-fill", this.options.fill ? "enabled" : "disabled");

      this.options.verticalScroll = $container.attr("data-ur-vertical-scroll")[0] != "disabled";
      $container.attr("data-ur-vertical-scroll", this.options.verticalScroll ? "enabled" : "disabled");

      this.options.touch = $container.attr("data-ur-touch")[0] != "disabled";
      $container.attr("data-ur-touch", this.options.touch ? "enabled" : "disabled");

      this.options.maps = $container.attr("data-ur-maps")[0] == "enabled";
      $container.attr("data-ur-maps", this.options.maps ? "enabled" : "disabled");

      this.options.infinite = $container.attr("data-ur-infinite")[0] != "disabled";
      $container.attr("data-ur-infinite", this.options.infinite ? "enabled" : "disabled");

      var cloneLength = parseInt($container.attr("data-ur-clones"));
      if (cloneLength > 0)
        this.options.cloneLength = cloneLength;
      $container.attr("data-ur-clones", this.options.cloneLength);

      this.options.autoscroll = $container.attr("data-ur-autoscroll")[0] == "enabled";
      $container.attr("data-ur-autoscroll", this.options.autoscroll ? "enabled" : "disabled");

      var autoscrollDelay = parseInt($container.attr("data-ur-autoscroll-delay"));
      if (autoscrollDelay >= 0)
        this.options.autoscrollDelay = autoscrollDelay;
      $container.attr("data-ur-autoscroll-delay", this.options.autoscrollDelay);

      this.options.autoscrollForward = $container.attr("data-ur-autoscroll-dir")[0] != "prev";
      $container.attr("data-ur-autoscroll-dir", this.options.autoscrollForward ? "next" : "prev");
    },

    resize: function() {
      var offsetWidth = this.container.offsetWidth;
      if (this.snapWidth != offsetWidth && offsetWidth != 0)
        this.adjustSpacing();
    },

    adjustSpacing: function() {
      // Will need to be called if the container's size changes --> orientation change
      var visibleWidth = this.container.offsetWidth;

      if (this.oldWidth !== undefined && this.oldWidth == visibleWidth)
        return;
      var oldSnapWidth = this.snapWidth;
      this.oldWidth = visibleWidth;

      var cumulativeOffset = 0;
      var items = x$(this.items).find("[data-ur-carousel-component='item']");
      this.itemCount = items.length;

      // Adjust the container to be the necessary width.
      // I have to do this because the alternative is assuming the container expands to its full width (display:table-row) which is non-standard if the container isn't a <tr>
      var totalWidth = 0;
      for (var i = 0; i < items.length; i++) {
        if (this.options.fill) {
          items[i].style.width = visible_width + "px";
          totalWidth += visible_width;
        }
        else
          totalWidth += items[i].offsetWidth;
      }

      this.items.style.width = totalWidth + "px";

      this.snapWidth = visibleWidth;

      this.lastIndex = this.itemCount - 1;

      this.itemIndex = (this.lastIndex < this.itemIndex) ? this.lastIndex : this.itemIndex;

      cumulativeOffset -= items[this.itemIndex].offsetLeft; // initial offset
      if (this.options.infinite) {
        var centerOffset = parseInt((this.snapWidth - items[0].offsetWidth)/2);
        cumulativeOffset += centerOffset; // CHECK
      }
      if (oldSnapWidth)
        this.destinationOffset = cumulativeOffset;

      this.translate(cumulativeOffset);
    },

    autoscrollStart: function() {
      if (!this.options.autoscroll)
        return;

      var self = this;
      self.flag.timeoutId = setTimeout(function() {
        if (self.container.offsetWidth != 0) {
          if (!self.options.infinite && self.itemIndex == self.lastIndex && self.options.autoscrollForward)
            self.jumpToIndex(0);
          else if (!self.options.infinite && self.itemIndex == 0 && !self.options.autoscrollForward)
            self.jumpToIndex(self.lastIndex);
          else
            self.moveTo(self.options.autoscrollForward ? -self.magazineCount : self.magazineCount);
        }
        else
          self.autoscrollStart();
      }, self.options.autoscrollDelay);
    },

    autoscrollStop: function() {
      clearTimeout(this.flag.timeoutId);
    },

    getEventCoords: function(event) {
      if (event.touches && event.touches.length > 0)
        return {x: event.touches[0].clientX, y: event.touches[0].clientY};
      else
        return {x: event.clientX, y: event.clientY};
    },

    updateButtons: function() {
      x$(this.button["prev"]).attr("data-ur-state", this.itemIndex == 0 ? "disabled" : "enabled")
      x$(this.button["next"]).attr("data-ur-state", this.itemIndex == this.lastIndex ? "disabled" : "enabled")
    },

    getNewIndex: function(direction) {
      var newIndex = this.itemIndex - direction;
      
      if (!this.options.infinite) {
        if (newIndex > this.lastIndex)
          newIndex = this.lastIndex;
        else if (newIndex < 0)
          newIndex = 0;
      }
      
      return newIndex;
    },

    updateIndex: function(newIndex) {
      if (newIndex === undefined)
        return;

      this.itemIndex = newIndex;
      if (this.itemIndex < 0)
        this.itemIndex = 0;
      else if (this.itemIndex > this.lastIndex)
        this.itemIndex = this.lastIndex - 1;

      var realIndex = this.itemIndex;
      if (this.options.infinite)
        realIndex = (this.realItemCount + this.itemIndex - this.options.cloneLength) % this.realItemCount;
      if (this.count !== undefined)
        this.count.innerHTML = realIndex + 1 + " of " + this.realItemCount;

      x$(this.items).find("[data-ur-carousel-component='item'][data-ur-state='active']").attr("data-ur-state", "inactive");
      x$(x$(this.items).find("[data-ur-carousel-component='item']")[this.itemIndex]).attr("data-ur-state", "active");

      if (this.dots)
        x$(this.dots).find("[data-ur-carousel-component='dot']").attr("data-ur-state", "inactive")[realIndex].setAttribute("data-ur-state", "active");

      this.updateButtons();

      x$(this.container).fire("slidestart", {index: realIndex});
    },

    startSwipe: function(e) {
      if (this.options.maps && e.target.tagName != "AREA" && !this.container.contains(e.target))
        return;
      if (!this.options.verticalScroll)
        stifle(e);
      this.autoscrollStop();

      this.flag.touched = true; // For non-touch environments
      var coords = this.getEventCoords(e);
      this.preCoords.x = coords.x;
      this.preCoords.y = coords.y;
      this.flag.lock = document.ontouchstart === undefined ? "x" : null;
      this.flag.loop = false;

      if (coords !== null) {
        var translateX = getTranslateX(this.items);

        if (this.startingOffset === undefined || this.startingOffset === null) {
          this.startingOffset = translateX;
          this.startPos = this.endPos = coords;
        } else {
          // Fast swipe
          this.startingOffset = this.destinationOffset; //Factor incomplete previous swipe
          this.startPos = this.endPos = coords;
        }
      }
      this.flag.click = true;
    },

    continueSwipe: function(e) {
      if (!this.flag.touched) // For non-touch environments
        return;

      this.flag.click = false;

      var coords = this.getEventCoords(e);

      if (document.ontouchstart !== undefined && this.options.verticalScroll) {
        var slope = Math.abs((this.preCoords.y - coords.y)/(this.preCoords.x - coords.x));
        if (this.flag.lock) {
          if (this.flag.lock == "y")
            return;
        }
        else if (slope > 1.2) {
          this.flag.lock = "y";
          return;
        }
        else if (slope <= 1.2)
          this.flag.lock = "x";
        else
          return;
      }
      stifle(e);

      if (coords !== null) {
        this.endPos = coords;
        var dist = this.swipeDist() + this.startingOffset;

        if (this.options.infinite) {
          var items = x$(this.items).find("[data-ur-carousel-component='item']");
          var endLimit = items[this.lastIndex].offsetLeft + items[this.lastIndex].offsetWidth - this.container.offsetWidth;

          if (dist > 0) { // at the beginning of carousel
            var srcNode = items[this.realItemCount];
            var offset = srcNode.offsetLeft - items[0].offsetLeft;
            this.startingOffset -= offset;
            dist -= offset;
            this.flag.loop = !this.flag.loop;
          }
          else if (dist < -endLimit) {  // at the end of carousel
            var srcNode = items[this.lastIndex - this.realItemCount];
            var offset = srcNode.offsetLeft - items[this.lastIndex].offsetLeft;
            this.startingOffset -= offset;
            dist -= offset;
            this.flag.loop = !this.flag.loop;
          }
        }

        this.translate(dist);
      }
    },

    finishSwipe: function(e) {
      if (!this.flag.click || this.flag.lock)
        stifle(e);
      else
        x$(e.target).click();
      
      this.flag.touched = false; // For non-touch environments
      
      if (!this.options.verticalScroll || this.flag.lock == "x")
        this.moveHelper(this.getDisplacementIndex());
      else if (this.flag.lock == "y")
        this.autoscrollStart();
    },
    getDisplacementIndex: function() {
      var swipeDistance = this.swipeDist();
      var displacementIndex = zeroCeil(swipeDistance/x$(this.items).find("[data-ur-carousel-component='item']")[0].offsetWidth);
      return displacementIndex;
    },
    snapTo: function(displacement) {
      this.destinationOffset = displacement + this.startingOffset;
      var maxOffset = -1*(this.lastIndex)*this.snapWidth;
      var minOffset = parseInt((this.snapWidth - x$(this.items).find("[data-ur-carousel-component='item']")[0].offsetWidth)/2);

      if (this.options.infinite)
        maxOffset = -this.items.offsetWidth;
      if (this.destinationOffset < maxOffset || this.destinationOffset > minOffset) {
        if (Math.abs(this.destinationOffset - maxOffset) < 1) {
          // Hacky -- but there are rounding errors
          // I see this when I'm in multi-mode and using the buttons
          // This only seems to happen on the desktop browser -- ideally its removed at compile time
          this.destinationOffset = maxOffset;
        } else {
          this.destinationOffset = this.startingOffset;
        }
      }

      this.momentum();
    },

    moveTo: function(direction) {
      // The animation isnt done yet
      if (this.flag.increment)
        return;

      this.startingOffset = getTranslateX(this.items);
      this.moveHelper(direction);
    },

    moveHelper: function(direction) {
      this.autoscrollStop();

      var newIndex = this.getNewIndex(direction);

      var items = x$(this.items).find("[data-ur-carousel-component='item']");

      if (this.options.infinite) {
        var oldTransform = getTranslateX(this.items);
        var altTransform = oldTransform;

        if (newIndex < this.options.cloneLength) { // at the beginning of carousel
          var offset = items[this.options.cloneLength].offsetLeft - items[this.itemCount - this.options.cloneLength].offsetLeft;
          if (!this.flag.loop) {
            altTransform += offset;
            this.translate(altTransform);
            this.startingOffset += offset;
          }
          newIndex += this.realItemCount;
          this.itemIndex = newIndex + direction;
        }
        else if (newIndex > this.lastIndex - this.options.cloneLength) { // at the end of carousel
          var offset = items[this.itemCount - this.options.cloneLength].offsetLeft - items[this.options.cloneLength].offsetLeft;
          if (!this.flag.loop) {
            altTransform += offset;
            this.translate(altTransform);
            this.startingOffset += offset;
          }
          newIndex -= this.realItemCount;
          this.itemIndex = newIndex + direction;
        }
      }
      var newItem = items[newIndex];
      var currentItem = items[this.itemIndex];
      var displacement = currentItem.offsetLeft - newItem.offsetLeft; // CHECK
      var self = this;
      
      setTimeout(function() {
        self.snapTo(displacement);
        self.updateIndex(newIndex);
      }, 6);
    },

    moveToIndex: function(index) {
      var direction = this.itemIndex - index;
      this.moveTo(direction);
    },

    momentum: function() {
      if (this.flag.touched)
        return;

      this.flag.increment = false;

      var translateX = getTranslateX(this.items);
      var distance = this.destinationOffset - translateX;
      var increment = distance - zeroFloor(distance / 1.1);

      // Hacky -- this is for the desktop browser only -- to fix rounding errors
      // Ideally, this is removed at compile time
      if(Math.abs(increment) < 0.01)
        increment = 0;

      var newTransform = increment + translateX;

      this.translate(newTransform);

      if (increment != 0)
        this.flag.increment = true;

      if (this.flag.increment)
        setTimeout(function(obj){return function(){obj.momentum()}}(this), 16);
      else {
        this.startingOffset = null;
        this.autoscrollStart();

        var itemIndex = this.itemIndex;
        x$(this.container).fire("slideend", {index: itemIndex});

        x$().iterate(this.onSlideCallbacks, function(callback) { callback(); });
      }
    },

    swipeDist: function() {
      if (this.endPos === undefined)
        return 0;
      return this.endPos.x - this.startPos.x;
    },
    
    translate: function(x) {
      var container = this.items;
      var translatePrefix = this.options.transform3d ? "translate3d(" : "translate(";
      var translateSuffix = this.options.transform3d ? ", 0px)" : ")";
      ["webkitTransform", "MozTransform", "oTransform", "transform"].forEach(function(i) {
        container.style[i] = translatePrefix + x + "px, 0px" + translateSuffix;
      });
    }
  }

  // Private constructors
  var ComponentConstructors = {
    button: function(group, component, type) {
      if (group["button"] === undefined)
        group["button"] = {};

      var type = component.getAttribute("data-ur-carousel-button-type");

      // Declaration error
      if (type === undefined)
        Ur.error("malformed carousel button type on:" + component.outerHTML);

      group["button"][type] = component;

      // Maybe in the future I'll make it so any of the items can be the starting item
      x$(component).attr("data-ur-state", type == "prev" ? "disabled" : "enabled");
    }
  };
  function CarouselLoader(){}

  CarouselLoader.prototype.initialize = function(fragment) {
    var carousels = x$(fragment).findElements("carousel", ComponentConstructors);
    Ur.Widgets["carousel"] = {};
    for (var name in carousels) {
      var carousel = carousels[name];
      Ur.Widgets["carousel"][name] = new Carousel(carousel);
      x$(carousel["set"]).attr("data-ur-state", "enabled");
    }
  }

  return CarouselLoader;
})();

/* Flex Table *
 * * * * * *
 * The flex table widget will take a full-sized table and make it fit 
 * on a variety of different viewport sizes.  
 * 
 */

Ur.QuickLoaders['flex-table'] = (function(){
  
  // Add an enhanced class to the tables the we'll be modifying
  function addEnhancedClass(tbl) {
    x$(tbl).addClass("enhanced");
  }
  
  function flexTable(aTable, table_index) {
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
        container = o.checkContainer ? x$(o.checkContainer) : x$('<div class="table-menu table-menu-hidden" ><ul /></div>');
        
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
        var toggle = x$('<li><input type="checkbox" name="toggle-cols" id="toggle-col-' +
                          i +  '-' + table_index +  '" value="' + id + '" /> <label for="toggle-col-' + i + '-' + table_index +  '">'
                          + th.html() +'</label></li>');
        container.find('ul').bottom(toggle);
        var tgl = toggle.find("input");
        
        tgl.on("change", function() {
          var input = x$(this),
              val = input.attr('value'),
              cols = x$("div[data-ur-id='" + table_index + "'] " + "#" + val[0] + ", " +
                        "div[data-ur-id='" + table_index + "'] " + "[headers=" + val[0] + "]");
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
      var menuWrapper = x$('<div class="table-menu-wrapper"></div>'),
          popupBG = x$('<div class = "table-background-element"></div>'),
          menuBtn = x$('<a href="#" class="table-menu-btn" ><span class="table-menu-btn-icon"></span>Display</a>');
      menuBtn.click(function(){
        container.toggleClass("table-menu-hidden");
        x$(this).toggleClass("menu-btn-show");
        return false;
      });
      popupBG.click(function(){
        container.toggleClass("table-menu-hidden");
        menuBtn.toggleClass("menu-btn-show");
        return false;
      });
      container.bottom(popupBG);
      menuWrapper.bottom(menuBtn).bottom(container);
      x$(table).before(menuWrapper);
    };
  }
  
  function TableLoader () {}
  
  TableLoader.prototype.initialize = function(fragment) {
    var tables = x$(fragment).findElements('flex-table');
    Ur.Widgets["flex-table"] = {};

    for(var table in tables){
      Ur.Widgets["flex-table"][name] = new flexTable(tables[table], table);
    }
  }
  
  return TableLoader;
})();

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
  var up = 1, down = -1;

  function FontResizer(components) {
    this.increase = components["increase"];
    this.decrease = components["decrease"];
    this.label = components["label"];
    this.content = components["content"];
    this.initialize();
  }

  FontResizer.prototype.initialize = function() {  
    var content = x$(this.content);
    this.min = parseInt(content.attr("data-ur-font-resizer-min")) || 100;
    this.max = parseInt(content.attr("data-ur-font-resizer-max")) || 200;
    this.delta = parseInt(content.attr("data-ur-font-resizer-delta")) || 20;
    this.size = parseInt(content.attr("data-ur-font-resizer-size")) || this.min;
    this.invert = content.attr("data-ur-font-resizer-invert") == "Bam!" ? true : false;

    x$(this.increase).click(function (obj) { return function() { obj.change(up); }; }(this));
    x$(this.decrease).click(function (obj) { return function() { obj.change(down); }; }(this));
    
    if (this.invert) {
      this.size = this.min;
      this.controlSize = this.max;
      this.increase.style["font-size"] = this.controlSize + "%";
      this.decrease.style["font-size"] = this.controlSize + "%";
      this.label.style["font-size"] = this.controlSize + "%";
    }
    
    content[0].style["font-size"] = this.size + "%";
    x$(this.label).inner(labelText + this.size + "%");

  }

  FontResizer.prototype.change = function(direction) {
    if ((direction == down && this.size > this.min) ||
        (direction == up && this.size < this.max)) {
      this.size += direction * this.delta;
      this.content.style["font-size"] = this.size + "%";
      this.label.innerText = labelText + this.size + "%";
      
      if (this.invert) {
        this.controlSize += -direction * this.delta;
        this.increase.style["font-size"] = this.controlSize + "%";
        this.decrease.style["font-size"] = this.controlSize + "%";
        this.label.style["font-size"] = this.controlSize + "%";
      }
    }
  }

  function FontResizerLoader() {}
  
  FontResizerLoader.prototype.initialize = function(fragment) {
    var font_resizers = x$(fragment).findElements('font-resizer');
    for (var name in font_resizers) new FontResizer(font_resizers[name]);
  }
  
  return FontResizerLoader;
})();

/* Geolocation  *
 * * * * * * * * *
 *
 *  The Geolocation widget is meant to
 *  reverse geocode a position to give back an address and then
 *  populate form fields
 *
 */
 
Ur.QuickLoaders["geocode"] = (function() {
  
  function Geocode(data) {
    this.elements = data;
    this.callback = x$(this.elements.set).attr("data-ur-callback")[0];
    this.errorCallback = x$(this.elements.set).attr("data-ur-error-callback")[0];

    UrGeocode = function(obj){return function(){obj.setup_callbacks();};}(this);
    var s = document.createElement('script');
    s.type = "text/javascript";
    s.src = "http://maps.googleapis.com/maps/api/js?sensor=true&callback=UrGeocode";
    x$('body').html('bottom', s);  
  }

  
  var geocoder;
  var geocodeObj;
  var currentObj;
  
  function selectHelper(elm, value) {
    for (var i=0,j=elm.length; i<j; i++) {
      if (elm[i].value === value.long_name || elm[i].value.toUpperCase() === value.short_name) {
        elm.selectedIndex = i;
      }
    }
  }
  
  function fieldHelper(elm, geoInfo, htmlElmType) {
    var index1 = 0;
    var index2 = null; // used for street address
    var need = null;
    var temp = null;
    switch(elm) {
      case 'rg-city':
        need = 'locality';
        break;
      case 'rg-street':
        need = 'street_number';
        break;
      case 'rg-zip': 
        need = 'postal_code';
        break;
      case 'rg-state':
        need = 'administrative_area_level_1';
        break;
      case 'rg-country':
        need = 'country';
        break;
    }
    temp=geoInfo[0];
    var myTemp = null;
    for (var i = temp.address_components.length, j=0; j<i; j++) {
      for (var k = temp.address_components[j].types.length, m=0; m<k; m++) {
        myTemp = temp.address_components[j].types[m];
        if (need == myTemp) {
          switch(myTemp) {
            case 'street_number':
              index1 = j;
              index2 = j+1; 
              break;
            case 'locality':
              index1 = j; 
              break;
            case 'postal_code':
              index1 = j;
              break;
            case 'administrative_area_level_1':
              index1 = j;
              break;
            case 'country':
              index1 = j;
          }
          break;
        }
      }
    }
    if (htmlElmType === "input") {
      if (index2 === null) {
        currentObj.elements[elm].value = geoInfo[0].address_components[index1].long_name;
      } else {
        currentObj.elements[elm].value = geoInfo[0].address_components[index1].long_name + " " + geoInfo[0].address_components[index2].long_name;
      }
    } else if (htmlElmType === "select") {
      selectHelper(currentObj.elements[elm], geoInfo[0].address_components[index1]);
    }
  }
  
  function populateFields (geoInfo) {
    var elements = currentObj.elements;
    for (elm in elements) {
      (elements[elm].localName === "input") ? fieldHelper(elm, geoInfo, "input") : fieldHelper(elm, geoInfo, "select");
    }
  }
  
  Geocode.prototype = {
    setup_callbacks: function() {
      currentObj = this;
      // Set up call back for button to trigger geocoding
      if (this.elements['rg-button']) {
        x$(this.elements['rg-button']).on(
          'click', 
          function(obj){
            return function() {
              obj.geocode();
            }
          }(this)
        );
      } else {
        console.warn("Ur warning -- no button for triggering reverse geocoding present");
        currentObj.geocode();
      }
    },
    geoSuccess: function(position){   
      var coords = {
        lat: position.coords.latitude, 
        lng: position.coords.longitude
      }

      this.codeLatLng(coords.lat, coords.lng);
    },
    
    geoError: function(error){
      console.error("Ur geolocation error -- Error Getting Your Coordinates!");
      switch(error.code) 
      {
        case error.TIMEOUT:
          console.error ('Ur geolocation error -- Timeout');
          break;
        case error.POSITION_UNAVAILABLE:
          console.error ('Ur geolocation error -- Position unavailable');
          break;
        case error.PERMISSION_DENIED:
          console.error ('Ur geolocation error -- Permission denied');
          break;
        case error.UNKNOWN_ERROR:
          console.error ('Ur geolocation error -- Unknown error');
          break;
      }
      if(this.errorCallback !== undefined) {
        eval(this.errorCallback);
      }
    },

    geoDenied: function(){
      console.error("Ur geolocation error -- User Denied Geolocation");
    },

    codeLatLng: function(lat, lng) {
      var latlng = new google.maps.LatLng(lat, lng);
      var self = this;

      geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            geocodeObj = results;
            populateFields(geocodeObj);

            if(self.callback !== undefined) {
              eval(self.callback);
            }

            return results;
          } else {
            console.error("Geocoder failed due to: " + status);
          }
        }
      });
    },

    geocode: function(){
      if(navigator.geolocation){ //feature detect
        geocoder = new google.maps.Geocoder();
        navigator.geolocation.getCurrentPosition(
          function(obj){
            return function(position){
              obj.geoSuccess(position);
            };
          }(this), 
          function(obj) {
            return function(errors){
              obj.geoError(errors);
            };
          }(this),
          this.geoDenied
        );  
      }
    }
  }

  function GeocodeLoader() {
  }

  GeocodeLoader.prototype.initialize = function(fragment) {
    var my_geo = x$(fragment).findElements('reverse-geocode');
    
    Ur.Widgets["geocode"] = {}
    
    for (var name in my_geo){
      Ur.Widgets["geocode"][name] = new Geocode(my_geo[name]);
      break;
    }
    
  }

  return GeocodeLoader;
})();
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

    // Use these when testing on desktop
    // ex.on('mousedown', function() {
    //   // remove text in the box
    //   that[0].value='';
    // });
    // ex.on('mouseup', function() {
    //   that[0].focus();
    // });
    
    // Touch Events
    ex.on('touchstart', function() {
      // remove text in the box
      that[0].value='';
    });
    ex.on('touchend', function() {
      // make sure the keyboard doesn't disappear
      that[0].focus();
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
      setTimeout(function() { ex.hide();}, 150);
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



/*
 * lateload takes any element that has the data-ur-ll-src or
 * data-ur-ll-href attribute and then once requested, loads that
 * object
 */

(function () {
  
  function late_load (obj) {
    
    var self = this;
    var components = this.components = obj;
  }

  late_load.prototype.preferences = {threshold: 300};

  late_load.prototype.release_element = function (obj) {

    if (obj.hasAttribute("data-ur-ll-src")){
      var type = "src";
      var att = "data-ur-ll-src";
      var loc = obj.getAttribute(att);
    }else if (obj.hasAttribute("data-ur-ll-href")){
      var type = "href";
      var att = "data-ur-ll-href";
      var loc = obj.getAttribute();
    }else{
      //console.warn("Uranium Late Load: non-late-load element provided.");
      return
    }

    obj.removeAttribute(att);
    obj.setAttribute(type, loc);
  }

   late_load.prototype.components = {};

  late_load.prototype.release_group = function (hash) {
    for (var name in hash){
      if (hash[name][1] != "scroll"){
        late_load.prototype.release_element(hash[name][0]);
      }else if (scrollHelper(hash[name][0]) == true){
        late_load.prototype.release_element(hash[name][0]);
      }
    }
  }

  var scrollHelper = function (obj) {
    var fold = window.innerHeight + window.pageYOffset;

    var findPos = function(obj) {
      var curleft = curtop = 0;curtop;
      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
      }
      return [curleft,curtop];
    }
    var pos = findPos(obj);
    return fold >= pos[1] - obj.offsetHeight - late_load.prototype.preferences.threshold;
  }

  var setEvents = function (obj) {
    var components = obj;

    for (var temp in components){

      switch(temp){
        case "scroll":
          x$(window).on(temp, function (e) {
            late_load.prototype.release_group(components["scroll"], "scroll");
          });
        break;
        case "load":
          x$(window).on(temp, function (e) {
            late_load.prototype.release_group(components["load"]);
          });
          break;
        case "DOMContentLoaded":
          late_load.prototype.release_group(components["DOMContentLoaded"]);
          break;
        case "click": case "touch":
          x$("html").on(temp, function (e) {
            var type = e.target.getAttribute("data-ur-ll-event")
            if (type == "click" || type == "touch") {
              late_load.prototype.release_element(e.target);
            }
          });
          break;
        default:
        break;
      }
    }
  }


  var find = function () {
    var obj = {};
    var temp = [];
    var group;

    x$(document).find('[data-ur-ll-href],[data-ur-ll-src]').each( function () {
      group = this.getAttribute("data-ur-ll-event")
      if (group === null){
        group = "DOMContentLoaded";
      }
      obj[group] = []
      temp.push([this, group]);
    });

    for (var element in temp){
      if (temp[element][1] === undefined) {}else{
        obj[temp[element][1]].push(temp[element]);
      }
    }

    return obj;
  }

  late_load.prototype.initialize = function() {
    var lateObj = find();
    var ll = new late_load(lateObj);
    setEvents(ll.components)
    Ur.Widgets["late_load"] = ll;
  }

  return Ur.QuickLoaders['late_load'] = late_load;
})();

/* Map *
 * * * *
 * The map creates a fully functional google map (API version 3) from addresses.
 * 
 * It (will) also support current location / custom icons and callbacks / getting directions.
 *
 */

Ur.QuickLoaders['map'] = (function(){

  // -- Private functions --

  function ThresholdCallback(threshold, callback) {
    this.threshold = threshold;
    this.count = 0;
    this.callbacks = [];
    if (callback !== undefined) {
      this.callbacks.push(callback);
    }
  }
  
  ThresholdCallback.prototype.finish = function() {
    this.count += 1;
    if (this.count == this.threshold) {
      var callback = this.callbacks.pop();
      while(callback) {
        callback();
        callback = this.callbacks.pop();
      }
    }
  }

  // -- End of Private functions -- 



  function Map(data){
    this.elements = data;
    this.fetch_map(); //This is async -- it calls initialize when done
  }

  // NOTE : All this map stuff is async. The execution path goes:
  // 
  // fetch_map() -> 
  // fetch_coordinates() -> 
  // setup_map() -> 
  //     add_coordinates()
  //     setup_user_location()

  Map.prototype = {
    marker_clicked: function(map_event, marker_index) {

      x$().iterate(
        this.elements["descriptions"],
        function(description, index) {
          if(index == marker_index) {
            x$(description).attr("data-ur-state","enabled");
          } else {
            x$(description).attr("data-ur-state","disabled");            
          }
        }
      );      
      
      // TODO: I probably want to add the ability to specify your own callback, which would get called here
    },

    fetch_coordinates: function(){
      this.coordinates = [];
      this.center = [0,0];
      this.lat_range = {};
      this.lng_range = {};

      var geocoder = new google.maps.Geocoder();
      var obj = this;
      var final_callback = new ThresholdCallback(
        this.elements["addresses"].length,
        function(obj){return function(){obj.setup_map();}}(this)
      );

      x$(this.elements["addresses"]).each(
        function(address, index) {
          address = address.innerText;
          var cleaned_address = address.match(/(\S.*\S)[$\s]/m)[1];
          
          if(cleaned_address == undefined){
            cleaned_address = address;
          }

          geocoder.geocode(
            {"address": cleaned_address},
            function(results, status) {
              var position = null; 

              if(status === google.maps.GeocoderStatus.OK) {
                position = results[0].geometry.location;
                obj.coordinates[index] = position;
                obj.center[0] += position.lat();
                obj.center[1] += position.lng();

                var ne = results[0].geometry.viewport.getNorthEast();
                var sw = results[0].geometry.viewport.getSouthWest();

                if ( (obj.lat_range["min"] && obj.lat_range["min"] > sw.lat()) || obj.lat_range["min"] === undefined) {
                  obj.lat_range["min"] = sw.lat();
                }

                if ( (obj.lat_range["max"] && obj.lat_range["max"] < sw.lat()) || obj.lat_range["max"] === undefined) {
                  obj.lat_range["max"] = ne.lat();
                }

                if ( (obj.lng_range["min"] && obj.lng_range["min"] > sw.lng()) || obj.lng_range["min"] === undefined) {
                  obj.lng_range["min"] = sw.lng();
                }

                if ( (obj.lng_range["max"] && obj.lng_range["max"] < sw.lng()) || obj.lng_range["max"] === undefined) {
                  obj.lng_range["max"] = ne.lng();
                }

                final_callback.finish();
              } else {
                console.error("Error geocoding address: " + address);
              }

            }
          );
        }
      );

    },

    add_coordinates: function() {
      var obj = this;
      var icon_url = x$(this.elements["icon"]).attr("data-ur-url")[0];

      var width = x$(this.elements["icon"]).attr("data-ur-width")[0];
      var height = x$(this.elements["icon"]).attr("data-ur-height")[0];

      var size = null;

      if(width !== undefined && height !== undefined){
        size = new google.maps.Size(parseInt(width), parseInt(height));
      }

      x$().iterate(
        obj.coordinates,
        function (point, index) {
          var icon_image = null;

          if (icon_url !== undefined) {
            icon_image = new google.maps.MarkerImage(icon_url, null, null, null, size);
          }

          var marker = new google.maps.Marker({
            position: point, 
            map: obj.map,
            icon: icon_image
          }); 

          google.maps.event.addListener(
            marker,
            'click',
            function(marker_index){
              return function(map_event){
                obj.marker_clicked(map_event, marker_index);
              };
            }(index)
          );

        }
      );
      
    },

    setup_user_location: function() {
      var user_location = this.elements["user_location"];
      this.user_location_marker = null;

      if(user_location === undefined) {
        return
      }

      // Add a listener on the button 

      var self = this;

      x$(user_location).on(
        'click',
        function(){self.toggle_user_location()}
      );

      // Now just determine if I should use it automatically or not

      if(x$(user_location).attr("data-ur-state")[0] === "enabled") {
        this.fetch_user_location();
      } 
      
    },

    fetch_user_location: function() {

      var success = function(obj){
        return function(position){
          obj.add_user_location(position);
        }
      }(this);

      var failure = function(){
          console.error("Ur : Error getting user location");
      };

      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, failure);
      } else {
        console.error("Ur : Geolocation services not available");
      } 

    },

    add_user_location: function(point) {      
      var google_point = new google.maps.LatLng(point.coords.latitude, point.coords.longitude);

      this.user_location_marker = new google.maps.Marker({
        position: google_point, 
        map: this.map,
        icon: "//s3.amazonaws.com/moovweb-live-resources/map/dot-blue.png"
      }); 
      // TODO : Make this a real icon URL

      x$(this.elements["user_location"]).attr("data-ur-state","enabled");
    },

    toggle_user_location: function() {

      if(this.user_location_marker === null || this.user_location_marker === undefined) {
        this.fetch_user_location();
      } else {
        this.user_location_marker.setMap(null);
        delete this.user_location_marker;
        x$(this.elements["user_location"]).attr("data-ur-state","disabled");
      }

    },

    fetch_map: function() {
      var script = document.createElement("script");

      // Note:
      // - There can only be one map per page since I have to pass a global function name as
      //   the callback for the map code loading.
      // - The alternative is to generate unique global function names per instance ... but
      //   that requires eval() ... and "evals() are bad .... mkay?"

      // TODO: Can I at least hide it behind the Ur object?
      setup_uranium_map = function(obj){
        return function() {
          obj.fetch_coordinates();
        }
      }(this);

      script.src = "http://maps.googleapis.com/maps/api/js?sensor=true&callback=setup_uranium_map";

      this.elements["set"].appendChild(script);
    },

    setup_map: function() {
      
      this.center[0] /= this.elements["addresses"].length
      this.center[1] /= this.elements["addresses"].length

      var center = new google.maps.LatLng(this.center[0], this.center[1]);

      var options = {
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.elements["canvas"], options);

      var cumulative_sw = new google.maps.LatLng(this.lat_range["min"], this.lng_range["min"]);
      var cumulative_ne = new google.maps.LatLng(this.lat_range["max"], this.lng_range["max"]);

      var cumulative_bounds = new google.maps.LatLngBounds(cumulative_sw, cumulative_ne);

      this.map.fitBounds(cumulative_bounds);

      this.add_coordinates();
      this.setup_user_location();
    }

  }


  var ComponentConstructors = {
    "address" : function(group, component, type) {
      if (group["addresses"] === undefined) {
        group["addresses"] = [];
      }

      group["addresses"].push(component);
    },

    "description" : function(group, component, type) {
      if (group["descriptions"] === undefined) {
        group["descriptions"] = [];
      }

      group["descriptions"].push(component);      
    }
  }

  function MapLoader(){
  }

  MapLoader.prototype.initialize = function(fragment) {
    var maps = x$(fragment).findElements('map', ComponentConstructors);
    Ur.Widgets["map"] = {};

    for(var name in maps) {
      var map = maps[name];
      Ur.Widgets["map"][name] = new Map(map);
      break;
      // There can only be one for now ... 
      // TODO: As long as I make the script adding a singleton process, I can have multiple maps
    }

  }

  return MapLoader;
})();

/* Select Buttons  *
 * * * * * * * * * *
 * The select-button widget binds two buttons to a <select> to increment/decrement
 * the select's chosen value.
 * 
 */

Ur.QuickLoaders['select-buttons'] = (function(){

  function SelectButtons(components) {
    this.select = components["select"];
    this.increment = components["increment"];
    this.decrement = components["decrement"];
    this.initialize();
  }

  SelectButtons.prototype.initialize = function() {
    x$(this.increment).click(function(obj){return function(evt){obj.trigger_option(evt, 1)};}(this));
    x$(this.decrement).click(function(obj){return function(evt){obj.trigger_option(evt, -1)};}(this));
  }

  SelectButtons.prototype.trigger_option = function(event, direction) {
    var button = event.currentTarget;
    if (x$(button).attr("data-ur-state")[0] === "disabled") {
      return false;
    }
    var current_option = {};
    var value = this.select.value;
    var newValue = {"prev":null, "next":null};

    x$().iterate(
      this.select.children,
      function(option, index) {
        if(x$(option).attr("value")[0] == value) {
          current_option = {"element": option, "index": index};
        }

        if(typeof(current_option["index"]) == "undefined") {
          newValue["prev"] = x$(option).attr("value")[0];
        }

        if(index == current_option["index"] + 1) {
          newValue["next"] = x$(option).attr("value")[0];
        }
      }
    );

    var child_count = this.select.children.length;
    var new_index = current_option["index"] + direction;
    
    if (new_index == 0) {
      x$(this.decrement).attr("data-ur-state","disabled");
    } else {
      x$(this.decrement).attr("data-ur-state","enabled");
    }

    if (new_index == child_count - 1) {
      x$(this.increment).attr("data-ur-state","disabled");
    } else {
      x$(this.increment).attr("data-ur-state","enabled");
    }

    if (new_index < 0 || new_index == child_count) {
      return false;
    }

    direction = direction == 1 ? "next" : "prev";
    this.select.value = newValue[direction];

    return true;
  }



  // Potential bug: (not going to worry about it now)
  // This is a bit tricky since I need to update the classes on the buttons if they're on an extreme/edge
  // If the page can be loaded w any of the options selected, I can't apply these classes till onload
  // -- so the solution i guess is to add the disable classes to the html, and they'll be removed when initialized

  function SelectButtonsLoader(){
  }

  SelectButtonsLoader.prototype.initialize = function(fragment) {
    var select_buttons = x$(fragment).findElements('select-buttons');
    for (var name in select_buttons) {
      new SelectButtons(select_buttons[name]);
      x$(select_buttons[name]["set"]).attr("data-ur-state","enabled");
    }
  }

  return SelectButtonsLoader;
})();
/* Select List *
 * * * * * * * *
 * The select-list binds a set of uranium-elements to corresponding <option> 
 * elements of a <select>. Clicking the uranium-element sets the <select>'s 
 * value to match the corresponding <option> element.
 * 
 */

// A concern here is the initial state -- I think the default should be just
// that there is no initial state -- the user must click to update the state
// -- the reason is, if there is an initial state, the underlying selector's
// state may be different on render, and there will be a gap until onload 
// while the states mismatch -- if the user is fast enough to click a form 
// in that time, they will get unexpected results.

Ur.QuickLoaders['select-list'] = (function(){

  function SelectList(select_element, list_element){
    this.select = select_element;
    this.list = list_element;
    this.initialize();
  }

  SelectList.prototype.initialize = function() {
    x$(this.list).click(function(obj){return function(evt){obj.trigger_option(evt)}}(this));  
  }

  SelectList.prototype.trigger_option = function(event) {
    var selected_list_option = event.target;
    var self = this;
    var value = iterate(this, selected_list_option);
    //  x$(this.select).attr("value",value); //Odd - this doesn't work, but the following line does
    // -- I think 'value' is a special attribute ... its not in the attributes[] property of a node
    this.select.value = value;

    return true;
  }

  function iterate (obj, selected_obj) {
    var value = "";
    x$().iterate(
      obj.list.children,
      function(element, index){
        var val1 = element.getAttribute("value");
        var val2 = selected_obj.getAttribute("value");
        if(val1 == val2) {
          x$(element).attr("data-ur-state","enabled");
          value = x$(element).attr("value");
        } else {
          x$(element).attr("data-ur-state","disabled");
        }
      }
    );
    return value;
  }

  function matchSelected (obj) {
    var active = obj.select.children[obj.select.options.selectedIndex];
    iterate(obj, active);
  }

  function SelectListLoader(){
    this.SelectLists = {};
    // Keep instances here because we may need them in the future
    // - In v1 we had to listen for changes on the <select>'s and update appropriately
    // - Sometimes we had to listen for different events
  }


  SelectListLoader.prototype.initialize = function(fragment) {
    var select_lists = x$(fragment).findElements('select-list');
    var self = this;
    for (var name in select_lists) {
      var select_list = select_lists[name];
      self.SelectLists[name] = new SelectList(select_lists[name]["select"],select_lists[name]["content"]);
      x$(select_list["set"]).attr("data-ur-state","enabled");
      matchSelected(self.SelectLists[name])
    }
  }

  return SelectListLoader;
})();


/* 

basic structure of swipe toggler
you must define the swipe toggle name and one active element
from there this will create the swipe toggle ability.

show this off with a fade in and card deck carousel.

<div data-ur-swipe-toggle="my_name">
<span data-ur-state="active">item1</span><span>itme2</span><span>itme3</span>
</div>

*/

// this is a swipe toggler
Ur.QuickLoaders['SwipeToggle'] = (function () {

  function swipeToggleComponents (group, content_component) {
    // This is a 'collection' of components
    // -- if I see it again, I'll make this abstract
    if(group["slider"] === undefined) {
      group["slider"] = [];
    }
    group["slider"].push(content_component);
  }

  function SwipeToggle (swipe_element, name){
    var myName = name;
    var components = swipe_element;
    var self = this;
    var touch = {};

    var preferences = this.preferences = { dots: false, axis: "x", swipeUpdate: true, sensitivity: 10, loop: true,
                         touchbuffer: 20, tapActive: false,  touch: true, jump: 1, loop: true,
                         autoSpeed: 500 };
    

    this.flags = {touched: false, autoID: null}
    var flags = this.flags;

                                    
    var startPos = endPos = markerPos = {x: 0, y: 0, time: 0};

    var loadEvent = function (obj) {
      var event = document.createEvent("Event");
      event.initEvent("loaded", false, true);
      obj.dispatchEvent(event);
    }

    var autoScroll = function(mili_sec){
      name = setInterval(function (){
        console.log(name);
        var imageArray = slider.children.length;
        
        if(SwipeToggle.prototype.flags  == true){
          window.clearInterval(name);
          wipeToggle.prototype.flags  == false;
        }else{
          myCarousel.next(1);
        }
        
      },mili_sec);
    }

    var setTouch = function () {

      var pef_touch = self.preferences.touch;

      slider.addEventListener('touchstart', function (e){
        if (pef_touch == true){
          touch.start(e, this);
        }
      }, false);

      slider.addEventListener('touchmove', function (e){
        if (pef_touch == true){
          touch.move(e, this);
        }
      }, false);

      slider.addEventListener('touchend', function (e){
        if (pef_touch == true){
          touch.end(e, this);
        }
      }, false);
    }

    var swipeDirection = function (){

      if (preferences) {
        var buff = preferences.touchbuffer;
      }else{
        var buff = 0;
      }

      if(startPos[axis] < endPos[axis] - buff){
        return 1;//right or top >>
      }else if(startPos[axis] > endPos[axis] + buff){
        return 2;//left or bottom <<
      }else{
        return 3;//tap
      }
    }

    SwipeToggle.prototype.getActive = function (e) {
      var test = this.components.name;
      var active = x$('[data-ur-id="' + test + '"][data-ur-swipe-toggle-component="slider"] > [data-ur-state="active"]')[0];
      return active;
    }

    SwipeToggle.prototype.next = function () {

      var activeObj = this.getActive();
      var jump = this.preferences.jump;
      var children = activeObj.parentNode.children;

      for(var i = 0; i < jump; i++){
        if(lookAhead(activeObj) == true){
          var update = activeObj.nextElementSibling;
          activeObj = this.setActive(update);
        }else if(lookAhead(activeObj) == false && this.preferences.loop == true){
          this.setActive(children[0])
        } 
      }

      return activeObj;
    }

    SwipeToggle.prototype.prev = function () {
      var activeObj = this.getActive();
      var jump = this.preferences.jump;
      var children = activeObj.parentNode.children;
      var last = children.length -1;

      for(var i = 0; i < jump; i++){
        if(lookBehind(activeObj) == true){
          var update = activeObj.previousElementSibling;
          activeObj = this.setActive(update);
        }else if(lookBehind(activeObj) == false && this.preferences.loop == true){
          this.setActive(children[last])
        }
      }

      return activeObj;
    }

    var touch = {};

    touch.start = function (e) {
      flags.touched = true;

      markerPos = startPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: e.timeStamp
      };

    }

    touch.move = function (e) {

      endPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      if(self.preferences.swipeUpdate == true){
        swipeUpdate(e);
      }

      var swipeDist =  endPos[axis] - startPos[axis];
    }

    touch.end = function (e) {
      endPos.time = e.timeStamp;

      touchMove(e)

      touch.clear();
    }

    touch.clear = function () {
      startPos = {};
      endPos = {};
      markerPos = {};
    }

    var swipeUpdate = function (e) {
      if(endPos[axis] + self.preferences.sensitivity < markerPos[axis]){
        self.next();
        markerPos = endPos;
        e.stopPropagation();
        e.preventDefault();
      }
      if(endPos[axis] - self.preferences.sensitivity > markerPos[axis]){
        self.prev();
        markerPos = endPos;
        e.stopPropagation();
        e.preventDefault();
      }
    }

    var touchMove = function (e) {
      var direction = swipeDirection();
      var target = e.target
      if (direction == 1) {
        self.prev()
      }else if (direction == 2){
        self.next()
      }else{
        if (target.parentNode == slider){
          self.setActive(target);
        }
      }
    }

    var activeIndex = function (Element){
      if (Element === undefined) {
        var obj = self.components.slider;
      } else {
        var obj = Element;
      }

      var length = obj.children.length;
      var i = 0;

      if (length > i) {
        for(i ; i < length; i++){
          if(obj.children[i].getAttribute('data-ur-state') == 'active'){
            break;
          }
        }
      }

      return i;
    }

    SwipeToggle.prototype.autoScroll = function (direction) {
      var imageArray = this.components.slider.children.length;
      var self = this;

      var autoID = name;

      window.clearInterval(this.flags.autoID);
       if (direction == "next" || direction == "prev"){}else{
        console.log("swipe_toggle: impropper autoScroll direction setting");
        direction = "next";
      }

     this.flags.autoID = autoID = window.setInterval(function (){
        var position = activeIndex();

        if((self.preferences.loop == false && position + 1 == imageArray) || flags.touched == true){
          window.clearInterval(self.flags.autoID);
        }else{
          self[direction]()
        }

      }, this.preferences.autoSpeed);
    }

    SwipeToggle.prototype.dots = function () {
      // create dots for the carousel
      
      var index = activeIndex(this.components.slider);
      var slider_name = this.components.name;
      var slider = this.components.slider;
      var imageLength = x$(slider)[0].children.length -1;
      var dotsDiv = document.createElement('div');
      var attributeName = "mw_swipe_toggle_dot"

      dotsDiv.setAttribute("class", "mw_" + slider_name + "_dots mw_swipe_dots")

      for(var i = 0; i < imageLength + 1; i++){
        tempDivHolder = document.createElement("div");
        tempDivHolder.id = 'mw_image_dot' + (i+1);
        dotsDiv.appendChild(tempDivHolder);
      }
      if (dotsDiv.children[0] === undefined){} else {
        dotsDiv.children[index].setAttribute(attributeName, "active");
      }
      x$(slider).after(dotsDiv);

      slider.addEventListener('update', function (e){
        // make new dot active
        var eventSlider = e.slider;
        var name = slider_name;
        var dots_name = "mw_" + slider_name + "_dots";

        var index = activeIndex(e.slider);

        for (var i = 0; i < imageLength + 1; i++) {
          dotsDiv.children[i].setAttribute(attributeName, "");
        }
        dotsDiv.children[index].setAttribute(attributeName, "active");
      });
    }

    SwipeToggle.prototype.autoPopulate = function (autoPopulateList, append) {
      var location = this.components.slider;
      if (autoPopulateList === undefined) {
        console.warn("Swipe Toggle: no items listed")
      }else if (append == "top" || append == "bottom"){
        for (var items in autoPopulateList) {
          x$(location)[append](autoPopulateList[items]);
        }
        this.setActive(this.components.slider.children[0]);
      }
    }

    if(components === undefined){}else{
      this.components = swipe_element;
      var slider = this.components.slider;

      x$(swipe_element['next']).on("click", function(e){
        Ur.Widgets.SwipeToggle[self.components.name].next(e);
      });
      x$(swipe_element['prev']).on("click", function(e){ 
        Ur.Widgets.SwipeToggle[self.components.name].prev(e);
      });

      if (this.components.slider.children[0] === undefined) {}else{
        this.setActive(this.getActive());
      }


      var axis = this.preferences.axis;
      if (axis == "x" || axis == "Y") {
      }else{
        Ur.error("incorrect axis set")
      }

      setTouch();

      if (this.preferences.dots == true) {
        this.dots()
      }
      loadEvent(this.components.slider);
    }
  }

  SwipeToggle.prototype.components = {}

  SwipeToggle.prototype.setActive = function (obj) {

    var activeChangeEvent = function (obj, parent) {
      var event = document.createEvent("Event");
      event.initEvent("update", false, true);
      event.active = obj;
      event.slider = obj.parentNode;
      event.activeElement = obj;
      parent.dispatchEvent(event);
    }

    var i;
    var slider = obj.parentNode;
    var siblings = slider.children.length;
    var previousSibling = obj.previousElementSibling;
    var nextSibling = obj.nextElementSibling;
    var nodeType = obj.nodeType;

    if (nodeType == 1 && slider == slider){
      obj.setAttribute("data-ur-state", "active");

      for(i=0; i<=siblings; i++){
        if(previousSibling === null || previousSibling === undefined){
          break;
        }else{
          previousSibling.setAttribute("data-ur-state", "prev" + (i+1));
          previousSibling = previousSibling.previousElementSibling;
        }
      }

      for(i=0; i<=siblings; i++){
        if(nextSibling === null || nextSibling === undefined){
          break;
        }else{
          nextSibling.setAttribute("data-ur-state", "next" + (i+1));
          nextSibling = nextSibling.nextElementSibling;
        }
      }
    }

    activeChangeEvent(obj, slider)

    return obj;
  }

  var lookAhead = function (obj) {
    if(obj.nextElementSibling === null){
      return false;
    }else{
      return true;
    }
  }

  var lookBehind = function (obj) {
    if(obj.previousElementSibling === null){
      return false;
    }else{
      return true;
    }
  }

  var find = function(fragment){
    var swipe_group = x$(fragment).findElements('swipe-toggle');

    for(var component_id in swipe_group) {
      var carousel_group = swipe_group[component_id];
      carousel_group.name = component_id;
      if (carousel_group["slider"] === undefined) {
        Ur.error("no slider found for toggler with id = " + component_id);
        continue;
      }else if (carousel_group["slider"].children[0] === undefined){
        Ur.warn("no children in slider: " + carousel_group )
      }else{
        carousel_group["slider"]["active"] = x$(carousel_group["slider"]).find("[data-ur-state='active']")[0];
        Ur.warn("no active element found for toggler with id = " + component_id);
        if (carousel_group["slider"]["active"] === undefined) {
          console.log("no active element in slider: " + component_id)
          carousel_group["slider"]["active"] = carousel_group["slider"].children[0];
          carousel_group["slider"]["active"].setAttribute("data-ur-state", "active")
          console.log("set active element")
          continue;
        }
      }
    }
    return swipe_group;
  }

  SwipeToggle.prototype.initialize = function (fragment) {
    var swipe_group = find(fragment);
    Ur.Widgets["SwipeToggle"] = {};

    var prefEvent = function (obj) {
      var event = document.createEvent("Event");
      event.initEvent("preferences", false, true);
      obj.components.slider.dispatchEvent(event);
    }


    for(var name in swipe_group){
      Ur.Widgets["SwipeToggle"][name] = new SwipeToggle(swipe_group[name]);
      prefEvent(Ur.Widgets["SwipeToggle"][name]);
    }

    return swipe_group;
  }

  return new SwipeToggle;
})



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

    for(var tab_id in this.elements["buttons"]) {

      var button = this.elements["buttons"][tab_id];
      var content = this.elements["contents"][tab_id];

      if (default_tab === null) {
        default_tab = tab_id;
      }

      if(content === undefined) {
        Ur.error("no matching tab content for tab button");
        return;
      }
      
      var state = x$(button).attr("data-ur-state")[0];
      if(state !== undefined && state == "enabled") {
        default_tab = -1;
      }
      
      var closeable = x$(this.elements["set"]).attr("data-ur-closeable")[0];
      closeable = (closeable !== undefined && closeable == "true") ? true : false;
      var self = this;
      x$(button).on(
        "click",
        function(evt) {
          var firstScrollTop = evt.target.offsetTop - document.body.scrollTop;
          var this_tab_id = x$(evt.currentTarget).attr("data-ur-tab-id")[0];
          
          for(var tab_id in self.elements["buttons"]) {
            var button = self.elements["buttons"][tab_id];
            var content = self.elements["contents"][tab_id];

            if (tab_id !== this_tab_id) {
              x$(button).attr("data-ur-state","disabled");
              x$(content).attr("data-ur-state","disabled");
            } else {
        var new_state = "enabled";
        if (closeable) {
    var old_state = x$(button).attr("data-ur-state")[0];
    old_state = (old_state === undefined) ? "disabled" : old_state;
    new_state = (old_state == "enabled") ? "disabled" : "enabled";
        }
              x$(button).attr("data-ur-state", new_state);
              x$(content).attr("data-ur-state", new_state);
            }
          }
          var secondScrollTop =  evt.target.offsetTop - document.body.scrollTop;
          if ( secondScrollTop <= 0 ) {
            window.scrollBy(0, secondScrollTop - firstScrollTop);
          }
        }
      ); 
    }
  }
  
  var ComponentConstructors = {
    "button" : function(group, component, type) {
      if (group["buttons"] === undefined) {
        group["buttons"] = {}
      }
      
      var tab_id = x$(component).attr("data-ur-tab-id")[0];
      if (tab_id === undefined) {
        Ur.error("tab defined without a tab-id");
        return;
      }
      
      group["buttons"][tab_id] = component;
    },
    "content" : function(group, component, type) {
      if (group["contents"] === undefined) {
        group["contents"] = {}
      }
      
      var tab_id = x$(component).attr("data-ur-tab-id")[0];
      if (tab_id === undefined) {
        Ur.error("tab defined without a tab-id");
        return;
      }
      
      group["contents"][tab_id] = component;
    }
  }

  function TabsLoader(){
  }

  TabsLoader.prototype.initialize = function(fragment) {
    var tabs = x$(fragment).findElements('tabs', ComponentConstructors);
    Ur.Widgets["tabs"] = {};

    for(var name in tabs){
      var tab = tabs[name];
      Ur.Widgets["tabs"][name] = new Tabs(tabs[name]);
    }
  }

  return TabsLoader;
})();

/* Toggler *
* * * * * *
* The toggler alternates the state of all the content elements bound to the
* toggler button. 
* 
* If no initial state is provided, the default value 'disabled'
* is set upon initialization.
*/

Ur.QuickLoaders['toggler'] = (function(){
  function ToggleContentComponent (group, content_component) {
    // This is a 'collection' of components
    // -- if I see it again, I'll make this abstract
    if(group["content"] === undefined) {
      group["content"] = [];
    }
    group["content"].push(content_component);
  }

  function ToggleLoader(){
    this.component_constructors = {
      "content" : ToggleContentComponent
    };
  }

  ToggleLoader.prototype.find = function(fragment){
    var togglers = x$(fragment).findElements('toggler', this.component_constructors);
    var self=this;

    for(var toggler_id in togglers) {
      var toggler = togglers[toggler_id];

      if (toggler["button"] === undefined) {
        Ur.error("no button found for toggler with id=" + toggler_id);
        continue;
      }

      var toggler_state = x$(toggler["button"]).attr("data-ur-state")[0];
      if(toggler_state === undefined) {
        x$(toggler["button"]).attr("data-ur-state", 'disabled');
        toggler_state = "disabled";
      } 

      if (toggler["content"] === undefined) {
        Ur.error("no content found for toggler with id=" + toggler_id);
        continue;
      }

      // Make the content state match the button state
      x$().iterate(
        toggler["content"],
        function(content) {
          if (x$(content).attr("data-ur-state")[0] === undefined ) {
            x$(content).attr("data-ur-state", toggler_state)
          }
        }
      );

    }

    return togglers;
  }

  ToggleLoader.prototype.construct_button_callback = function(contents, set) {
    var self = this;
    return function(evt) { 
      var button = evt.currentTarget;
      var current_state = x$(button).attr("data-ur-state")[0];
      var new_state = current_state === "enabled" ? "disabled" : "enabled";

      x$(button).attr("data-ur-state", new_state);
      x$(set).attr("data-ur-state", new_state);

      x$().iterate(
        contents,
        function(content){
          var current_state = x$(content).attr("data-ur-state")[0];
          var new_state = current_state === "enabled" ? "disabled" : "enabled";
          x$(content).attr("data-ur-state", new_state);
        }
      );
    }
  }

  ToggleLoader.prototype.initialize = function(fragment) {
    var togglers = this.find(fragment);
    for(var name in togglers){
      var toggler = togglers[name];
      // if (togglers)
      x$(toggler["button"]).click(this.construct_button_callback(toggler["content"], toggler["set"]));
      x$(toggler["set"]).attr("data-ur-state","enabled");
    }
  }

  return ToggleLoader;
  })();

/* Zoom Preview  *
 * * * * * * * * *
 * The zoom-preview widget provides a thumbnail button that when touched 
 * displays and translates the zoom-image.
 * 
 */

Ur.QuickLoaders['zoom-preview'] = (function(){

  function ZoomPreview(data){
    this.elements = data["elements"];
    this.modifier = {};
    
    if (data["modifier"] !== null) {
      this.modifier = data["modifier"];
    }
    this.dimensions = {};
    this.zoom = false;

    this.update();
    this.events = {"start": "touchstart", "move" : "touchmove", "end" : "touchend"};

    this.touch = xui.touch;

    // Would be cool to compile this out
    if (!this.touch)
      this.events = {"move" : "mousemove", "end" : "mouseout"};

    this.initialize();
    console.log("Zoom Preview Loaded");
  }

  ZoomPreview.prototype.rewrite_images = function(src, match, replace) {
    if(typeof(src) == "undefined")
      return false;

    if(match === undefined && replace === undefined) {
      match = this.modifier["zoom_image"]["match"];
      replace = this.modifier["zoom_image"]["replace"];
    }

    this.elements["zoom_image"].src = src.replace(match, replace);

    match = replace = null;

    if(this.modifier["button"]) {
      match = this.modifier["button"]["match"];
      replace = this.modifier["button"]["replace"];
    }

    if(match && replace) {
      this.elements["button"].src = this.elements["zoom_image"].src.replace(match, replace);
    } else {
      this.elements["button"].src = this.elements["zoom_image"].src;
    }

    var self = this;
    this.elements["zoom_image"].style.visibility = "hidden";
    x$(this.elements["zoom_image"]).on("load", function(){self.update()});  
    x$(this.elements["button"]).on("load", function(){x$(self.elements["button"]).addClass("loaded");});  
    // TODO: Make this callback add the 'loaded' state
  }

  ZoomPreview.prototype.update = function() {
    var self = this;
    x$().iterate(
      ["button","zoom_image","container"],
      function(elem) {
        self.dimensions[elem] = [self.elements[elem].offsetWidth, self.elements[elem].offsetHeight];
      }
    );  

    var offset = x$(this.elements["button"]).offset();
    var button_offset = [offset["left"], offset["top"]];

    this.button_center = [this.dimensions["button"][0]/2.0 + button_offset[0],
                          this.dimensions["button"][1]/2.0 + button_offset[1]];

    this.image_origin = [-1.0/2.0*this.dimensions["zoom_image"][0], -1.0/2.0*this.dimensions["zoom_image"][1]];
  }

  ZoomPreview.prototype.get_event_coordinates = function(event) {
    if (!this.touch){
      return [event.pageX, event.pageY];
    } else {
      if(event.touches.length == 1)
      {
        return [event.touches[0].pageX, event.touches[0].pageY];
      }
    }
  }

  ZoomPreview.prototype.initialize = function() {
    x$(this.elements["button"]).on(this.events["move"],function(obj){return function(evt){obj.scroll_zoom(evt)};}(this));
    x$(this.elements["button"]).on(this.events["end"],function(obj){return function(evt){obj.scroll_end(evt)};}(this));

    // To prevent scrolling:
    if(this.events["start"]) {
      x$(this.elements["button"]).on("touchstart",function(obj){return function(evt){evt.preventDefault()};}(this));
    }

    var self = this;
    x$(this.elements["thumbnails"]).click(
      function(obj) {
        return function(evt){
          if (evt.target.tagName != "IMG")
            return false;
          obj.rewrite_images(evt.target.src); //, obj.modifier["match"], obj.modifier["replace"]);
        };
      }(self)
    );

    // Setup the initial button/zoom image:
    this.normal_image_changed();

  }

  ZoomPreview.prototype.normal_image_changed = function(new_normal_image) {
    if (new_normal_image !== undefined) {
      this.elements["normal_image"] = new_normal_image;
    }

    img = x$(this.elements["normal_image"]);
    this.rewrite_images(img.attr("src")[0], this.modifier["normal_image"]["match"], this.modifier["normal_image"]["replace"]);
  }

  ZoomPreview.prototype.scroll_end = function(event) {
    this.elements["zoom_image"].style.visibility = "hidden";
  }

  ZoomPreview.prototype.scroll_zoom = function(event) {
    this.elements["zoom_image"].style.visibility = "visible";

    var position = this.get_event_coordinates(event);
    if (position === null) {return false};

    var percents = [(position[0] - this.button_center[0])/this.dimensions["button"][0],
                    (position[1] - this.button_center[1])/this.dimensions["button"][1]];

    var delta = [this.dimensions["zoom_image"][0] * percents[0],
                 this.dimensions["zoom_image"][1] * percents[1]];

    var translate = [this.image_origin[0] - delta[0],
                     this.image_origin[1] - delta[1]];
    
    translate = this.check_bounds(translate);
    this.elements["zoom_image"].style.webkitTransform = "translate3d(" + translate[0] + "px," + translate[1] + "px,0px)";
  }

  ZoomPreview.prototype.check_bounds = function(translate){
    var min = [this.dimensions["container"][0]-this.dimensions["zoom_image"][0], this.dimensions["container"][1]-this.dimensions["zoom_image"][1]];

    x$().iterate(
      [0,1],
      function(index){
        if (translate[index] >= 0)
          translate[index] = 0;
        if (translate[index] <= min[index])
          translate[index] = min[index];
      }
    );

    return translate;
  }

  var ComponentConstructors = {
    "_modifiers" : function(group, component, type, modifier_prefix) {
      if (group["modifier"] === undefined) {
        group["modifier"] = {};
      }
      
      var prefix = (modifier_prefix === undefined) ? "src" : "zoom";
      console.log("searching for modifier:", prefix, component);
      var match = x$(component).attr("data-ur-" + prefix + "-modifier-match")[0];
      var replace = x$(component).attr("data-ur-" + prefix + "-modifier-replace")[0];
      
      if(typeof(match) != "undefined" && typeof(replace) != "undefined") {
        console.log("found modifiers:",match,replace);
        group["modifier"][type] = {"match":new RegExp(match),"replace":replace};
      }
    },
    "_construct" : function(group, component, type, modifier_prefix) {
      if (group["elements"] === undefined) {
        group["elements"] = {};
      }
      group["elements"][type] = component;
      this._modifiers(group, component, type, modifier_prefix);
    },
    "normal_image" : function(group, component, type) {
      this._construct(group, component, type, "zoom");
    },
    "zoom_image" : function(group, component, type) {
      this._construct(group, component, type);
    },
    "button" : function(group, component, type) {
      this._construct(group, component, type);
    },  
    "container" : function(group, component, type) {
      this._construct(group, component, type);
    },  
    "thumbnails" : function(group, component, type) {
      this._construct(group, component, type);
    }  
  }

  function ZoomPreviewLoader(){
  }

  ZoomPreviewLoader.prototype.initialize = function(fragment) {
    this.zoom_previews = x$(fragment).findElements('zoom-preview', ComponentConstructors);
    Ur.Widgets["zoom-preview"] = {};
    for (var name in this.zoom_previews) {
      Ur.Widgets["zoom-preview"][name] = new ZoomPreview(this.zoom_previews[name]);
      x$(this.zoom_previews[name]["set"]).attr("data-ur-state","enabled");
    }
  }

  return ZoomPreviewLoader;
})();