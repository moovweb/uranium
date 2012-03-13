(function () {
/**
	Base
	====

	Includes functionality used to manipulate the xui object collection; things like iteration and set operations are included here.

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

xui.fn = xui.prototype = {

/**
	extend
	------

	Allows extension of xui's prototype with the members/methods of the provided object.

	### syntax ###

		xui.extend( object );

	Call extend on the xui object to extend all xui instances with functionality and/or members of the passed-in object.

	### arguments ###

	- object:object a JavaScript object whose members will be incorporated into xui's prototype
 
	### example ###

	Given:

		var thing = {
		    first : function() { return this[ 0 ]; },
		    last : function() { return this[ this.length - 1 ]; }
		}

	We can extend xui's prototype with these methods by using `extend`:

		xui.extend( thing );

	Now we can use `first` and `last` in all instances of xui:

		var f = x$( '.someClass' ).first();
		var l = x$( '.differentClass' ).last();
*/
    extend: function(o) {
        for (var i in o) {
            xui.fn[i] = o[i];
        }
    },

/**
	find
	----

	Finds matching elements based on a query string. The global xui entry `x$` function is a reference to the `find` function.

	### syntax ###

		x$(window).find( selector [, context] );

	### arguments ###

	- selector:string a CSS selector string to match elements to.
	- context:HTMLElement an html element to use as the "root" element to search from.
 
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

	We can select only specific list items by using `find`, as opposed to selecting off the document root:

		x$('li'); // returns all four list item elements.
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
            } else if (q.toString() == '[object NodeList]') {
                ele = slice(q);
            } else if (q.nodeName || q === window) { // only allows nodes in
                // an element was passed in
                ele = [q];
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

		x$(window).set( array );
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
	---

	Reduces the set of elements in the xui object to a unique set.

	### syntax ###

		x$(someSelector).reduce( [ elements [, toIndex ]] );

	The elements parameter is optional - if not specified, will reduce the elements in the current xui object.

	### arguments ###

	- elements:Array an array of elements to reduce (optional)
	- toIndex:Number last index of elements to include in the reducing operation.
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

	Has modifies the elements array and returns all the elements that match (has) a CSS selector.

	### syntax ###

		x$(someSelector).has( query );

	Behind the scenes, actually calls the filter method.

	### arguments ###

	- query:string a CSS selector that will match all children of originally-selected xui collection

	### example ###

	Given

		<div>
		    <div class="gotit">these ones</div>
		    <div class="gotit">have an extra class</div>
		</div>
	
	We can use xui like so

		var divs = x$('div'); // we've got all four divs from above.
		var someDivs = divs.has('.gotit'); // we've now got only the two divs with the class
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

	Both an internal utility function, but also allows developers to extend xui using custom filters

	### syntax ###

		x$(someSelector).filter( functionHandle );

	The `functionHandle` function will get invoked with `this` being the element being iterated on,
	and the index passed in as a parameter.

	### arguments ###

	- functionHandle:Function a function reference that evaluates to true/false, determining which elements get included in the xui collection.

	### example ###

	Perhaps we'd want to filter input elements that are disabled:

		x$('input').filter(function(i) {
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

	Not modifies the elements array and returns all the elements that DO NOT match a CSS Query - the opposite of has

	### syntax ###

		x$(someSelector).not( someOtherSelector );

	### arguments ###

	- someOtherSelector:string a CSS selector that elements should NOT match to.

	### example ###

	Given

		<div>
		    <div class="gotit">these ones</div>
		    <div class="gotit">have an extra class</div>
		</div>

	We can use xui like so

		var divs = x$('div'); // we've got all four divs from above.
		var someDivs = divs.not('.gotit'); // we've now got only the two divs _without_ the class "gotit"	
*/
    not: function(q) {
        var list = slice(this);
        return this.filter(function(i) {
            var found;
            xui(q).each(function(el) {
                return found = list[i] != el;
            });
            return found;
        });
    },

/**
	each
	----

	Element iterator (over the xui collection).

	### syntax ###

		x$(window).each( functionHandle )

	### arguments ###

	- functionHandle:Function callback function that will execute with each element being passed in as the `this` object and first parameter to callback

	### example ###

		x$(someSelector).each(function(element, index, xui) {
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

	Set of methods used for manipulating the Document Object Model (DOM).

*/
xui.extend({
/**
	html
	---

	For manipulating HTML in the DOM.

	### syntax ###

		x$(window).html( location, html );

	or this method will accept just an html fragment with a default behavior of inner.

		x$(window).html( html );

	or you can use shorthand syntax by using the location name argument (see below) as the function name.

		x$(window).outer( html );
		x$(window).before( html );

	### arguments ###

	- location:string can be one of: inner, outer, top, bottom, remove, before or after.
	- html:string any string of html markup or an HTMLElement.

	### example ###

		x$('#foo').html( 'inner', '<strong>rock and roll</strong>' );
		x$('#foo').html( 'outer', '<p>lock and load</p>' );
		x$('#foo').html( 'top', '<div>bangers and mash</div>');
		x$('#foo').html( 'bottom','<em>mean and clean</em>');
		x$('#foo').html( 'remove');
		x$('#foo').html( 'before', '<p>some warmup html</p>');
		x$('#foo').html( 'after', '<p>more html!</p>');

	or

		x$('#foo').html( '<p>sweet as honey</p>' );
		x$('#foo').outer( '<p>free as a bird</p>' );
		x$('#foo').top( '<b>top of the pops</b>' );
		x$('#foo').bottom( '<span>bottom of the barrel</span>' );
		x$('#foo').before( '<pre>first in line</pre>' );
		x$('#foo').after( '<marquee>better late than never</marquee>' );
*/
    html: function(location, html) {
        clean(this);

        if (arguments.length == 0) {
            return this[0].innerHTML;
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
            } else if (location == "outer") { // .replaceWith
                el.parentNode.replaceChild(wrapHelper(html, el), el);
            } else if (location == "top") { // .prependTo
                el.insertBefore(wrapHelper(html, el), el.firstChild);
            } else if (location == "bottom") { // .appendTo
                el.insertBefore(wrapHelper(html, el), null);
            } else if (location == "remove") {
                el.parentNode.removeChild(el);
            } else if (location == "before") { // .insertBefore
                el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el);
            } else if (location == "after") { // .insertAfter
                el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el.nextSibling);
            }
        });
    },

