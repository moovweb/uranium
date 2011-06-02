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
  })("emile", this);
  (function() {
    var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g, done = 0, toString = Object.prototype.toString, hasDuplicate = false, baseHasDuplicate = true;
    [0, 0].sort(function() {
      baseHasDuplicate = false;
      return 0
    });
    var Sizzle = function(selector, context, results, seed) {
      results = results || [];
      context = context || document;
      var origContext = context;
      if(context.nodeType !== 1 && context.nodeType !== 9) {
        return[]
      }
      if(!selector || typeof selector !== "string") {
        return results
      }
      var parts = [], m, set, checkSet, extra, prune = true, contextXML = Sizzle.isXML(context), soFar = selector, ret, cur, pop, i;
      do {
        chunker.exec("");
        m = chunker.exec(soFar);
        if(m) {
          soFar = m[3];
          parts.push(m[1]);
          if(m[2]) {
            extra = m[3];
            break
          }
        }
      }while(m);
      if(parts.length > 1 && origPOS.exec(selector)) {
        if(parts.length === 2 && Expr.relative[parts[0]]) {
          set = posProcess(parts[0] + parts[1], context)
        }else {
          set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);
          while(parts.length) {
            selector = parts.shift();
            if(Expr.relative[selector]) {
              selector += parts.shift()
            }
            set = posProcess(selector, set)
          }
        }
      }else {
        if(!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {
          ret = Sizzle.find(parts.shift(), context, contextXML);
          context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0]
        }
        if(context) {
          ret = seed ? {expr:parts.pop(), set:makeArray(seed)} : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
          set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
          if(parts.length > 0) {
            checkSet = makeArray(set)
          }else {
            prune = false
          }
          while(parts.length) {
            cur = parts.pop();
            pop = cur;
            if(!Expr.relative[cur]) {
              cur = ""
            }else {
              pop = parts.pop()
            }
            if(pop == null) {
              pop = context
            }
            Expr.relative[cur](checkSet, pop, contextXML)
          }
        }else {
          checkSet = parts = []
        }
      }
      if(!checkSet) {
        checkSet = set
      }
      if(!checkSet) {
        Sizzle.error(cur || selector)
      }
      if(toString.call(checkSet) === "[object Array]") {
        if(!prune) {
          results.push.apply(results, checkSet)
        }else {
          if(context && context.nodeType === 1) {
            for(i = 0;checkSet[i] != null;i++) {
              if(checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
                results.push(set[i])
              }
            }
          }else {
            for(i = 0;checkSet[i] != null;i++) {
              if(checkSet[i] && checkSet[i].nodeType === 1) {
                results.push(set[i])
              }
            }
          }
        }
      }else {
        makeArray(checkSet, results)
      }
      if(extra) {
        Sizzle(extra, origContext, results, seed);
        Sizzle.uniqueSort(results)
      }
      return results
    };
    Sizzle.uniqueSort = function(results) {
      if(sortOrder) {
        hasDuplicate = baseHasDuplicate;
        results.sort(sortOrder);
        if(hasDuplicate) {
          for(var i = 1;i < results.length;i++) {
            if(results[i] === results[i - 1]) {
              results.splice(i--, 1)
            }
          }
        }
      }
      return results
    };
    Sizzle.matches = function(expr, set) {
      return Sizzle(expr, null, null, set)
    };
    Sizzle.find = function(expr, context, isXML) {
      var set;
      if(!expr) {
        return[]
      }
      for(var i = 0, l = Expr.order.length;i < l;i++) {
        var type = Expr.order[i], match;
        if(match = Expr.leftMatch[type].exec(expr)) {
          var left = match[1];
          match.splice(1, 1);
          if(left.substr(left.length - 1) !== "\\") {
            match[1] = (match[1] || "").replace(/\\/g, "");
            set = Expr.find[type](match, context, isXML);
            if(set != null) {
              expr = expr.replace(Expr.match[type], "");
              break
            }
          }
        }
      }
      if(!set) {
        set = context.getElementsByTagName("*")
      }
      return{set:set, expr:expr}
    };
    Sizzle.filter = function(expr, set, inplace, not) {
      var old = expr, result = [], curLoop = set, match, anyFound, isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);
      while(expr && set.length) {
        for(var type in Expr.filter) {
          if((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
            var filter = Expr.filter[type], found, item, left = match[1];
            anyFound = false;
            match.splice(1, 1);
            if(left.substr(left.length - 1) === "\\") {
              continue
            }
            if(curLoop === result) {
              result = []
            }
            if(Expr.preFilter[type]) {
              match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
              if(!match) {
                anyFound = found = true
              }else {
                if(match === true) {
                  continue
                }
              }
            }
            if(match) {
              for(var i = 0;(item = curLoop[i]) != null;i++) {
                if(item) {
                  found = filter(item, match, i, curLoop);
                  var pass = not ^ !!found;
                  if(inplace && found != null) {
                    if(pass) {
                      anyFound = true
                    }else {
                      curLoop[i] = false
                    }
                  }else {
                    if(pass) {
                      result.push(item);
                      anyFound = true
                    }
                  }
                }
              }
            }
            if(found !== undefined) {
              if(!inplace) {
                curLoop = result
              }
              expr = expr.replace(Expr.match[type], "");
              if(!anyFound) {
                return[]
              }
              break
            }
          }
        }
        if(expr === old) {
          if(anyFound == null) {
            Sizzle.error(expr)
          }else {
            break
          }
        }
        old = expr
      }
      return curLoop
    };
    Sizzle.error = function(msg) {
      throw"Syntax error, unrecognized expression: " + msg;
    };
    var Expr = Sizzle.selectors = {order:["ID", "NAME", "TAG"], match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/, CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/, NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/, ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/, TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/, CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/, POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/, PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/}, 
    leftMatch:{}, attrMap:{"class":"className", "for":"htmlFor"}, attrHandle:{href:function(elem) {
      return elem.getAttribute("href")
    }}, relative:{"+":function(checkSet, part) {
      var isPartStr = typeof part === "string", isTag = isPartStr && !/\W/.test(part), isPartStrNotTag = isPartStr && !isTag;
      if(isTag) {
        part = part.toLowerCase()
      }
      for(var i = 0, l = checkSet.length, elem;i < l;i++) {
        if(elem = checkSet[i]) {
          while((elem = elem.previousSibling) && elem.nodeType !== 1) {
          }
          checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part
        }
      }
      if(isPartStrNotTag) {
        Sizzle.filter(part, checkSet, true)
      }
    }, ">":function(checkSet, part) {
      var isPartStr = typeof part === "string", elem, i = 0, l = checkSet.length;
      if(isPartStr && !/\W/.test(part)) {
        part = part.toLowerCase();
        for(;i < l;i++) {
          elem = checkSet[i];
          if(elem) {
            var parent = elem.parentNode;
            checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false
          }
        }
      }else {
        for(;i < l;i++) {
          elem = checkSet[i];
          if(elem) {
            checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part
          }
        }
        if(isPartStr) {
          Sizzle.filter(part, checkSet, true)
        }
      }
    }, "":function(checkSet, part, isXML) {
      var doneName = done++, checkFn = dirCheck, nodeCheck;
      if(typeof part === "string" && !/\W/.test(part)) {
        part = part.toLowerCase();
        nodeCheck = part;
        checkFn = dirNodeCheck
      }
      checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML)
    }, "~":function(checkSet, part, isXML) {
      var doneName = done++, checkFn = dirCheck, nodeCheck;
      if(typeof part === "string" && !/\W/.test(part)) {
        part = part.toLowerCase();
        nodeCheck = part;
        checkFn = dirNodeCheck
      }
      checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML)
    }}, find:{ID:function(match, context, isXML) {
      if(typeof context.getElementById !== "undefined" && !isXML) {
        var m = context.getElementById(match[1]);
        return m ? [m] : []
      }
    }, NAME:function(match, context) {
      if(typeof context.getElementsByName !== "undefined") {
        var ret = [], results = context.getElementsByName(match[1]);
        for(var i = 0, l = results.length;i < l;i++) {
          if(results[i].getAttribute("name") === match[1]) {
            ret.push(results[i])
          }
        }
        return ret.length === 0 ? null : ret
      }
    }, TAG:function(match, context) {
      return context.getElementsByTagName(match[1])
    }}, preFilter:{CLASS:function(match, curLoop, inplace, result, not, isXML) {
      match = " " + match[1].replace(/\\/g, "") + " ";
      if(isXML) {
        return match
      }
      for(var i = 0, elem;(elem = curLoop[i]) != null;i++) {
        if(elem) {
          if(not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0)) {
            if(!inplace) {
              result.push(elem)
            }
          }else {
            if(inplace) {
              curLoop[i] = false
            }
          }
        }
      }
      return false
    }, ID:function(match) {
      return match[1].replace(/\\/g, "")
    }, TAG:function(match, curLoop) {
      return match[1].toLowerCase()
    }, CHILD:function(match) {
      if(match[1] === "nth") {
        var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
        match[2] = test[1] + (test[2] || 1) - 0;
        match[3] = test[3] - 0
      }
      match[0] = done++;
      return match
    }, ATTR:function(match, curLoop, inplace, result, not, isXML) {
      var name = match[1].replace(/\\/g, "");
      if(!isXML && Expr.attrMap[name]) {
        match[1] = Expr.attrMap[name]
      }
      if(match[2] === "~=") {
        match[4] = " " + match[4] + " "
      }
      return match
    }, PSEUDO:function(match, curLoop, inplace, result, not) {
      if(match[1] === "not") {
        if((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
          match[3] = Sizzle(match[3], null, null, curLoop)
        }else {
          var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
          if(!inplace) {
            result.push.apply(result, ret)
          }
          return false
        }
      }else {
        if(Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
          return true
        }
      }
      return match
    }, POS:function(match) {
      match.unshift(true);
      return match
    }}, filters:{enabled:function(elem) {
      return elem.disabled === false && elem.type !== "hidden"
    }, disabled:function(elem) {
      return elem.disabled === true
    }, checked:function(elem) {
      return elem.checked === true
    }, selected:function(elem) {
      elem.parentNode.selectedIndex;
      return elem.selected === true
    }, parent:function(elem) {
      return!!elem.firstChild
    }, empty:function(elem) {
      return!elem.firstChild
    }, has:function(elem, i, match) {
      return!!Sizzle(match[3], elem).length
    }, header:function(elem) {
      return/h\d/i.test(elem.nodeName)
    }, text:function(elem) {
      return"text" === elem.type
    }, radio:function(elem) {
      return"radio" === elem.type
    }, checkbox:function(elem) {
      return"checkbox" === elem.type
    }, file:function(elem) {
      return"file" === elem.type
    }, password:function(elem) {
      return"password" === elem.type
    }, submit:function(elem) {
      return"submit" === elem.type
    }, image:function(elem) {
      return"image" === elem.type
    }, reset:function(elem) {
      return"reset" === elem.type
    }, button:function(elem) {
      return"button" === elem.type || elem.nodeName.toLowerCase() === "button"
    }, input:function(elem) {
      return/input|select|textarea|button/i.test(elem.nodeName)
    }}, setFilters:{first:function(elem, i) {
      return i === 0
    }, last:function(elem, i, match, array) {
      return i === array.length - 1
    }, even:function(elem, i) {
      return i % 2 === 0
    }, odd:function(elem, i) {
      return i % 2 === 1
    }, lt:function(elem, i, match) {
      return i < match[3] - 0
    }, gt:function(elem, i, match) {
      return i > match[3] - 0
    }, nth:function(elem, i, match) {
      return match[3] - 0 === i
    }, eq:function(elem, i, match) {
      return match[3] - 0 === i
    }}, filter:{PSEUDO:function(elem, match, i, array) {
      var name = match[1], filter = Expr.filters[name];
      if(filter) {
        return filter(elem, i, match, array)
      }else {
        if(name === "contains") {
          return(elem.textContent || elem.innerText || Sizzle.getText([elem]) || "").indexOf(match[3]) >= 0
        }else {
          if(name === "not") {
            var not = match[3];
            for(var j = 0, l = not.length;j < l;j++) {
              if(not[j] === elem) {
                return false
              }
            }
            return true
          }else {
            Sizzle.error("Syntax error, unrecognized expression: " + name)
          }
        }
      }
    }, CHILD:function(elem, match) {
      var type = match[1], node = elem;
      switch(type) {
        case "only":
        ;
        case "first":
          while(node = node.previousSibling) {
            if(node.nodeType === 1) {
              return false
            }
          }
          if(type === "first") {
            return true
          }
          node = elem;
        case "last":
          while(node = node.nextSibling) {
            if(node.nodeType === 1) {
              return false
            }
          }
          return true;
        case "nth":
          var first = match[2], last = match[3];
          if(first === 1 && last === 0) {
            return true
          }
          var doneName = match[0], parent = elem.parentNode;
          if(parent && (parent.sizcache !== doneName || !elem.nodeIndex)) {
            var count = 0;
            for(node = parent.firstChild;node;node = node.nextSibling) {
              if(node.nodeType === 1) {
                node.nodeIndex = ++count
              }
            }
            parent.sizcache = doneName
          }
          var diff = elem.nodeIndex - last;
          if(first === 0) {
            return diff === 0
          }else {
            return diff % first === 0 && diff / first >= 0
          }
      }
    }, ID:function(elem, match) {
      return elem.nodeType === 1 && elem.getAttribute("id") === match
    }, TAG:function(elem, match) {
      return match === "*" && elem.nodeType === 1 || elem.nodeName.toLowerCase() === match
    }, CLASS:function(elem, match) {
      return(" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1
    }, ATTR:function(elem, match) {
      var name = match[1], result = Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name), value = result + "", type = match[2], check = match[4];
      return result == null ? type === "!=" : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value !== check : type === "^=" ? value.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false
    }, POS:function(elem, match, i, array) {
      var name = match[2], filter = Expr.setFilters[name];
      if(filter) {
        return filter(elem, i, match, array)
      }
    }}};
    var origPOS = Expr.match.POS, fescape = function(all, num) {
      return"\\" + (num - 0 + 1)
    };
    for(var type in Expr.match) {
      Expr.match[type] = new RegExp(Expr.match[type].source + /(?![^\[]*\])(?![^\(]*\))/.source);
      Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape))
    }
    var makeArray = function(array, results) {
      array = Array.prototype.slice.call(array, 0);
      if(results) {
        results.push.apply(results, array);
        return results
      }
      return array
    };
    try {
      Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType
    }catch(e) {
      makeArray = function(array, results) {
        var ret = results || [], i = 0;
        if(toString.call(array) === "[object Array]") {
          Array.prototype.push.apply(ret, array)
        }else {
          if(typeof array.length === "number") {
            for(var l = array.length;i < l;i++) {
              ret.push(array[i])
            }
          }else {
            for(;array[i];i++) {
              ret.push(array[i])
            }
          }
        }
        return ret
      }
    }
    var sortOrder;
    if(document.documentElement.compareDocumentPosition) {
      sortOrder = function(a, b) {
        if(!a.compareDocumentPosition || !b.compareDocumentPosition) {
          if(a == b) {
            hasDuplicate = true
          }
          return a.compareDocumentPosition ? -1 : 1
        }
        var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
        if(ret === 0) {
          hasDuplicate = true
        }
        return ret
      }
    }else {
      if("sourceIndex" in document.documentElement) {
        sortOrder = function(a, b) {
          if(!a.sourceIndex || !b.sourceIndex) {
            if(a == b) {
              hasDuplicate = true
            }
            return a.sourceIndex ? -1 : 1
          }
          var ret = a.sourceIndex - b.sourceIndex;
          if(ret === 0) {
            hasDuplicate = true
          }
          return ret
        }
      }else {
        if(document.createRange) {
          sortOrder = function(a, b) {
            if(!a.ownerDocument || !b.ownerDocument) {
              if(a == b) {
                hasDuplicate = true
              }
              return a.ownerDocument ? -1 : 1
            }
            var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
            aRange.setStart(a, 0);
            aRange.setEnd(a, 0);
            bRange.setStart(b, 0);
            bRange.setEnd(b, 0);
            var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
            if(ret === 0) {
              hasDuplicate = true
            }
            return ret
          }
        }
      }
    }
    Sizzle.getText = function(elems) {
      var ret = "", elem;
      for(var i = 0;elems[i];i++) {
        elem = elems[i];
        if(elem.nodeType === 3 || elem.nodeType === 4) {
          ret += elem.nodeValue
        }else {
          if(elem.nodeType !== 8) {
            ret += Sizzle.getText(elem.childNodes)
          }
        }
      }
      return ret
    };
    (function() {
      var form = document.createElement("div"), id = "script" + (new Date).getTime();
      form.innerHTML = "<a name='" + id + "'/>";
      var root = document.documentElement;
      root.insertBefore(form, root.firstChild);
      if(document.getElementById(id)) {
        Expr.find.ID = function(match, context, isXML) {
          if(typeof context.getElementById !== "undefined" && !isXML) {
            var m = context.getElementById(match[1]);
            return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : []
          }
        };
        Expr.filter.ID = function(elem, match) {
          var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
          return elem.nodeType === 1 && node && node.nodeValue === match
        }
      }
      root.removeChild(form);
      root = form = null
    })();
    (function() {
      var div = document.createElement("div");
      div.appendChild(document.createComment(""));
      if(div.getElementsByTagName("*").length > 0) {
        Expr.find.TAG = function(match, context) {
          var results = context.getElementsByTagName(match[1]);
          if(match[1] === "*") {
            var tmp = [];
            for(var i = 0;results[i];i++) {
              if(results[i].nodeType === 1) {
                tmp.push(results[i])
              }
            }
            results = tmp
          }
          return results
        }
      }
      div.innerHTML = "<a href='#'></a>";
      if(div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#") {
        Expr.attrHandle.href = function(elem) {
          return elem.getAttribute("href", 2)
        }
      }
      div = null
    })();
    if(document.querySelectorAll) {
      (function() {
        var oldSizzle = Sizzle, div = document.createElement("div");
        div.innerHTML = "<p class='TEST'></p>";
        if(div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
          return
        }
        Sizzle = function(query, context, extra, seed) {
          context = context || document;
          if(!seed && context.nodeType === 9 && !Sizzle.isXML(context)) {
            try {
              return makeArray(context.querySelectorAll(query), extra)
            }catch(e) {
            }
          }
          return oldSizzle(query, context, extra, seed)
        };
        for(var prop in oldSizzle) {
          Sizzle[prop] = oldSizzle[prop]
        }
        div = null
      })()
    }
    (function() {
      var div = document.createElement("div");
      div.innerHTML = "<div class='test e'></div><div class='test'></div>";
      if(!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
        return
      }
      div.lastChild.className = "e";
      if(div.getElementsByClassName("e").length === 1) {
        return
      }
      Expr.order.splice(1, 0, "CLASS");
      Expr.find.CLASS = function(match, context, isXML) {
        if(typeof context.getElementsByClassName !== "undefined" && !isXML) {
          return context.getElementsByClassName(match[1])
        }
      };
      div = null
    })();
    function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
      for(var i = 0, l = checkSet.length;i < l;i++) {
        var elem = checkSet[i];
        if(elem) {
          elem = elem[dir];
          var match = false;
          while(elem) {
            if(elem.sizcache === doneName) {
              match = checkSet[elem.sizset];
              break
            }
            if(elem.nodeType === 1 && !isXML) {
              elem.sizcache = doneName;
              elem.sizset = i
            }
            if(elem.nodeName.toLowerCase() === cur) {
              match = elem;
              break
            }
            elem = elem[dir]
          }
          checkSet[i] = match
        }
      }
    }
    function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
      for(var i = 0, l = checkSet.length;i < l;i++) {
        var elem = checkSet[i];
        if(elem) {
          elem = elem[dir];
          var match = false;
          while(elem) {
            if(elem.sizcache === doneName) {
              match = checkSet[elem.sizset];
              break
            }
            if(elem.nodeType === 1) {
              if(!isXML) {
                elem.sizcache = doneName;
                elem.sizset = i
              }
              if(typeof cur !== "string") {
                if(elem === cur) {
                  match = true;
                  break
                }
              }else {
                if(Sizzle.filter(cur, [elem]).length > 0) {
                  match = elem;
                  break
                }
              }
            }
            elem = elem[dir]
          }
          checkSet[i] = match
        }
      }
    }
    Sizzle.contains = document.compareDocumentPosition ? function(a, b) {
      return!!(a.compareDocumentPosition(b) & 16)
    } : function(a, b) {
      return a !== b && (a.contains ? a.contains(b) : true)
    };
    Sizzle.isXML = function(elem) {
      var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
      return documentElement ? documentElement.nodeName !== "HTML" : false
    };
    var posProcess = function(selector, context) {
      var tmpSet = [], later = "", match, root = context.nodeType ? [context] : context;
      while(match = Expr.match.PSEUDO.exec(selector)) {
        later += match[0];
        selector = selector.replace(Expr.match.PSEUDO, "")
      }
      selector = Expr.relative[selector] ? selector + "*" : selector;
      for(var i = 0, l = root.length;i < l;i++) {
        Sizzle(selector, root[i], tmpSet)
      }
      return Sizzle.filter(later, tmpSet)
    };
    window.Sizzle = Sizzle
  })()
})();
if(typeof Ur == "undefined") {
  Ur = {QuickLoaders:{}, WindowLoaders:{}, initialize:function(event, fragment) {
    console.log("initializing UR");
    var Loaders = event.type == "DOMContentLoaded" ? Ur.QuickLoaders : Ur.WindowLoaders;
    if(fragment === undefined) {
      fragment = document.body
    }
    for(name in Loaders) {
      console.log("loading : " + name);
      var widget = new Loaders[name];
      widget.initialize(fragment)
    }
  }}
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
  console.log("type:", type);
  this.each(function(type, constructors, groups) {
    return function() {
      x$().helper_find(this, type, constructors, groups)
    }
  }(type, component_constructors, groups));
  return groups
}, helper_find:function(fragment, type, component_constructors, groups) {
  console.log("Looking for " + type + " in fragment:", fragment);
  var all_elements = x$(fragment).find("*[data-ur-" + type + "-component]");
  all_elements.each(function() {
    var valid_component = true;
    var my_set_id = x$(this).attr("data-ur-id");
    if(my_set_id.length != 0) {
      if(groups[my_set_id] === undefined) {
        groups[my_set_id] = {}
      }
    }else {
      var my_ancestor = x$().find_set_ancestor(this);
      if(my_ancestor !== null) {
        my_set_id = x$(my_ancestor).attr("data-ur-id")[0];
        if(my_set_id === undefined) {
          my_set_id = x$().get_unique_uranium_id();
          x$(my_ancestor).attr("data-ur-id", my_set_id)
        }
        if(groups[my_set_id] === undefined) {
          groups[my_set_id] = {}
        }
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
    this.togglers = togglers;
    var self = this;
    for(name in togglers) {
      var toggler = togglers[name];
      x$(toggler["button"]).click(this.construct_button_callback(toggler["content"]))
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
      self.SelectLists[name] = new SelectList(select_lists[name]["select"], select_lists[name]["content"])
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
      new SelectButtons(select_buttons[name])
    }
  };
  return SelectButtonsLoader
}();

