(function() {
  var undefined, xui, window = this, string = new String("string"), document = window.document, simpleExpr = /^#?([\w-]+)$/, idExpr = /^#/, tagExpr = /<([\w:]+)/, slice = function(e) {
    return[].slice.call(e, 0)
  };
  try {
    var a = slice(document.documentElement.childNodes)[0].nodeType
  }catch(e) {
    slice = function(e) {
      var ret = [];
      for(var i = 0;e[i];i++) {
        ret.push(e[i])
      }
      return ret
    }
  }
  window.x$ = window.xui = xui = function(q, context) {
    return new xui.fn.find(q, context)
  };
  if(![].forEach) {
    Array.prototype.forEach = function(fn) {
      var len = this.length || 0, i = 0, that = arguments[1];
      if(typeof fn == "function") {
        for(;i < len;i++) {
          fn.call(that, this[i], i, this)
        }
      }
    }
  }
  function removex(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest)
  }
  xui.fn = xui.prototype = {extend:function(o) {
    for(var i in o) {
      xui.fn[i] = o[i]
    }
  }, find:function(q, context) {
    var ele = [], tempNode;
    if(!q) {
      return this
    }else {
      if(context == undefined && this.length) {
        ele = this.each(function(el) {
          ele = ele.concat(slice(xui(q, el)))
        }).reduce(ele)
      }else {
        context = context || document;
        if(typeof q == string) {
          if(simpleExpr.test(q) && context.getElementById && context.getElementsByTagName) {
            ele = idExpr.test(q) ? [context.getElementById(q.substr(1))] : context.getElementsByTagName(q);
            if(ele[0] == null) {
              ele = []
            }
          }else {
            if(tagExpr.test(q)) {
              tempNode = document.createElement("i");
              tempNode.innerHTML = q;
              slice(tempNode.childNodes).forEach(function(el) {
                ele.push(el)
              })
            }else {
              if(window.Sizzle !== undefined) {
                ele = Sizzle(q, context)
              }else {
                ele = context.querySelectorAll(q)
              }
            }
          }
          ele = slice(ele)
        }else {
          if(q instanceof Array) {
            ele = q
          }else {
            if(q.toString() == "[object NodeList]") {
              ele = slice(q)
            }else {
              if(q.nodeName || q === window) {
                ele = [q]
              }
            }
          }
        }
      }
    }
    return this.set(ele)
  }, set:function(elements) {
    var ret = xui();
    ret.cache = slice(this.length ? this : []);
    ret.length = 0;
    [].push.apply(ret, elements);
    return ret
  }, reduce:function(elements, b) {
    var a = [], elements = elements || slice(this);
    elements.forEach(function(el) {
      if(a.indexOf(el, 0, b) < 0) {
        a.push(el)
      }
    });
    return a
  }, has:function(q) {
    var list = xui(q);
    return this.filter(function() {
      var that = this;
      var found = null;
      list.each(function(el) {
        found = found || el == that
      });
      return found
    })
  }, filter:function(fn) {
    var elements = [];
    return this.each(function(el, i) {
      if(fn.call(el, i)) {
        elements.push(el)
      }
    }).set(elements)
  }, not:function(q) {
    var list = slice(this);
    return this.filter(function(i) {
      var found;
      xui(q).each(function(el) {
        return found = list[i] != el
      });
      return found
    })
  }, each:function(fn) {
    for(var i = 0, len = this.length;i < len;++i) {
      if(fn.call(this[i], this[i], i, this) === false) {
        break
      }
    }
    return this
  }};
  xui.fn.find.prototype = xui.fn;
  xui.extend = xui.fn.extend;
  xui.extend({html:function(location, html) {
    clean(this);
    if(arguments.length == 0) {
      return this[0].innerHTML
    }
    if(arguments.length == 1 && arguments[0] != "remove") {
      html = location;
      location = "inner"
    }
    if(location != "remove" && html && html.each !== undefined) {
      if(location == "inner") {
        var d = document.createElement("p");
        html.each(function(el) {
          d.appendChild(el)
        });
        this.each(function(el) {
          el.innerHTML = d.innerHTML
        })
      }else {
        var that = this;
        html.each(function(el) {
          that.html(location, el)
        })
      }
      return this
    }
    return this.each(function(el) {
      var parent, list, len, i = 0;
      if(location == "inner") {
        if(typeof html == string || typeof html == "number") {
          el.innerHTML = html;
          list = el.getElementsByTagName("SCRIPT");
          len = list.length;
          for(;i < len;i++) {
            eval(list[i].text)
          }
        }else {
          el.innerHTML = "";
          el.appendChild(html)
        }
      }else {
        if(location == "outer") {
          el.parentNode.replaceChild(wrapHelper(html, el), el)
        }else {
          if(location == "top") {
            el.insertBefore(wrapHelper(html, el), el.firstChild)
          }else {
            if(location == "bottom") {
              el.insertBefore(wrapHelper(html, el), null)
            }else {
              if(location == "remove") {
                el.parentNode.removeChild(el)
              }else {
                if(location == "before") {
                  el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el)
                }else {
                  if(location == "after") {
                    el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el.nextSibling)
                  }
                }
              }
            }
          }
        }
      }
    })
  }, attr:function(attribute, val) {
    if(arguments.length == 2) {
      return this.each(function(el) {
        attribute == "checked" && (val == "" || val == false || typeof val == "undefined") ? el.removeAttribute(attribute) : el.setAttribute(attribute, val)
      })
    }else {
      var attrs = [];
      this.each(function(el) {
        var val = el.getAttribute(attribute);
        if(val != null) {
          attrs.push(val)
        }
      });
      return attrs
    }
  }});
  "inner outer top bottom remove before after".split(" ").forEach(function(method) {
    xui.fn[method] = function(where) {
      return function(html) {
        return this.html(where, html)
      }
    }(method)
  });
  function getTag(el) {
    return el.firstChild === null ? {"UL":"LI", "DL":"DT", "TR":"TD"}[el.tagName] || el.tagName : el.firstChild.tagName
  }
  function wrapHelper(html, el) {
    return typeof html == string ? wrap(html, getTag(el)) : html
  }
  function wrap(xhtml, tag) {
    var attributes = {}, re = /^<([A-Z][A-Z0-9]*)([^>]*)>([\s\S]*)<\/\1>/i, element, x, a, i = 0, attr, node, attrList, result;
    if(re.test(xhtml)) {
      result = re.exec(xhtml);
      tag = result[1];
      if(result[2] !== "") {
        attrList = result[2].split(/([A-Z]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i);
        for(;i < attrList.length;i++) {
          attr = attrList[i].replace(/^\s*|\s*$/g, "");
          if(attr !== "" && attr !== " ") {
            node = attr.split("=");
            attributes[node[0]] = node[1].replace(/(["']?)/g, "")
          }
        }
      }
      xhtml = result[3]
    }
    element = document.createElement(tag);
    for(x in attributes) {
      a = document.createAttribute(x);
      a.nodeValue = attributes[x];
      element.setAttributeNode(a)
    }
    element.innerHTML = xhtml;
    return element
  }
  function clean(collection) {
    var ns = /\S/;
    collection.each(function(el) {
      var d = el, n = d.firstChild, ni = -1, nx;
      while(n) {
        nx = n.nextSibling;
        if(n.nodeType == 3 && !ns.test(n.nodeValue)) {
          d.removeChild(n)
        }else {
          n.nodeIndex = ++ni
        }
        n = nx
      }
    })
  }
  xui.events = {};
  var cache = {};
  xui.extend({on:function(type, fn, details) {
    return this.each(function(el) {
      if(xui.events[type]) {
        var id = _getEventID(el), responders = _getRespondersForEvent(id, type);
        details = details || {};
        details.handler = function(event, data) {
          xui.fn.fire.call(xui(this), type, data)
        };
        if(!responders.length) {
          xui.events[type].call(el, details)
        }
      }
      el.addEventListener(type, _createResponder(el, type, fn), false)
    })
  }, un:function(type, fn) {
    return this.each(function(el) {
      var id = _getEventID(el), responders = _getRespondersForEvent(id, type), i = responders.length;
      while(i--) {
        if(fn === undefined || fn.guid === responders[i].guid) {
          el.removeEventListener(type, responders[i], false);
          removex(cache[id][type], i, 1)
        }
      }
      if(cache[id][type].length === 0) {
        delete cache[id][type]
      }
      for(var t in cache[id]) {
        return
      }
      delete cache[id]
    })
  }, fire:function(type, data) {
    return this.each(function(el) {
      if(el == document && !el.dispatchEvent) {
        el = document.documentElement
      }
      var event = document.createEvent("HTMLEvents");
      event.initEvent(type, true, true);
      event.data = data || {};
      event.eventName = type;
      el.dispatchEvent(event)
    })
  }});
  "click load submit touchstart touchmove touchend touchcancel gesturestart gesturechange gestureend orientationchange".split(" ").forEach(function(event) {
    xui.fn[event] = function(action) {
      return function(fn) {
        return fn ? this.on(action, fn) : this.fire(action)
      }
    }(event)
  });
  xui(window).on("load", function() {
    if(!("onorientationchange" in document.body)) {
      (function(w, h) {
        xui(window).on("resize", function() {
          var portraitSwitch = window.innerWidth < w && window.innerHeight > h && window.innerWidth < window.innerHeight, landscapeSwitch = window.innerWidth > w && window.innerHeight < h && window.innerWidth > window.innerHeight;
          if(portraitSwitch || landscapeSwitch) {
            window.orientation = portraitSwitch ? 0 : 90;
            xui("body").fire("orientationchange");
            w = window.innerWidth;
            h = window.innerHeight
          }
        })
      })(window.innerWidth, window.innerHeight)
    }
  });
  xui.touch = function() {
    try {
      return!!document.createEvent("TouchEvent").initTouchEvent
    }catch(e) {
      return false
    }
  }();
  function _getEventID(element) {
    if(element._xuiEventID) {
      return element._xuiEventID
    }
    return element._xuiEventID = ++_getEventID.id
  }
  _getEventID.id = 1;
  function _getRespondersForEvent(id, eventName) {
    var c = cache[id] = cache[id] || {};
    return c[eventName] = c[eventName] || []
  }
  function _createResponder(element, eventName, handler) {
    var id = _getEventID(element), r = _getRespondersForEvent(id, eventName);
    var responder = function(event) {
      if(handler.call(element, event) === false) {
        event.preventDefault();
        event.stopPropagation()
      }
    };
    responder.guid = handler.guid = handler.guid || ++_getEventID.id;
    responder.handler = handler;
    r.push(responder);
    return responder
  }
  xui.extend({tween:function(props, callback) {
    var emileOpts = function(o) {
      var options = {};
      "duration after easing".split(" ").forEach(function(p) {
        if(props[p]) {
          options[p] = props[p];
          delete props[p]
        }
      });
      return options
    };
    var serialize = function(props) {
      var serialisedProps = [], key;
      if(typeof props != string) {
        for(key in props) {
          serialisedProps.push(key + ":" + props[key])
        }
        serialisedProps = serialisedProps.join(";")
      }else {
        serialisedProps = props
      }
      return serialisedProps
    };
    if(props instanceof Array) {
      props.forEach(function(a) {
      })
    }
    var opts = emileOpts(props);
    var prop = serialize(props);
    return this.each(function(e) {
      emile(e, prop, opts, callback)
    })
  }});
  function hasClass(el, className) {
    return getClassRegEx(className).test(el.className)
  }
  var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
  function trim(text) {
    return(text || "").replace(rtrim, "")
  }
  xui.extend({setStyle:function(prop, val) {
    prop = prop.replace(/\-[a-z]/g, function(m) {
      return m[1].toUpperCase()
    });
    return this.each(function(el) {
      el.style[prop] = val
    })
  }, getStyle:function(prop, callback) {
    var s = function(el, p) {
      return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/[A-Z]/g, function(m) {
        return"-" + m.toLowerCase()
      }))
    };
    if(callback === undefined) {
      var styles = [];
      this.each(function(el) {
        styles.push(s(el, prop))
      });
      return styles
    }else {
      this.each(function(el) {
        callback(s(el, prop))
      })
    }
  }, addClass:function(className) {
    return this.each(function(el) {
      if(hasClass(el, className) === false) {
        el.className = trim(el.className + " " + className)
      }
    })
  }, hasClass:function(className, callback) {
    var self = this;
    return this.length && function() {
      var hasIt = false;
      self.each(function(el) {
        if(hasClass(el, className)) {
          hasIt = true;
          if(callback) {
            callback(el)
          }
        }
      });
      return hasIt
    }()
  }, removeClass:function(className) {
    if(className === undefined) {
      this.each(function(el) {
        el.className = ""
      })
    }else {
      var re = getClassRegEx(className);
      this.each(function(el) {
        el.className = trim(el.className.replace(re, "$1"))
      })
    }
    return this
  }, css:function(o) {
    for(var prop in o) {
      this.setStyle(prop, o[prop])
    }
    return this
  }});
  var reClassNameCache = {}, getClassRegEx = function(className) {
    var re = reClassNameCache[className];
    if(!re) {
      re = new RegExp("(^|\\s+)" + className + "(?:\\s+|$)");
      reClassNameCache[className] = re
    }
    return re
  };
  xui.extend({xhr:function(location, url, options) {
    if(!/^(inner|outer|top|bottom|before|after)$/.test(location)) {
      options = url;
      url = location;
      location = "inner"
    }
    var o = options ? options : {};
    if(typeof options == "function") {
      o = {};
      o.callback = options
    }
    var that = this, req = new XMLHttpRequest, method = o.method || "get", async = o.async || false, params = o.data || null, i = 0;
    req.queryString = params;
    req.open(method, url, async);
    if(o.headers) {
      for(;i < o.headers.length;i++) {
        req.setRequestHeader(o.headers[i].name, o.headers[i].value)
      }
    }
    req.handleResp = o.callback != null ? o.callback : function() {
      that.html(location, this.responseText)
    };
    req.handleError = o.error && typeof o.error == "function" ? o.error : function() {
    };
    function hdl() {
      if(req.readyState == 4) {
        delete that.xmlHttpRequest;
        if(req.status === 0 || req.status == 200) {
          req.handleResp()
        }
        if(/^[45]/.test(req.status)) {
          req.handleError()
        }
      }
    }
    if(async) {
      req.onreadystatechange = hdl;
      this.xmlHttpRequest = req
    }
    req.send(params);
    if(!async) {
      hdl()
    }
    return this
  }});
  (function(emile, container) {
    var parseEl = document.createElement("div"), props = ("backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth " + "borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize " + "fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight " + "maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft " + "paddingRight paddingTop right textIndent top width wordSpacing zIndex").split(" ");
    function interpolate(source, target, pos) {
      return(source + (target - source) * pos).toFixed(3)
    }
    function s(str, p, c) {
      return str.substr(p, c || 1)
    }
    function color(source, target, pos) {
      var i = 2, j, c, tmp, v = [], r = [];
      while(j = 3, c = arguments[i - 1], i--) {
        if(s(c, 0) == "r") {
          c = c.match(/\d+/g);
          while(j--) {
            v.push(~~c[j])
          }
        }else {
          if(c.length == 4) {
            c = "#" + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3)
          }
          while(j--) {
            v.push(parseInt(s(c, 1 + j * 2, 2), 16))
          }
        }
      }
      while(j--) {
        tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
        r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp)
      }
      return"rgb(" + r.join(",") + ")"
    }
    function parse(prop) {
      var p = parseFloat(prop), q = prop.replace(/^[\-\d\.]+/, "");
      return isNaN(p) ? {v:q, f:color, u:""} : {v:p, f:interpolate, u:q}
    }
    function normalize(style) {
      var css, rules = {}, i = props.length, v;
      parseEl.innerHTML = '<div style="' + style + '"></div>';
      css = parseEl.childNodes[0].style;
      while(i--) {
        if(v = css[props[i]]) {
          rules[props[i]] = parse(v)
        }
      }
      return rules
    }
    container[emile] = function(el, style, opts, after) {
      el = typeof el == "string" ? document.getElementById(el) : el;
      opts = opts || {};
      var target = normalize(style), comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null), prop, current = {}, start = +new Date, dur = opts.duration || 200, finish = start + dur, interval, easing = opts.easing || function(pos) {
        return-Math.cos(pos * Math.PI) / 2 + 0.5
      };
      for(prop in target) {
        current[prop] = parse(comp[prop])
      }
      interval = setInterval(function() {
        var time = +new Date, pos = time > finish ? 1 : (time - start) / dur;
        for(prop in target) {
          el.style[prop] = target[prop].f(current[prop].v, target[prop].v, easing(pos)) + target[prop].u
        }
        if(time > finish) {
          clearInterval(interval);
          opts.after && opts.after();
          after && setTimeout(after, 1)
        }
      }, 10)
    }
  })("emile", this)
})();
if(typeof Ur == "undefined") {
  Ur = {QuickLoaders:{}, WindowLoaders:{}, Widgets:{}, onLoadCallbacks:[], setup:function(fragment) {
    Ur.initialize({type:"DOMContentLoaded"}, fragment);
    if(Ur.loaded) {
      Ur.initialize({type:"load"}, fragment)
    }else {
      window.addEventListener("load", function(e) {
        Ur.initialize(e, fragment)
      }, false)
    }
  }, initialize:function(event, fragment) {
    var Loaders = event.type == "DOMContentLoaded" ? Ur.QuickLoaders : Ur.WindowLoaders;
    if(fragment === undefined) {
      fragment = document.body
    }
    for(name in Loaders) {
      var widget = new Loaders[name];
      widget.initialize(fragment)
    }
    if(event.type == "load") {
      Ur.loaded = true;
      Ur._onLoad()
    }
  }, _onLoad:function() {
    x$().iterate(Ur.onLoadCallbacks, function(callback) {
      callback()
    })
  }, loaded:false}
}
window.addEventListener("load", Ur.initialize, false);
window.addEventListener("DOMContentLoaded", Ur.initialize, false);
var mixins = {iterate:function(stuff, fn) {
  if(stuff === undefined) {
    return
  }
  var len = stuff.length || 0, i = 0, that = arguments[1];
  if(typeof fn == "function") {
    for(;i < len;i++) {
      fn.call(that, stuff[i], i, stuff)
    }
  }
}, offset:function(elm) {
  if(typeof(elm == "undefined")) {
    elm = this[0]
  }
  cumulative_top = 0;
  cumulative_left = 0;
  while(elm.offsetParent) {
    cumulative_top += elm.offsetTop;
    cumulative_left += elm.offsetLeft;
    elm = elm.offsetParent
  }
  return{left:cumulative_left, top:cumulative_top}
}, find_next_ancestor:function(elem, type) {
  if(elem.parentNode != window.document) {
    return x$().find_set_ancestor(elem.parentNode, type)
  }else {
    return null
  }
}, find_set_ancestor:function(elem, type) {
  var set_name = x$(elem).attr("data-ur-set")[0];
  if(set_name !== undefined) {
    if(type == undefined) {
      return elem
    }else {
      if(set_name == type) {
        return elem
      }else {
        return x$().find_next_ancestor(elem, type)
      }
    }
  }else {
    return x$().find_next_ancestor(elem, type)
  }
}, get_unique_uranium_id:function() {
  var count = 0;
  return function get_id() {
    count += 1;
    return count
  }
}(), find_elements:function(type, component_constructors) {
  var groups = {};
  this.each(function(type, constructors, groups) {
    return function() {
      x$().helper_find(this, type, constructors, groups)
    }
  }(type, component_constructors, groups));
  return groups
}, helper_find:function(fragment, type, component_constructors, groups) {
  var all_elements = x$(fragment).find("*[data-ur-" + type + "-component]");
  all_elements.each(function() {
    var valid_component = true;
    var my_set_id = x$(this).attr("data-ur-id");
    if(my_set_id.length != 0) {
      if(groups[my_set_id] === undefined) {
        groups[my_set_id] = {}
      }
    }else {
      var my_ancestor = x$().find_set_ancestor(this, type);
      var widget_disabled = x$(my_ancestor).attr("data-ur-state")[0];
      if(widget_disabled === "disabled" && Ur.loaded == false) {
        return
      }
      if(my_ancestor !== null) {
        my_set_id = x$(my_ancestor).attr("data-ur-id")[0];
        if(my_set_id === undefined) {
          my_set_id = x$().get_unique_uranium_id();
          x$(my_ancestor).attr("data-ur-id", my_set_id)
        }
        if(groups[my_set_id] === undefined) {
          groups[my_set_id] = {}
        }
        groups[my_set_id]["set"] = my_ancestor
      }else {
        console.log("Uranium Error: Couldn't find associated ur-set for component:", this);
        valid_component = false
      }
    }
    var component_type = x$(this).attr("data-ur-" + type + "-component");
    if(component_type === undefined) {
      valid_component = false
    }
    if(valid_component) {
      if(component_constructors !== undefined && component_constructors[component_type] !== undefined) {
        component_constructors[component_type](groups[my_set_id], this, component_type)
      }else {
        groups[my_set_id][component_type] = this
      }
    }
  });
  return groups
}};
xui.extend(mixins);
Ur.QuickLoaders["toggler"] = function() {
  function ToggleContentComponent(group, content_component) {
    if(group["content"] === undefined) {
      group["content"] = []
    }
    group["content"].push(content_component)
  }
  function ToggleLoader() {
    this.component_constructors = {"content":ToggleContentComponent}
  }
  ToggleLoader.prototype.find = function(fragment) {
    var togglers = x$(fragment).find_elements("toggler", this.component_constructors);
    var self = this;
    for(toggler_id in togglers) {
      var toggler = togglers[toggler_id];
      if(toggler["button"] === undefined) {
        console.log("Uranium Declaration Error: No button found for toggler with id=" + toggler_id);
        continue
      }
      var toggler_state = x$(toggler["button"]).attr("data-ur-state")[0];
      if(toggler_state === undefined) {
        x$(toggler["button"]).attr("data-ur-state", "disabled")
      }
      if(toggler["content"] === undefined) {
        console.log("Uranium Declaration Error: No content found for toggler with id=" + toggler_id);
        continue
      }
      x$().iterate(toggler["content"], function(content) {
        if(x$(content).attr("data-ur-state")[0] === undefined) {
          x$(content).attr("data-ur-state", toggler_state)
        }
      })
    }
    return togglers
  };
  ToggleLoader.prototype.construct_button_callback = function(contents) {
    var self = this;
    return function(evt) {
      var button = evt.currentTarget;
      var current_state = x$(button).attr("data-ur-state")[0];
      var new_state = current_state === "enabled" ? "disabled" : "enabled";
      x$(button).attr("data-ur-state", new_state);
      x$().iterate(contents, function(content) {
        var current_state = x$(content).attr("data-ur-state")[0];
        var new_state = current_state === "enabled" ? "disabled" : "enabled";
        x$(content).attr("data-ur-state", new_state)
      })
    }
  };
  ToggleLoader.prototype.initialize = function(fragment) {
    var togglers = this.find(fragment);
    for(name in togglers) {
      var toggler = togglers[name];
      x$(toggler["button"]).click(this.construct_button_callback(toggler["content"]));
      x$(toggler["set"]).attr("data-ur-state", "enabled")
    }
  };
  return ToggleLoader
}();
Ur.QuickLoaders["select-list"] = function() {
  function SelectList(select_element, list_element) {
    this.select = select_element;
    this.list = list_element;
    this.initialize()
  }
  SelectList.prototype.initialize = function() {
    x$(this.list).click(function(obj) {
      return function(evt) {
        obj.trigger_option(evt)
      }
    }(this))
  };
  SelectList.prototype.trigger_option = function(event) {
    var selected_list_option = event.target;
    var value = "";
    var self = this;
    x$().iterate(this.list.children, function(element, index) {
      if(element == selected_list_option) {
        x$(element).attr("data-ur-state", "enabled");
        value = x$(element).attr("value")
      }else {
        x$(element).attr("data-ur-state", "disabled")
      }
    });
    this.select.value = value;
    return true
  };
  function SelectListLoader() {
    this.SelectLists = {}
  }
  SelectListLoader.prototype.initialize = function(fragment) {
    var select_lists = x$(fragment).find_elements("select-list");
    var self = this;
    for(name in select_lists) {
      var select_list = select_lists[name];
      self.SelectLists[name] = new SelectList(select_lists[name]["select"], select_lists[name]["content"]);
      x$(select_list["set"]).attr("data-ur-state", "enabled")
    }
  };
  return SelectListLoader
}();
Ur.QuickLoaders["select-buttons"] = function() {
  function SelectButtons(components) {
    this.select = components["select"];
    this.increment = components["increment"];
    this.decrement = components["decrement"];
    this.initialize()
  }
  SelectButtons.prototype.initialize = function() {
    x$(this.increment).click(function(obj) {
      return function(evt) {
        obj.trigger_option(evt, 1)
      }
    }(this));
    x$(this.decrement).click(function(obj) {
      return function(evt) {
        obj.trigger_option(evt, -1)
      }
    }(this))
  };
  SelectButtons.prototype.trigger_option = function(event, direction) {
    var button = event.currentTarget;
    if(x$(button).attr("data-ur-state")[0] === "disabled") {
      return false
    }
    var current_option = {};
    var value = this.select.value;
    var newValue = {"prev":null, "next":null};
    x$().iterate(this.select.children, function(option, index) {
      if(x$(option).attr("value")[0] == value) {
        current_option = {"element":option, "index":index}
      }
      if(typeof current_option["index"] == "undefined") {
        newValue["prev"] = x$(option).attr("value")[0]
      }
      if(index == current_option["index"] + 1) {
        newValue["next"] = x$(option).attr("value")[0]
      }
    });
    var child_count = this.select.children.length;
    var new_index = current_option["index"] + direction;
    if(new_index == 0) {
      x$(this.decrement).attr("data-ur-state", "disabled")
    }else {
      x$(this.decrement).attr("data-ur-state", "enabled")
    }
    if(new_index == child_count - 1) {
      x$(this.increment).attr("data-ur-state", "disabled")
    }else {
      x$(this.increment).attr("data-ur-state", "enabled")
    }
    if(new_index < 0 || new_index == child_count) {
      return false
    }
    direction = direction == 1 ? "next" : "prev";
    this.select.value = newValue[direction];
    return true
  };
  function SelectButtonsLoader() {
  }
  SelectButtonsLoader.prototype.initialize = function(fragment) {
    var select_buttons = x$(fragment).find_elements("select-buttons");
    for(name in select_buttons) {
      new SelectButtons(select_buttons[name]);
      x$(select_buttons[name]["set"]).attr("data-ur-state", "enabled")
    }
  };
  return SelectButtonsLoader
}();
Ur.QuickLoaders["zoom-preview"] = function() {
  function ZoomPreview(data) {
    this.elements = data["elements"];
    this.modifier = {};
    if(data["modifier"] !== null) {
      this.modifier = data["modifier"]
    }
    this.dimensions = {};
    this.zoom = false;
    this.update();
    this.events = {"start":"touchstart", "move":"touchmove", "end":"touchend"};
    this.touch = xui.touch;
    if(!this.touch) {
      this.events = {"move":"mousemove", "end":"mouseout"}
    }
    this.initialize();
    console.log("Zoom Preview Loaded")
  }
  ZoomPreview.prototype.rewrite_images = function(src, match, replace) {
    if(typeof src == "undefined") {
      return false
    }
    if(match === undefined && replace === undefined) {
      match = this.modifier["zoom_image"]["match"];
      replace = this.modifier["zoom_image"]["replace"]
    }
    this.elements["zoom_image"].src = src.replace(match, replace);
    match = replace = null;
    if(this.modifier["button"]) {
      match = this.modifier["button"]["match"];
      replace = this.modifier["button"]["replace"]
    }
    if(match && replace) {
      this.elements["button"].src = this.elements["zoom_image"].src.replace(match, replace)
    }else {
      this.elements["button"].src = this.elements["zoom_image"].src
    }
    var self = this;
    this.elements["zoom_image"].style.visibility = "hidden";
    x$(this.elements["zoom_image"]).on("load", function() {
      self.update()
    });
    x$(this.elements["button"]).on("load", function() {
      x$(self.elements["button"]).addClass("loaded")
    })
  };
  ZoomPreview.prototype.update = function() {
    var self = this;
    x$().iterate(["button", "zoom_image", "container"], function(elem) {
      self.dimensions[elem] = [self.elements[elem].offsetWidth, self.elements[elem].offsetHeight]
    });
    var offset = x$(this.elements["button"]).offset();
    var button_offset = [offset["left"], offset["top"]];
    this.button_center = [this.dimensions["button"][0] / 2 + button_offset[0], this.dimensions["button"][1] / 2 + button_offset[1]];
    this.image_origin = [-1 / 2 * this.dimensions["zoom_image"][0], -1 / 2 * this.dimensions["zoom_image"][1]]
  };
  ZoomPreview.prototype.get_event_coordinates = function(event) {
    if(!this.touch) {
      return[event.pageX, event.pageY]
    }else {
      if(event.touches.length == 1) {
        return[event.touches[0].pageX, event.touches[0].pageY]
      }
    }
  };
  ZoomPreview.prototype.initialize = function() {
    x$(this.elements["button"]).on(this.events["move"], function(obj) {
      return function(evt) {
        obj.scroll_zoom(evt)
      }
    }(this));
    x$(this.elements["button"]).on(this.events["end"], function(obj) {
      return function(evt) {
        obj.scroll_end(evt)
      }
    }(this));
    if(this.events["start"]) {
      x$(this.elements["button"]).on("touchstart", function(obj) {
        return function(evt) {
          evt.preventDefault()
        }
      }(this))
    }
    var self = this;
    x$(this.elements["thumbnails"]).click(function(obj) {
      return function(evt) {
        if(evt.target.tagName != "IMG") {
          return false
        }
        obj.rewrite_images(evt.target.src)
      }
    }(self));
    this.normal_image_changed()
  };
  ZoomPreview.prototype.normal_image_changed = function(new_normal_image) {
    if(new_normal_image !== undefined) {
      this.elements["normal_image"] = new_normal_image
    }
    img = x$(this.elements["normal_image"]);
    this.rewrite_images(img.attr("src")[0], this.modifier["normal_image"]["match"], this.modifier["normal_image"]["replace"])
  };
  ZoomPreview.prototype.scroll_end = function(event) {
    this.elements["zoom_image"].style.visibility = "hidden"
  };
  ZoomPreview.prototype.scroll_zoom = function(event) {
    this.elements["zoom_image"].style.visibility = "visible";
    var position = this.get_event_coordinates(event);
    if(position === null) {
      return false
    }
    var percents = [(position[0] - this.button_center[0]) / this.dimensions["button"][0], (position[1] - this.button_center[1]) / this.dimensions["button"][1]];
    var delta = [this.dimensions["zoom_image"][0] * percents[0], this.dimensions["zoom_image"][1] * percents[1]];
    var translate = [this.image_origin[0] - delta[0], this.image_origin[1] - delta[1]];
    translate = this.check_bounds(translate);
    this.elements["zoom_image"].style.webkitTransform = "translate3d(" + translate[0] + "px," + translate[1] + "px,0px)"
  };
  ZoomPreview.prototype.check_bounds = function(translate) {
    var min = [this.dimensions["container"][0] - this.dimensions["zoom_image"][0], this.dimensions["container"][1] - this.dimensions["zoom_image"][1]];
    x$().iterate([0, 1], function(index) {
      if(translate[index] >= 0) {
        translate[index] = 0
      }
      if(translate[index] <= min[index]) {
        translate[index] = min[index]
      }
    });
    return translate
  };
  var ComponentConstructors = {"_modifiers":function(group, component, type, modifier_prefix) {
    if(group["modifier"] === undefined) {
      group["modifier"] = {}
    }
    var prefix = modifier_prefix === undefined ? "src" : "zoom";
    console.log("searching for modifier:", prefix, component);
    var match = x$(component).attr("data-ur-" + prefix + "-modifier-match")[0];
    var replace = x$(component).attr("data-ur-" + prefix + "-modifier-replace")[0];
    if(typeof match != "undefined" && typeof replace != "undefined") {
      console.log("found modifiers:", match, replace);
      group["modifier"][type] = {"match":new RegExp(match), "replace":replace}
    }
  }, "_construct":function(group, component, type, modifier_prefix) {
    if(group["elements"] === undefined) {
      group["elements"] = {}
    }
    group["elements"][type] = component;
    this._modifiers(group, component, type, modifier_prefix)
  }, "normal_image":function(group, component, type) {
    this._construct(group, component, type, "zoom")
  }, "zoom_image":function(group, component, type) {
    this._construct(group, component, type)
  }, "button":function(group, component, type) {
    this._construct(group, component, type)
  }, "container":function(group, component, type) {
    this._construct(group, component, type)
  }, "thumbnails":function(group, component, type) {
    this._construct(group, component, type)
  }};
  function ZoomPreviewLoader() {
  }
  ZoomPreviewLoader.prototype.initialize = function(fragment) {
    this.zoom_previews = x$(fragment).find_elements("zoom-preview", ComponentConstructors);
    Ur.Widgets["zoom-preview"] = {};
    for(name in this.zoom_previews) {
      Ur.Widgets["zoom-preview"][name] = new ZoomPreview(this.zoom_previews[name]);
      x$(this.zoom_previews[name]["set"]).attr("data-ur-state", "enabled")
    }
  };
  return ZoomPreviewLoader
}();
Ur.WindowLoaders["carousel"] = function() {
  function Carousel(components) {
    this.container = components["view_container"];
    this.items = components["scroll_container"];
    if(this.items.length == 0) {
      console.log("Error -- carousel missing item components");
      return false
    }
    this.button = components["button"] === undefined ? {} : components["button"];
    this.count = components["count"];
    this.multi = x$(components["view_container"]).attr("data-ur-type")[0] == "multi";
    this.initialize();
    this.onSlideCallbacks = []
  }
  function get_real_width(elem) {
    elem = x$(elem);
    var total = 0;
    var styles = ["width", "padding-left", "padding-right", "margin-left", "margin-right", "border-left-width", "border-right-width"];
    x$().iterate(styles, function(style) {
      total += parseInt(elem.getStyle(style))
    });
    return total
  }
  function sign(v) {
    return v >= 0 ? 1 : -1
  }
  function zero_ceil(num) {
    return num <= 0 ? Math.floor(num) : Math.ceil(num)
  }
  function zero_floor(num) {
    return num >= 0 ? Math.floor(num) : Math.ceil(num)
  }
  function stifle(e) {
    e.preventDefault();
    e.stopPropagation()
  }
  function translate(obj, x) {
    obj.style.webkitTransform = "translate3d(" + x + "px, 0px, 0px)"
  }
  Carousel.prototype = {initialize:function() {
    var touch_enabled = x$(this.container).attr("data-ur-touch")[0];
    touch_enabled = touch_enabled === undefined ? true : touch_enabled == "enabled" ? true : false;
    x$(this.container).attr("data-ur-touch", touch_enabled ? "enabled" : "disabled");
    if(touch_enabled) {
      if(xui.touch) {
        this.touch = true;
        x$(this.items).on("touchstart", function(obj) {
          return function(e) {
            obj.start_swipe(e)
          }
        }(this));
        x$(this.items).on("touchmove", function(obj) {
          return function(e) {
            obj.continue_swipe(e)
          }
        }(this));
        x$(this.items).on("touchend", function(obj) {
          return function(e) {
            obj.finish_swipe(e)
          }
        }(this))
      }else {
        this.touch = false;
        x$(this.items).on("mousedown", function(obj) {
          return function(e) {
            obj.start_swipe(e)
          }
        }(this));
        x$(this.items).on("mousemove", function(obj) {
          return function(e) {
            obj.continue_swipe(e)
          }
        }(this));
        x$(this.items).on("mouseup", function(obj) {
          return function(e) {
            obj.finish_swipe(e)
          }
        }(this))
      }
    }
    x$(this.button["prev"]).on("click", function(obj) {
      return function() {
        obj.move_to(obj.magazine_count)
      }
    }(this));
    x$(this.button["next"]).on("click", function(obj) {
      return function() {
        obj.move_to(-obj.magazine_count)
      }
    }(this));
    this.item_index = 0;
    this.magazine_count = 1;
    this.adjust_spacing();
    this.update_index(0);
    this.jump_to_index = function(obj) {
      return function(idx) {
        obj.__proto__.move_to_index.call(obj, idx)
      }
    }(this);
    window.setInterval(function(obj) {
      return function() {
        obj.resize()
      }
    }(this), 1E3)
  }, get_transform:function(obj) {
    var transform = window.getComputedStyle(obj).webkitTransform;
    if(transform != "none") {
      transform = new WebKitCSSMatrix(transform);
      return transform.m41
    }else {
      console.log("no webkit transform");
      return 0
    }
  }, resize:function() {
    if(this.snap_width != this.container.offsetWidth) {
      this.adjust_spacing()
    }
  }, adjust_spacing:function() {
    var visible_width = this.container.offsetWidth;
    if(this.old_width !== undefined && this.old_width == visible_width) {
      return
    }
    this.old_width = visible_width;
    var cumulative_offset = 0;
    var items = x$(this.items).find("[data-ur-carousel-component='item']");
    this.item_count = items.length;
    var total_width = 0;
    x$().iterate(items, function(item) {
      total_width += get_real_width(item)
    });
    this.items.style.width = total_width + "px";
    this.snap_width = visible_width;
    if(this.multi) {
      var item_width = get_real_width(items[0]);
      var magazine_count = Math.floor(visible_width / item_width);
      magazine_count = magazine_count > this.item_count ? this.item_count : magazine_count;
      this.magazine_count = magazine_count;
      var space = visible_width - magazine_count * item_width;
      this.snap_width = space / (magazine_count - 1) + item_width;
      this.last_index = this.item_count - this.magazine_count
    }else {
      this.last_index = this.item_count - 1
    }
    this.item_index = this.last_index < this.item_index ? this.last_index : this.item_index;
    cumulative_offset -= this.snap_width * this.item_index;
    translate(this.items, cumulative_offset);
    var cumulative_item_offset = 0;
    if(this.multi) {
      x$().iterate(items, function(item, i) {
        var offset = cumulative_item_offset;
        if(i != 0) {
          offset += space / (magazine_count - 1)
        }
        translate(item, offset);
        cumulative_item_offset = offset
      });
      this.update_index(this.item_index)
    }else {
      x$().iterate(items, function(item, i) {
        var offset = cumulative_item_offset;
        if(i != 0) {
          offset += visible_width - items[i - 1].offsetWidth
        }
        translate(item, offset);
        cumulative_item_offset = offset
      })
    }
  }, get_event_coordinates:function(e) {
    if(this.touch) {
      if(e.touches.length == 1) {
        return{x:e.touches[0].clientX, y:e.touches[0].clientY}
      }
    }else {
      return{x:e.clientX, y:e.clientY}
    }
    return null
  }, update_buttons:function() {
    if(this.item_index == 0) {
      x$(this.button["prev"]).attr("data-ur-state", "disabled");
      x$(this.button["next"]).attr("data-ur-state", "enabled")
    }else {
      if(this.item_index == this.last_index) {
        x$(this.button["next"]).attr("data-ur-state", "disabled");
        x$(this.button["prev"]).attr("data-ur-state", "enabled")
      }else {
        x$(this.button["next"]).attr("data-ur-state", "enabled");
        x$(this.button["prev"]).attr("data-ur-state", "enabled")
      }
    }
  }, update_index:function(new_index) {
    if(new_index === undefined) {
      return
    }
    this.item_index = new_index;
    if(this.item_index < 0) {
      this.item_index = 0
    }else {
      if(this.item_index > this.last_index) {
        this.item_index = this.last_index - 1
      }
    }
    if(this.count !== undefined) {
      if(this.multi) {
        this.count.innerHTML = this.item_index + 1 + " to " + (this.item_index + this.magazine_count) + " of " + this.item_count
      }else {
        this.count.innerHTML = this.item_index + 1 + " of " + this.item_count
      }
    }
    var active_item = x$(this.items).find("*[data-ur-carousel-component='item'][data-ur-state='active']");
    active_item.attr("data-ur-state", "inactive");
    var new_active_item = x$(this.items).find("*[data-ur-carousel-component='item']")[this.item_index];
    x$(new_active_item).attr("data-ur-state", "active");
    this.update_buttons()
  }, start_swipe:function(e) {
    if(this.increment_flag) {
      return false
    }
    this.touch_in_progress = true;
    var coords = this.get_event_coordinates(e);
    if(coords !== null) {
      this.start_pos = coords;
      var x_transform = this.get_transform(this.items);
      this.starting_offset = x_transform
    }
    this.click = true
  }, continue_swipe:function(e) {
    stifle(e);
    if(!this.touch_in_progress) {
      return
    }
    var coords = this.get_event_coordinates(e);
    if(coords !== null) {
      this.end_pos = coords;
      var dist = this.swipe_dist() + this.starting_offset;
      translate(this.items, dist)
    }
    this.click = false
  }, finish_swipe:function(e) {
    if(!this.click) {
      stifle(e)
    }
    this.touch_in_progress = false;
    if(!this.touch || e.touches.length == 0) {
      var swipe_distance = this.swipe_dist();
      var displacement = 0;
      var displacement_index = 0;
      if(this.multi) {
        var range = this.magazine_count;
        var range_offset = range / 2;
        displacement_index = zero_ceil(1 / (1 + Math.pow(Math.E, -1 * swipe_distance)) * range - range_offset)
      }else {
        displacement_index = zero_ceil(swipe_distance / this.snap_width)
      }
      this.move_helper(displacement_index)
    }
  }, snap_to:function(displacement) {
    this.destination_offset = displacement + this.starting_offset;
    var max_offset = -1 * this.last_index * this.snap_width;
    if(this.destination_offset < max_offset || this.destination_offset > 0) {
      if(Math.abs(this.destination_offset - max_offset) < 1) {
        this.destination_offset = max_offset
      }else {
        this.destination_offset = this.starting_offset
      }
    }
    this.momentum()
  }, move_to:function(direction) {
    this.starting_offset = this.get_transform(this.items);
    var new_idx = this.item_index - direction;
    this.move_helper(direction)
  }, move_helper:function(direction) {
    var new_idx = this.item_index - direction;
    if(new_idx > this.last_index) {
      new_idx = this.last_index
    }else {
      if(new_idx < 0) {
        new_idx = 0
      }
    }
    var new_item = x$(this.items).find("*[data-ur-carousel-component='item']")[new_idx];
    var current_item = x$(this.items).find("*[data-ur-carousel-component='item']")[this.item_index];
    var offset = this.get_transform(current_item) - this.get_transform(new_item);
    var displacement = current_item.offsetLeft - new_item.offsetLeft + offset;
    this.snap_to(displacement);
    this.update_index(new_idx)
  }, move_to_index:function(index) {
    var direction = this.item_index - index;
    this.move_to(direction)
  }, momentum:function() {
    if(this.touch_in_progress) {
      return
    }
    this.increment_flag = false;
    var x_transform = this.get_transform(this.items);
    var distance = this.destination_offset - x_transform;
    var increment = distance - zero_floor(distance / 1.1);
    if(Math.abs(increment) < 0.01) {
      increment = 0
    }
    translate(this.items, increment + x_transform);
    if(increment != 0) {
      this.increment_flag = true
    }
    if(this.increment_flag) {
      setTimeout(function(obj) {
        return function() {
          obj.momentum()
        }
      }(this), 16)
    }else {
      x$().iterate(this.onSlideCallbacks, function(callback) {
        callback()
      })
    }
  }, swipe_dist:function() {
    if(this.end_pos === undefined) {
      return 0
    }
    var sw_dist = this.end_pos["x"] - this.start_pos["x"];
    return sw_dist
  }};
  var ComponentConstructors = {"button":function(group, component, type) {
    if(group["button"] === undefined) {
      group["button"] = {}
    }
    var type = x$(component).attr("data-ur-carousel-button-type")[0];
    if(type === undefined) {
      console.log("Uranium declaration error: Malformed carousel button type on:" + component.outerHTML)
    }
    group["button"][type] = component;
    if(type == "prev") {
      x$(component).attr("data-ur-state", "disabled")
    }else {
      x$(component).attr("data-ur-state", "enabled")
    }
  }};
  function CarouselLoader() {
  }
  CarouselLoader.prototype.initialize = function(fragment) {
    var carousels = x$(fragment).find_elements("carousel", ComponentConstructors);
    Ur.Widgets["carousel"] = {};
    for(name in carousels) {
      var carousel = carousels[name];
      Ur.Widgets["carousel"][name] = new Carousel(carousel);
      x$(carousel["set"]).attr("data-ur-state", "enabled")
    }
  };
  return CarouselLoader
}();