/**
	attr
	---

	For getting or setting attributes on elements.

	### syntax (and examples) ###

		x$(window).attr( attribute, value );

	To retrieve an attribute value, simply don't provide the optional second parameter:

		x$('.someClass').attr( 'class' );

	To set an attribute, use both parameters:

		x$('.someClass').attr( 'disabled', 'disabled' );

	### arguments ###

	- attribute:string the name of the element's attribute to set or retrieve.
	- html:string if retrieving an attribute value, don't specify this parameter. Otherwise, this is the value to set the attribute to.
*/
    attr: function(attribute, val) {
        if (arguments.length == 2) {
            return this.each(function(el) {
                (attribute=='checked'&&(val==''||val==false||typeof val=="undefined"))?el.removeAttribute(attribute):el.setAttribute(attribute, val);
            });
        } else {
            var attrs = [];
            this.each(function(el) {
                var val = el.getAttribute(attribute);
                if (val != null)
                attrs.push(val);
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
  return (typeof html == string) ? wrap(html, getTag(el)) : html;
}

// private method
// Wraps the HTML in a TAG, Tag is optional
// If the html starts with a Tag, it will wrap the context in that tag.
function wrap(xhtml, tag) {

    var attributes = {},
        re = /^<([A-Z][A-Z0-9]*)([^>]*)>([\s\S]*)<\/\1>/i,
        element,
        x,
        a,
        i = 0,
        attr,
        node,
        attrList,
        result;
        
    if (re.test(xhtml)) {
        result = re.exec(xhtml);
        tag = result[1];

        // if the node has any attributes, convert to object
        if (result[2] !== "") {
            attrList = result[2].split(/([A-Z]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i);

            for (; i < attrList.length; i++) {
                attr = attrList[i].replace(/^\s*|\s*$/g, "");
                if (attr !== "" && attr !== " ") {
                    node = attr.split('=');
                    attributes[node[0]] = node[1].replace(/(["']?)/g, '');
                }
            }
        }
        xhtml = result[3];
    }

    element = document.createElement(tag);

    for (x in attributes) {
        a = document.createAttribute(x);
        a.nodeValue = attributes[x];
        element.setAttributeNode(a);
    }

    element.innerHTML = xhtml;
    return element;
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

	A good old fashioned yet new skool event handling system.

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

	For more information see:

	- http://developer.apple.com/webapps/docs/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/chapter_7_section_1.html#//apple_ref/doc/uid/TP40006511-SW1

	### syntax ###

		x$('button').on( 'click', function(e){ alert('hey that tickles!') });

	or...

		x$('a.save').click(function(e){ alert('tee hee!') });

	### arguments ###

	- type:string the event to subscribe to click|load|etc
	- fn:function a callback function to execute when the event is fired

	### example ###

		x$(window).load(function(e){
		  x$('.save').touchstart( function(evt){ alert('tee hee!') }).css(background:'grey');
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

		x$('button').un('click', specificCallback);

	The above unregisters only the `specificCallback` function on all button elements.

		x$('button').un('click');

	The above unregisters all callbacks assigned to all button elements.

	### arguments ###

	- type:string the event to unsubscribe from click|load|etc
	- fn:function callback function to unsubscribe (optional)

	### example ###

		x$('button').on('click',function(){alert('hi!');}); // callback subscribed to click.
		x$('button').un('click'); // No more callbacks fired on click of button elements!

	or ...

		var funk = function() { alert('yo!'); }
		x$('button').on('click', funk); // callback subscribed to click.
		x$('button').on('click', function(){ alert('hi!'); });
		x$('button').un('click', funk); // When buttons are clicked, the 'hi!' alert will pop up but not the 'yo!' alert.
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

	Fires a specific event on the xui collection.

	### syntax ###

		x$('button').fire('click', {some:'data'});

	Fires an event with some specific data attached to the event's `data` property.

	### arguments ###

	- type:string the event to fire, click|load|etc
	- data:object JavaScript object to attach to the event's `data` property.

	### example ###

        x$('button#reset').fire('click', {died:true});
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
	Effects
	=======

	Animations, transforms and transitions for getting the most out of hardware accelerated CSS.

*/

xui.extend({

/**
	Tween
	-----

	Tween is a method for transforming a css property to a new value.

	### syntax ###

		x$(selector).tween(obj, callback);

	### arguments ###

	- properties: object an object literal of element css properties to tween or an array containing object literals of css properties to tween sequentially.
	- callback (optional): function to run when the animation is complete

	### example ###

		x$('#box').tween({ left:'100px', backgroundColor:'blue' });
		x$('#box').tween({ left:'100px', backgroundColor:'blue' }, function() { alert('done!'); });
		x$('#box').tween([{ left:'100px', backgroundColor:'green', duration:.2 }, { right:'100px' }]); 
*/
	// options: duration, after, easing
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
                    serialisedProps.push(key + ':' + props[key]);
    		    }
      		    serialisedProps = serialisedProps.join(';');
    		} else {
    		    serialisedProps = props;
    		}
    		return serialisedProps;
		};
	    
		// queued animations
		if (props instanceof Array) {
		    // animate each passing the next to the last callback to enqueue
		    props.forEach(function(a){
		        
		    });
		}

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

	Anything related to how things look. Usually, this is CSS.

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

	Sets a single CSS property to a new value.

	### syntax ###

		x$(selector).setStyle(property, value);

	### arguments ###

	- property:string the property to modify
	- value:string the property value to set

	### example ###

		x$('.txt').setStyle('color', '#000');
*/
    setStyle: function(prop, val) {
        prop = prop.replace(/\-[a-z]/g,function(m) { return m[1].toUpperCase(); });
        return this.each(function(el) {
            el.style[prop] = val;
        });
    },

/**
	getStyle
	--------

	Retuns a single CSS property. Can also invoke a callback to perform more specific processing tasks related to the property value.

	### syntax ###

		x$(selector).getStyle(property, callback);

	### arguments ###

	- property:string a css key (for example, border-color NOT borderColor)
	- callback:function (optional) a method to call on each element in the collection 

	### example ###

		x$('ul#nav li.trunk').getStyle('font-size');
		
		x$('a.globalnav').getStyle( 'background', function(prop){ prop == 'blue' ? 'green' : 'blue' });
*/
    getStyle: function(prop, callback) {
        // shortcut getComputedStyle function
        var s = function(el, p) {
            // this *can* be written to be smaller - see below, but in fact it doesn't compress in gzip as well, the commented
            // out version actually *adds* 2 bytes.
            // return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/([A-Z])/g, "-$1").toLowerCase());
            return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/[A-Z]/g, function(m) { return '-'+m.toLowerCase(); }));
        }
        if (callback === undefined) {
        	var styles = [];
            this.each(function(el) {styles.push(s(el, prop))});
 			return styles;
        } else {
            this.each(function(el) {
                callback(s(el, prop));
            });
		}
    },

/**
	addClass
	--------

	Adds the classname to all the elements in the collection.

	### syntax ###

		$(selector).addClass(className);

	### arguments ###

	- className:string the name of the CSS class to apply

	### example ###

		$('.foo').addClass('awesome');
*/
    addClass: function(className) {
        return this.each(function(el) {
            if (hasClass(el, className) === false) {
              el.className = trim(el.className + ' ' + className);
            }
        });
    },

/**
	hasClass
	--------

	Checks to see if classname is one the element. If a callback isn't passed, hasClass expects only one element in collection - but should it?

	### syntax ###

		$(selector).hasClass('className');
		$(selector).hasClass('className', function(element) {});	 

	### arguments ###

	- className:string the name of the CSS class to apply

	### example ###

		$('#foo').hasClass('awesome'); // returns true or false
		$('.foo').hasClass('awesome',function(e){}); // returns XUI object
*/
    hasClass: function(className, callback) {
        var self = this;
        return this.length && (function() {
                var hasIt = false;
                self.each(function(el) {
                    if (hasClass(el, className)) {
                        hasIt = true;
                        if (callback) callback(el);
                    }
                });
                return hasIt;
            })();
    },

/**
	removeClass
	-----------

	Removes the classname from all the elements in the collection.

	### syntax ###

		x$(selector).removeClass(className);

	### arguments ###

	- className:string the name of the CSS class to remove.

	### example ###

		x$('.bar').removeClass('awesome');
*/
    removeClass: function(className) {
        if (className === undefined) {
            this.each(function(el) {
                el.className = '';
            });
        } else {
            var re = getClassRegEx(className);
            this.each(function(el) {
                el.className = trim(el.className.replace(re, '$1'));
            });
        }
        return this;
    },


/**
	css
	---

	Set a number of CSS properties at once.

	### syntax ###

		x$(selector).css(object);

	### arguments ###

	- an object literal of css key/value pairs to set.

	### example ###

		x$('h2.fugly').css({ backgroundColor:'blue', color:'white', border:'2px solid red' });
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

	Remoting methods and utils.

 */
xui.extend({	
/**
	xhr
	---

	The classic Xml Http Request sometimes also known as the Greek God: Ajax. Not to be confused with AJAX the cleaning agent.
	This method has a few new tricks. It is always invoked on an element collection and follows the identical behaviour as the
	`html` method. If there no callback is defined the response text will be inserted into the elements in the collection.

	### syntax ###

		xhr(location, url, options)

	or this method will accept just a url with a default behavior of inner...

		xhr(url, options);

	### options ###

	- method {String} [get|put|delete|post] Defaults to 'get'.
	- async {Boolean} Asynchronous request. Defaults to false.
	- data {String} A url encoded string of parameters to send.
	- callback {Function} Called on 200 status (success)

	### response ###

	- The response available to the callback function as 'this', it is not passed in.
	- `this.reponseText` will have the resulting data from the file.

	### example ###

		x$('#status').xhr('inner', '/status.html');
		x$('#status').xhr('outer', '/status.html');
		x$('#status').xhr('top',   '/status.html');
		x$('#status').xhr('bottom','/status.html');
		x$('#status').xhr('before','/status.html');
		x$('#status').xhr('after', '/status.html');

	or

		x$('#status').xhr('/status.html');

		x$('#left-panel').xhr('/panel', {callback:function(){ alert("All Done!") }});

		x$('#left-panel').xhr('/panel', function(){ alert(this.responseText) }); 
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
            async  = o.async || false,           
            params = o.data || null,
            i = 0;

        req.queryString = params;
        req.open(method, url, async);

        if (o.headers) {
            for (; i<o.headers.length; i++) {
              req.setRequestHeader(o.headers[i].name, o.headers[i].value);
            }
        }

        req.handleResp = (o.callback != null) ? o.callback : function() { that.html(location, this.responseText); };
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
})();

if(typeof(Ur) == 'undefined') {
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
        window.addEventListener('load', function(e) { Ur.initialize(e, fragment)}, false);
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

window.addEventListener('load', Ur.initialize, false);
window.addEventListener('DOMContentLoaded', Ur.initialize, false);

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
  
  // TODO: Make private:
  find_next_ancestor: function(elem, type) {
    //check to make sure there's still a parent:
    if (elem.parentNode != window.document) {
      return x$().find_set_ancestor(elem.parentNode, type);
    } else {
      return null;
    }
  },

  find_set_ancestor: function(elem, type) {
    var set_name = x$(elem).attr("data-ur-set")[0];
    if (set_name !== undefined) {
      if(type == undefined) {
        return elem;
      } else if (set_name == type) {
        return elem;
      } else {
        return x$().find_next_ancestor(elem, type);
      }
    } else {
      return x$().find_next_ancestor(elem, type);
    }
  },

  get_unique_uranium_id: (function() {
    var count = 0;
    return function get_id() {
      count += 1;
      return count;
    }
  })(),

  find_elements: function(type, component_constructors) {
    var groups = {};

    this.each(
      (function(type, constructors, groups) {
        return function() {x$().helper_find(this, type, constructors, groups)};
      })(type, component_constructors, groups));

    return groups;
  },
  // TODO: Make helper_find() private since its just a helper function
  helper_find: function(fragment, type, component_constructors, groups) {
    var all_elements = x$(fragment).find('*[data-ur-' + type + '-component]');

    all_elements.each(
      function() {

        var valid_component = true;

        ///////// Resolve this component to its set ///////////

        // Check if this has the data-ur-id attribute
        var my_set_id = x$(this).attr("data-ur-id")[0];

        if (my_set_id !== undefined) {
          if ( groups[my_set_id] === undefined) {
            groups[my_set_id] = {};
          }          
        } else {
          //Find any set ancestors
          var my_ancestor = x$().find_set_ancestor(this, type);

          var widget_disabled = x$(my_ancestor).attr("data-ur-state")[0];
          if(widget_disabled === "disabled" && Ur.loaded == false) {
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

          } else {
            // we're screwed ... report an error
            console.log("Uranium Error: Couldn't find associated ur-set for component:",this);
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
	  if (component_constructors !== undefined && component_constructors[component_type] !== undefined) {
	    component_constructors[component_type](groups[my_set_id], this, component_type);
	  } else {
            groups[my_set_id][component_type] = this;
          }
        }

      }
    );

    return groups;
  }
}

xui.extend(mixins);

/* Carousel  *
 * * * * * * *
 * The carousel is a widget to allow for horizontally scrolling (with touch or  
 * buttons) between a set of items. 
 * 
 * The only assumption is about the items' style -- they must be (float: left) 
 * and (display:inline-block) so that the real width can be accurately totalled.
 * 
 */

Ur.WindowLoaders['carousel'] = (function(){

  function Carousel(components) {
    this.container = components["view_container"];
    this.items = components["scroll_container"];
    if (this.items.length == 0) {
      console.log("Error -- carousel missing item components");
      return false;
    }

    // Optionally:
    this.button = (components["button"] === undefined) ? {} : components["button"];
    this.count = components["count"]; 
    this.multi = x$(components["view_container"]).attr("data-ur-type")[0] == "multi";
    this.vertical_scroll = (x$(components["set"]).attr("data-ur-vertical-scroll")[0] === "enabled");

    this.initialize();
    this.onSlideCallbacks = [];
  }

  // Private/Helper methods

  function get_real_width(elem) {
    elem = x$(elem);
    var total = 0;
    var styles = ["width", "padding-left", "padding-right", "margin-left", "margin-right", "border-left-width", "border-right-width"];

    x$().iterate(
      styles,
      function(style) {
        total += parseInt(elem.getStyle(style));
      }
    );

    return total;
  }

  function sign(v) 
  { 
    return (v >= 0) ? 1 : -1;
  }

  function zero_ceil(num) {
    return (num <= 0) ? Math.floor(num) : Math.ceil(num);
  }

  function zero_floor(num)
  {
    return (num >= 0) ? Math.floor(num) : Math.ceil(num);
  }

  function stifle(e)
  {
    e.preventDefault();
    e.stopPropagation();
  }

  function translate(obj, x) {
    obj.style.webkitTransform = "translate3d(" + x + "px, 0px, 0px)";
  }

  //// Public Methods ////

  Carousel.prototype = {
    initialize: function() {
      // TODO:
      // add an internal event handler to handle all events on the container:
      // x$(this.container).on("event",this.handleEvent);

      var touch_enabled = x$(this.container).attr("data-ur-touch")[0];
      touch_enabled = (touch_enabled === undefined) ? true : (touch_enabled == "enabled" ? true : false);
      x$(this.container).attr("data-ur-touch", touch_enabled ? "enabled" : "disabled");      

      if (touch_enabled) {
        if(xui.touch) {
          this.touch = true;
          x$(this.items).on("touchstart",(function(obj){return function(e){obj.start_swipe(e)};})(this));
          x$(this.items).on("touchmove",(function(obj){return function(e){obj.continue_swipe(e)};})(this));
          x$(this.items).on("touchend",(function(obj){return function(e){obj.finish_swipe(e)};})(this));
        } else {
          this.touch = false;
          x$(this.items).on("mousedown",(function(obj){return function(e){obj.start_swipe(e)};})(this));
          x$(this.items).on("mousemove",(function(obj){return function(e){obj.continue_swipe(e)};})(this));
          x$(this.items).on("mouseup",(function(obj){return function(e){obj.finish_swipe(e)};})(this));
        }
      }

      x$(this.button["prev"]).on("click", (function(obj){return function(){obj.move_to(obj.magazine_count)};})(this));
      x$(this.button["next"]).on("click", (function(obj){return function(){obj.move_to(-obj.magazine_count)};})(this));

      this.item_index = 0;
      this.magazine_count = 1;
      this.adjust_spacing();
      this.update_index(0);
      
      // Expose this function globally: (this will work on webkit / FF)
      this.jump_to_index = (function(obj) { return function(idx) { obj.__proto__.move_to_index.call(obj, idx); };})(this);

      window.setInterval(function(obj){return function(){obj.resize();}}(this),1000);
    },

    get_transform: function(obj) {
      var transform = window.getComputedStyle(obj).webkitTransform;
      if (transform != "none") {
        transform = new WebKitCSSMatrix(transform);
        return transform.m41;
      } else {
        console.log("no webkit transform");
        return 0;
      }
    },

    resize: function(){
      // When I have multi-item carousels, I'll just need to need to make a calculate_snap_width method
      if (this.snap_width != this.container.offsetWidth) {
        this.adjust_spacing();
      }
    },
      
    adjust_spacing: function() {
      // Will need to be called if the container's size changes --> orientation change
      var visible_width = this.container.offsetWidth;

      if (this.old_width !== undefined && this.old_width == visible_width) {
        return
      }
      this.old_width = visible_width;

      var cumulative_offset = 0;
      var items = x$(this.items).find("[data-ur-carousel-component='item']");
      this.item_count = items.length;

      // Adjust the container to be the necessary width.
      // I have to do this because the alternative is assuming the container expands to its full width (display:table-row) which is non-standard if the container isn't a <tr>
      var total_width = 0;
      x$().iterate(
        items,
        function(item) {
          total_width += get_real_width(item);
        }
      );

      this.items.style.width = total_width + "px";

      // For the multi-pane case --> I'll set the snap_width to the width of a single element
      this.snap_width = visible_width;

      if(this.multi) {
        var item_width = get_real_width(items[0]); // I'm making an assumption here that all items have the same width
        var magazine_count = Math.floor(visible_width / item_width);

        magazine_count = (magazine_count > this.item_count) ? this.item_count : magazine_count;
        this.magazine_count = magazine_count;

        var space = (visible_width - magazine_count*item_width);
        this.snap_width = space / (magazine_count - 1) + item_width;
        this.last_index = this.item_count - this.magazine_count;
      } else { 
        this.last_index = this.item_count - 1;
      }

      this.item_index = (this.last_index < this.item_index) ? this.last_index : this.item_index;
      cumulative_offset -= this.snap_width*this.item_index; // initial offset
      translate(this.items, cumulative_offset);
      var cumulative_item_offset = 0;

      if (this.multi) {
        x$().iterate(
          items,
          function(item, i) {
            var offset = cumulative_item_offset;
            if ( i != 0 ) {
              offset += space/(magazine_count - 1);
            }
            translate(item, offset);
            cumulative_item_offset = offset;
          }
        );
        this.update_index(this.item_index);
      } else {
        // Single Pane
        x$().iterate(
          items,
          function(item, i) {
            var offset = cumulative_item_offset;
            if ( i != 0 ) {
              offset += visible_width - items[i-1].offsetWidth;
            }
            translate(item, offset);
            cumulative_item_offset = offset;
          }
        );
      }
    },

    get_event_coordinates: function(e) {
      if(this.touch) {
        if(e.touches.length == 1)
        {
          return {x: e.touches[0].clientX, y: e.touches[0].clientY};
        }
      } else {
        return {x: e.clientX, y: e.clientY};
      }
      return null;
    },

    update_buttons: function() {
      if(this.item_index == 0) {
        x$(this.button["prev"]).attr("data-ur-state","disabled")
        x$(this.button["next"]).attr("data-ur-state","enabled")
      } else if (this.item_index == this.last_index) {
        x$(this.button["next"]).attr("data-ur-state","disabled")
        x$(this.button["prev"]).attr("data-ur-state","enabled")
      } else {
        x$(this.button["next"]).attr("data-ur-state","enabled")
        x$(this.button["prev"]).attr("data-ur-state","enabled")
      }
    },

    get_new_index: function(direction) {
      var new_idx = this.item_index - direction;

      if(new_idx > this.last_index) {
        new_idx = this.last_index;
      } else if (new_idx < 0) {
        new_idx = 0;
      }

      return new_idx;
    },

    update_index: function(new_index) {
      if (new_index === undefined) { 
        return
      }

      this.item_index = new_index;
      if (this.item_index < 0) {
        this.item_index = 0;
      } else if(this.item_index > this.last_index) {
        this.item_index = this.last_index - 1;
      }
      
      if(this.count !== undefined) {
        if(this.multi) {
          this.count.innerHTML = this.item_index + 1 + " to " + (this.item_index + this.magazine_count) +" of " + this.item_count;
        } else {
          this.count.innerHTML = this.item_index + 1 + " of " + this.item_count;
        }
      }
      
      // TODO: Update to work w multipane
      var active_item = x$(this.items).find("*[data-ur-carousel-component='item'][data-ur-state='active']");
      active_item.attr("data-ur-state","inactive");
      var new_active_item = x$(this.items).find("*[data-ur-carousel-component='item']")[this.item_index];
      x$(new_active_item).attr("data-ur-state","active");

      this.update_buttons();
    },

    start_swipe: function(e)
    {
      this.touch_in_progress = true; // For non-touch environments
      var coords = this.get_event_coordinates(e);

      if(coords !== null)
      {
        var x_transform = this.get_transform(this.items);

        if(this.starting_offset === undefined || this.starting_offset === null) {
          this.starting_offset = x_transform;
          this.start_pos = coords;
        } else {
          // Fast swipe
          this.starting_offset = this.destination_offset; //Factor incomplete previous swipe
          this.start_pos = coords;
        }
      }
      this.click = true;
    },
    
    continue_swipe: function(e)
    {
      if (!this.vertical_scroll) {
        stifle(e);
      }

      if(!this.touch_in_progress) // For non-touch environments
        return

      var coords = this.get_event_coordinates(e);
      if(coords !== null)
      {
        this.end_pos = coords;
        var dist = this.swipe_dist() + this.starting_offset;
        translate(this.items, dist);
      }
      this.click = false;    
    },
    
    finish_swipe: function(e)
    {      
      if(!this.click) {
        stifle(e);
      } else {
        return;
      }

      this.touch_in_progress = false; // For non-touch environments
      
      if(!this.touch || e.touches.length == 0)
      {    
        this.move_helper(this.get_displacement_index());
      }
    },
    get_displacement_index: function() {
      var swipe_distance = this.swipe_dist();
      var displacement_index = 0;

      if (this.multi) {
        // Sigmoid FTW:
        var range = this.magazine_count;
        var range_offset = range/2.0;
        displacement_index = zero_ceil( 1/(1 + Math.pow(Math.E,-1.0*swipe_distance)) * range - range_offset);
      } else {
        displacement_index = zero_ceil(swipe_distance/this.snap_width);
      }

      return displacement_index;
    },
    snap_to: function(displacement) {
      this.destination_offset = displacement + this.starting_offset;        
      var max_offset = -1*(this.last_index)*this.snap_width;

      if ( this.destination_offset < max_offset || this.destination_offset > 0 ) {
        if (Math.abs(this.destination_offset - max_offset) < 1) {
          // Hacky -- but there are rounding errors
          // I see this when I'm in multi-mode and using the buttons
          // This only seems to happen on the desktop browser -- ideally its removed at compile time
          this.destination_offset = max_offset;
        } else {
          this.destination_offset = this.starting_offset;
        }
      }
      
      this.momentum();  
    },

    move_to: function(direction) {
      if (this.increment_flag) {
        // The animation isnt done yet
        return
      }
      this.starting_offset = this.get_transform(this.items);
      var new_idx = this.item_index - direction;
      this.move_helper(direction);
    },

    move_helper: function(direction){
      var new_idx = this.get_new_index(direction);

      var new_item = x$(this.items).find("*[data-ur-carousel-component='item']")[new_idx];
      var current_item = x$(this.items).find("*[data-ur-carousel-component='item']")[this.item_index];

      var offset = this.get_transform(current_item) - this.get_transform(new_item);
      var displacement = current_item.offsetLeft - new_item.offsetLeft + offset;

      this.snap_to(displacement);
      this.update_index(new_idx);
    },

    move_to_index: function(index) {
      var direction = this.item_index - index;
      this.move_to(direction);
    },

    momentum: function()
    {
      if (this.touch_in_progress)
      {
        return;
      }     

      this.increment_flag = false;	

      var x_transform = this.get_transform(this.items);
      var distance = this.destination_offset - x_transform;
      var increment = distance - zero_floor(distance / 1.1);

      // Hacky -- this is for the desktop browser only -- to fix rounding errors
      // Ideally, this is removed at compile time
      if(Math.abs(increment) < 0.01) {
        increment = 0;
      } 

      translate(this.items, increment + x_transform);

      if(increment != 0)
      {
	this.increment_flag = true;
      }

      if(this.increment_flag)
      {
        setTimeout(function(obj){return function(){obj.momentum()}}(this),16);		    
      } else {
        this.starting_offset = null;
        x$().iterate(
          this.onSlideCallbacks,
          function(callback) {
            callback();
          }
        );
      }
    },    

    swipe_dist: function()
    {
      if (this.end_pos === undefined)
        return 0;
      var sw_dist = this.end_pos['x'] - this.start_pos['x'];
      return sw_dist;
    }
  }

  // Private constructors
  var ComponentConstructors = {
    "button": function(group, component, type) {
      if (group["button"] === undefined) {
        group["button"] = {};
      }
      
      var type = x$(component).attr("data-ur-carousel-button-type")[0];
      if(type === undefined) {
        // Declaration error
        console.log("Uranium declaration error: Malformed carousel button type on:" + component.outerHTML);
      }

      group["button"][type] = component;

      // Maybe in the future I'll make it so any of the items can be the starting item
      if (type == "prev") {
        x$(component).attr("data-ur-state","disabled");
      } else {
        x$(component).attr("data-ur-state","enabled");
      }

    }
  }

  function CarouselLoader(){}
  
  CarouselLoader.prototype.initialize = function(fragment) {
    var carousels = x$(fragment).find_elements('carousel', ComponentConstructors);
    Ur.Widgets["carousel"] = {};
    for (var name in carousels) {
      var carousel = carousels[name];
      Ur.Widgets["carousel"][name] = new Carousel(carousel);
      x$(carousel["set"]).attr("data-ur-state","enabled");
    }
  }

  return CarouselLoader;
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
    var font_resizers = x$(fragment).find_elements('font-resizer');
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
 
Ur.QuickLoaders['geocode'] = (function(){
  
  function Geocode(data) {
    this.elements = data;
    this.callback = x$(this.elements.set).attr("data-ur-callback")[0];

    UrGeocode = function(obj){return function(){obj.setup_callbacks();};}(this);
    var s = document.createElement('script');
    s.type = "text/javascript";
    s.src = "http://maps.googleapis.com/maps/api/js?sensor=true&callback=UrGeocode";
    x$('head').html('bottom', s);
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
          this.geoError, 
          this.geoDenied
        );  
      }
    }
  }

  function GeocodeLoader() {
  }

  GeocodeLoader.prototype.initialize = function(fragment) {
    var my_geo = x$(fragment).find_elements('reverse-geocode');
    
    Ur.Widgets["geocode"] = {}
    
    for (var name in my_geo){
      Ur.Widgets["geocode"][name] = new Geocode(my_geo[name]);
      break;
    }
    
  }

  return GeocodeLoader;
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
    var maps = x$(fragment).find_elements('map', ComponentConstructors);
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
    var select_buttons = x$(fragment).find_elements('select-buttons');
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
    var value = "";
    var self = this;
    x$().iterate(
      this.list.children,
      function(element, index){
        if(element == selected_list_option) {
	  x$(element).attr("data-ur-state","enabled");
          value = x$(element).attr("value");
        } else {
	  x$(element).attr("data-ur-state","disabled");
        }
      }
    );

    //  x$(this.select).attr("value",value); //Odd - this doesn't work, but the following line does
    // -- I think 'value' is a special attribute ... its not in the attributes[] property of a node
    this.select.value = value;

    return true;
  }


  function SelectListLoader(){
    this.SelectLists = {};
    // Keep instances here because we may need them in the future
    // - In v1 we had to listen for changes on the <select>'s and update appropriately
    // - Sometimes we had to listen for different events
  }

  SelectListLoader.prototype.initialize = function(fragment) {
    var select_lists = x$(fragment).find_elements('select-list');
    var self = this;
    for (var name in select_lists) {
      var select_list = select_lists[name];
      self.SelectLists[name] = new SelectList(select_lists[name]["select"],select_lists[name]["content"]);
      x$(select_list["set"]).attr("data-ur-state","enabled");
    }
  }

  return SelectListLoader;
})();
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
        console.log("Ur error -- no matching tab content for tab button");
        return
      }
      
      var state = x$(button).attr("data-ur-state")[0];
      if(state !== undefined && state == "enabled") {
        default_tab = -1;
      }
      
      var closeable = x$(this.elements["set"]).attr("data-ur-closeable")[0];
      closeable = (closeable !== undefined && closeable == "true") ? true : false;
      console.log("closeable? " + closeable);

      var self = this;
      x$(button).on(
        "click",
        function(evt) {
          var this_tab_id = x$(evt.target).attr("data-ur-tab-id")[0];
          
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
    var togglers = x$(fragment).find_elements('toggler', this.component_constructors);
    var self=this;
    
    for(var toggler_id in togglers) {
      var toggler = togglers[toggler_id];

      if (toggler["button"] === undefined) {
        console.log("Uranium Declaration Error: No button found for toggler with id=" + toggler_id);
        continue;
      }

      var toggler_state = x$(toggler["button"]).attr("data-ur-state")[0];
      if(toggler_state === undefined) {
        x$(toggler["button"]).attr("data-ur-state", 'disabled');
        toggler_state = "disabled";
      } 

      if (toggler["content"] === undefined) {
        console.log("Uranium Declaration Error: No content found for toggler with id=" + toggler_id);
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
    this.zoom_previews = x$(fragment).find_elements('zoom-preview', ComponentConstructors);
    Ur.Widgets["zoom-preview"] = {};
    for (var name in this.zoom_previews) {
      Ur.Widgets["zoom-preview"][name] = new ZoomPreview(this.zoom_previews[name]);
      x$(this.zoom_previews[name]["set"]).attr("data-ur-state","enabled");
    }
  }

  return ZoomPreviewLoader;
})();