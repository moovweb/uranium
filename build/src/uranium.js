(function(c){function A(a,e,f){var d={},g="[data-ur-set='"+e+"']",B="data-ur-"+e+"-component",k="["+B+"],"+g+":empty";c(a).find(k).addBack(k).each(function(){if(!c(this).data("urCompInit")){var a=[];this!=document&&(a=c(this).attr("data-ur-id")?c(this):c(this).closest(g));if(a[0]&&!a.data("urInit")){c(this).data("urCompInit",e);var k=a.attr("data-ur-id");k||(k=T(),a.attr("data-ur-id",k));d[k]=d[k]||{};d[k]._id=k;if(a.is(g))d[k].set=a[0];if(f)f(d[k],this);else if(a=c(this).attr(B))d[k][a]=d[k][a]||
[],d[k][a].push(this)}}});return d}function x(a,e,f){var d=T();c.each(a,function(g,d){typeof d=="string"&&(a[g]=d=c(d));for(var N=d.length-1;N>=0;N--){var l=c(d[N]);l[0]instanceof Node&&(l.data("urCompInit")?c(d).splice(N,1):c(this).data("urCompInit",e))}!f&&g!="set"&&c(d).attr("data-ur-"+e+"-component",g)});a.set&&a.set.length!==0?c(a.set).attr("data-ur-set",e).attr("data-ur-id",d):c.each(a,function(){c(this).attr("data-ur-id",d)});f&&f(a);var g={};g[d]=c.extend({_id:d},a);return g}function aa(c){var e=
c.originalEvent.touches,c=e&&e[0]||c;return{x:c.clientX,y:c.clientY}}function Q(c){c.preventDefault();c.stopPropagation()}function p(c,e){return Math.max(e[0],Math.min(c,e[1]))}function oa(c){return typeof c=="string"?c!="disabled"&&c!="false":c}var t=c.fn.jquery.split(".");t[0]==1&&t[1]<4&&(c=c.extend(function(a,e){return new c.fn.init(a||[],e)},c));c.fn.on||c.fn.extend({on:function(c,e,f,d){f==null&&d==null?(d=e,e=null):d==null&&typeof e!="string"&&(d=f,f=e,e=null);return e?this.delegate(e,c,f,
d):this.bind(c,f,d)},off:function(c,e,f){f==null&&(f=e,e=null);return e?this.undelegate(e,c,f):this.unbind(c,f)}});if(!c.fn.addBack)c.fn.addBack=c.fn.andSelf;if(!c.error)c.error=function(c){throw Error(c);};var T=function(){var c=0;return function(){return++c+""}}(),la=/Android [12]/.test(navigator.userAgent),K=!la;K&&(t=c("<a>").css({webkitTransform:"translate3d(0, 0, 0)",MozTransform:"translate3d(0, 0, 0)",msTransform:"translate3d(0, 0, 0)",transform:"translate3d(0, 0, 0)"}),K=(t.css("WebkitTransform")+
t.css("MozTransform")+t.css("msTransform")+t.css("transform")+"").indexOf("(")!=-1);var L="ontouchstart"in window,ba=(L?"touchstart":"mousedown")+".ur",U=(L?"touchmove":"mousemove")+".ur",ca=(L?"touchend":"mouseup")+".ur",F={toggler:function(a){a=a.constructor==Object?x(a,"toggler"):A(a,"toggler");c.each(a,function(a,f){f.button||c.error("no button found for toggler with id: "+a);f.content||c.error("no content found for toggler with id: "+a);var d=c(f.button).attr("data-ur-state")||"disabled";c(f.button).add(f.content).attr("data-ur-state",
d);c(f.button).on("click.ur.toggler",function(){var d=c(f.button).attr("data-ur-state")=="enabled",a=d?"disabled":"enabled";c(f.button).add(f.content).attr("data-ur-state",a);d||c(f.drawer).attr("data-ur-state",a)});c(f.drawer).on("webkitTransitionEnd.ur.toggler transitionend.ur.toggler",function(){c(this).attr("data-ur-state",c(f.button).attr("data-ur-state"))});c(f.set).data("urInit",!0)})},tabs:function(a,e){var e=e||{},f=a.constructor==Object?x(a,"tabs",function(d){c.each(d.tabs,function(d){c.each(this,
function(a){c(this).attr({"data-ur-id":d,"data-ur-tabs-component":a})})})}):A(a,"tabs",function(d,a){var e=c(a).attr("data-ur-tab-id");d.tabs=d.tabs||{};d.tabs[e]=d.tabs[e]||{};var f=c(a).attr("data-ur-tabs-component");d.tabs[e][f]=d.tabs[e][f]||[];d.tabs[e][f].push(a)});c.each(f,function(a,g){g.closeable=oa(c(g.set).attr("data-ur-closeable")||e.closeable);c.each(g.tabs,function(){var a=c(this.button).attr("data-ur-state")||"disabled";c(this.button).add(this.content).attr("data-ur-state",a)});c.each(g.tabs,
function(a,d){c(d.button).on("click.ur.tabs",function(){var a=c(this).attr("data-ur-state")=="enabled";c.each(g.tabs,function(){c(this.button).add(this.content).attr("data-ur-state","disabled")});(!a||!g.closeable)&&c(d.button).add(d.content).attr("data-ur-state","enabled")})});c(g.set).data("urInit",!0)})},inputclear:function(a){a=a.constructor==Object?x(a,"input-clear"):A(a,"input-clear");c.each(a,function(a,f){var d=c("<div class='data-ur-input-clear-ex'></div>").hide();c(f.set).append(d);d.on(L?
"touchstart.ur.inputclear":"click.ur.inputclear",function(){g[0].value="";g[0].focus()}).on("touchend.ur.inputclear",function(){g[0].blur()});var g=c(f.set).find("input");g.on("focus.ur.inputclear",function(){g[0].value!=""&&d.show()}).on("keydown.ur.inputclear",function(){d.show()}).on("blur.ur.inputclear",function(){setTimeout(function(){d.hide()},150)});c(f.set).data("urInit",!0)})},geocode:function(a,e){var e=e||{},f=a.constructor==Object?x(a,"reverse-geocode",function(a){a.elements=a.elements||
{};c.each(a,function(e,f){e!="set"&&(a.elements[e]=c(f))})}):A(a,"reverse-geocode",function(a,e){a.elements=a.elements||{};a.elements[c(e).attr("data-ur-reverse-geocode-component")]=e});c.each(f,function(a,f){function B(a,d,e){var f=0,b=null,g=null,h=null;switch(c(a).attr("data-ur-reverse-geocode-component")){case "rg-city":g="locality";break;case "rg-street":g="street_number";break;case "rg-zip":g="postal_code";break;case "rg-state":g="administrative_area_level_1";break;case "rg-country":g="country"}for(var h=
d[0],k=null,B=h.address_components.length,m=0;m<B;m++)for(var n=h.address_components[m].types.length,l=0;l<n;l++)if(k=h.address_components[m].types[l],g==k){switch(k){case "street_number":f=m;b=m+1;break;case "locality":f=m;break;case "postal_code":f=m;break;case "administrative_area_level_1":f=m;break;case "country":f=m}break}if(e==="input")a.value=b===null?d[0].address_components[f].long_name:d[0].address_components[f].long_name+" "+d[0].address_components[b].long_name;else if(e==="select"){d=d[0].address_components[f];
e=0;for(f=a.length;e<f;e++)if(a[e].value===d.long_name||a[e].value.toUpperCase()===d.short_name)a.selectedIndex=e}}var k=this.set,p=c(k).attr("data-ur-callback")||e.callback,l=c(k).attr("data-ur-error-callback")||e.errorCallback,n,G,w;this.setupCallbacks=function(){w=this;var a=this.elements["rg-button"];if(a)c(a).on("click.ur.inputclear",function(c){return function(){c.geocodeInit()}}(this));else console.warn("no button for triggering reverse geocoding present"),this.geocodeInit()};this.geoSuccess=
function(c){c={lat:c.coords.latitude,lng:c.coords.longitude};this.codeLatLng(c.lat,c.lng)};this.geoError=function(c){console.error("Ur geolocation error -- Error Getting Your Coordinates!");switch(c.code){case c.TIMEOUT:console.error("Ur geolocation error -- Timeout");break;case c.POSITION_UNAVAILABLE:console.error("Ur geolocation error -- Position unavailable");break;case c.PERMISSION_DENIED:console.error("Ur geolocation error -- Permission denied");break;case c.UNKNOWN_ERROR:console.error("Ur geolocation error -- Unknown error")}typeof l==
"function"?l():eval(l)};this.geoDenied=function(){console.error("Ur geolocation error -- User Denied Geolocation")};this.codeLatLng=function(c,a){var d=new google.maps.LatLng(c,a);n.geocode({latLng:d},function(c,b){if(b==google.maps.GeocoderStatus.OK)if(c[1]){G=c;var a=w.elements;for(elm in a)a[elm].localName==="input"?B(a[elm],G,"input"):a[elm].localName==="select"&&B(a[elm],G,"select");typeof p=="function"?p():eval(p);return c}else console.error("Geocoder failed due to: "+b)})};this.geocodeInit=
function(){navigator.geolocation&&(n=new google.maps.Geocoder,navigator.geolocation.getCurrentPosition(function(c){return function(a){c.geoSuccess(a)}}(this),function(c){return function(a){c.geoError(a)}}(this),this.geoDenied))};UrGeocode=function(c){return function(){c.setupCallbacks()}}(this);k=document.createElement("script");k.type="text/javascript";k.src="https://maps.googleapis.com/maps/api/js?sensor=true&callback=UrGeocode";c("head").append(k);c(f.set).data("urInit",!0)})},zoom:function(a,
e){function f(a){function d(b){if(w&&b!=w[0]){l.state="enabled-out";var a=w.data("urZoomImg");a.transform(0,0,1);a.transitionEnd()}w=c(b)}function f(a){function B(){G.attr("data-ur-transform3d",n.transform3d?"enabled":"disabled");ha=ha||i.parent().outerWidth();ia=ia||i.parent().outerHeight();O=O||parseInt(i.attr("width"))||parseInt(i.css("width"))||i[0].width;da=da||parseInt(i.attr("height"))||parseInt(i.css("height"))||i[0].height;W=parseInt(i.attr("data-ur-width"))||i[0].naturalWidth;ea=parseInt(i.attr("data-ur-height"))||
i[0].naturalHeight;i.attr("data-ur-src")||i.attr("data-ur-src",i.attr("src"));if(i.attr("data-ur-width")&&i.attr("data-ur-height")||i.attr("src")==i.attr("data-ur-src"))R=!0;H=W/O;D=(W-ha)/2;E=(ea-ia)/2}function l(c){if(n.state=="enabled-slide"){P("enabled");var a=(Date.now()-X)/300;if(a<1){clearTimeout(Y);var o=1-Math.pow(1-a,1.685),a=p(h+o*ja,[-D,D]),o=p(r+o*ka,[-E,E]);S(a,o,H)}}z=!1;ga=c.pageX;m=c.pageY;y=!0;if(a=c.originalEvent.touches)ga=a[0].pageX,m=a[0].pageY;a=i[0].style;window.WebKitCSSMatrix?
(a=new WebKitCSSMatrix(a.webkitTransform),b=a.m41,j=a.m42):(a=a.MozTransform||a.msTransform||a.transform||"translate(0, 0)",a=a.replace(/.*?\(|\)/,"").split(","),b=parseInt(a[0]),j=parseInt(a[1]));Q(c)}function w(c){if(y){Q(c);var a=c.pageX,d=c.pageY;if(c=c.originalEvent.touches)a=c[0].pageX,d=c[0].pageY;a-=ga;d-=m;if(Math.abs(a)>5||Math.abs(d)>5)z=!0;h=p(b+a,[-D,D]);r=p(j+d,[-E,E]);S(h,r,H);Z=I;$=o;I=a;o=d;ma=fa;fa=Date.now()}}function N(b){z?Date.now()<fa+50&&L():F.zoomOut();Q(b);y=!1;z=!0}function L(){P("enabled-slide");
var b=I-Z,c=o-$,b=100*Math.sqrt((b*b+c*c)/(I*I+o*o))/(fa-ma);ja=b*I;ka=b*o;b=p(h+ja,[-D,D]);c=p(r+ka,[-E,E]);S(b,c,H);X=Date.now();Y=setTimeout(function(){P("enabled")},300)}function P(b){n.state=b;i.attr("data-ur-state",b);n.img.length==1&&G.attr("data-ur-state",b)}function K(b,c){C.attr("data-ur-state","enabled");P("enabled-in");S(b||0,c||0,H)}function S(b,c,a){var o="";b!=null&&(o=M+b+"px, "+c+"px"+v);a!=null&&(o+=q+a+", "+a+A);return i.css({webkitTransform:o,MozTransform:o,msTransform:o,transform:o})}
var F=this,i=c(a),ha,ia,O,da,W,ea,D,E,H,R;this.transitionEnd=function(){n.state=="enabled-in"?(i.css({webkitTransitionDelay:"",MozTransitionDelay:"",OTransitionDelay:"",transitionDelay:""}),i.attr("src",i.attr("data-ur-src")),g.indexOf(i.attr("data-ur-src"))==-1&&setTimeout(function(){g.indexOf(i.attr("data-ur-src"))==-1&&t.attr("data-ur-state","enabled")},16),P("enabled"),i.on(ba+".zoom",l).on(U+".zoom",w).on(ca+".zoom",N)):n.state=="enabled-out"&&(P("disabled"),i.off(ba+".zoom",l).off(U+".zoom",
w).off(ca+".zoom",N))};this.transform=S;this.zoomIn=function(b){if(n.state=="disabled"){O||(B(),i.css("width",O+"px"),i.css("height",da+"px"));var c=b.pageX,a=b.pageY;if(b.touches)c=b.touches[0].pageX,a=b.touches[0].pageY;V=b.offsetX;u=b.offsetY;if(V==void 0||u==void 0)b=i[0].getBoundingClientRect(),V=c-b.left,u=a-b.top;R?(c=p(W/2-H*V,[-D,D]),a=p(ea/2-H*u,[-E,E]),K(c,a)):(n.state="enabled-in",i.attr("src",i.attr("data-ur-src")),setTimeout(function(){R||t.attr("data-ur-state","enabled")},0))}};this.zoomOut=
function(){n.state=="enabled"&&(C.attr("data-ur-state","disabled"),P("enabled-out"),S(0,0,1))};if(G.attr("data-ur-touch")!="disabled"||e.touch)i.on(ba+".zoom",function(b){s=J=!0;x=aa(b)}),i.on(U+".zoom",function(b){b=aa(b);J&&Math.abs(x.x-b.x)+Math.abs(x.x-b.x)>0&&(s=!1)}),i.on("click.ur.zoom",function(b){s&&(d(this),this==i[0]&&F.zoomIn(b))});i.on("load.ur.zoom",function(){i.attr("src")==i.attr("data-ur-src")&&g.push(i.attr("src"));t.attr("data-ur-state","disabled");if(!R&&n.state=="enabled-in"){R=
!0;B();var b=p(W/2-H*V,[-D,D]),c=p(ea/2-H*u,[-E,E]);i.css({webkitTransitionDelay:"0.3s",MozTransitionDelay:"0.3s",OTransitionDelay:"0.3s",transitionDelay:"0.3s"});K(b,c)}});this.zoom=function(){n.state=="disabled"?(O||(B(),i.css("width",O+"px"),i.css("height",da+"px")),R?K(0,0):(n.state="enabled-in",i.attr("src",i.attr("data-ur-src")),setTimeout(function(){g.indexOf(i.attr("data-ur-src"))==-1&&t.attr("data-ur-state","enabled")},0))):F.zoomOut()};i.on("webkitTransitionEnd.ur.zoom transitionend.ur.zoom",
this.transitionEnd)}var l=this,n=this;this.container=a.set;this.img=a.img;this.state="disabled";this.button=a.button;this.idler=a.loading;var G=c(this.container),w,t=c(this.idler),C=c(this.button),V,u,b=0,j=0,h=0,r=0,ga=0,m=0,y=!1,z=!0,M="translate(",v=")",q=" scale(",A=")",x,s,J,X,Y,Z=0,$=0,I=0,o=0,ma=0,fa=0,ja,ka;this.transform3d=K;if(a=G.attr("data-ur-transform3d"))this.transform3d=a!="disabled";else if("transform3d"in e)this.transform3d=e.transform3d;l.transform3d&&(M="translate3d(",v=",0)",q=
" scale3d(",A=",1)");c(l.img).each(function(){g.push(c(this).attr("src"));c(this).data("urZoomImg",new f(this))});c(l.button).on(L?"touchstart.ur.zoom":"click.ur.zoom",function(){l.img.length>1?d(c(l.img).filter(G.find("[data-ur-state='active'] *"))[0]):d(l.img[0]);w.data("urZoomImg").zoom()})}var e=c.extend({touch:!0},e),d=a.constructor==Object?x(a,"zoom",function(a){a.img=[];c.each(a.imgs,function(){c(this.img).attr({"data-ur-zoom-component":"img","data-ur-width":this.width,"data-ur-height":this.height,
"data-ur-src":this.src});a.img.push(c(this.img))});c(a.loading).attr({"data-ur-zoom-component":"loading","data-ur-state":"disabled"})}):A(a,"zoom"),g=[];c.each(d,function(a,d){Uranium.zoom[a]=new f(this);c(d.set).data("urInit",!0)})},carousel:function(a,e){function f(a,d){function e(){b.options.transform3d||(X="translate(",Y=")");h.each(function(a,d){if(c(d).attr("data-ur-state")=="active")return b.itemIndex=a,!1});f();l();n(b.options.center?b.itemIndex+b.options.cloneLength:b.itemIndex);b.update();
c(b.scroller).on("dragstart.ur.carousel",function(){return!1});b.options.touch&&(c(b.scroller).on(ba+".carousel",t),h.each(function(a,d){d.onclick&&c(d).data("urClick",d.onclick);d.onclick=function(a){if(b.flag.click||!a.clientX&&!a.clientY){var o=c(this).data("urClick");o&&o.call(this,a)}else Q(a),a.stopImmediatePropagation()}}));b.button.prev.on("click.ur.carousel",function(){C(1)});b.button.next.on("click.ur.carousel",function(){C(-1)});if("onorientationchange"in window&&!/Android/.test(navigator.userAgent))c(window).on("orientationchange.ur.carousel",
function(){b.update()});else c(window).on("resize.ur.carousel",function(){s!=j.outerWidth()&&b.update()});h.find("img").addBack("img").on("load.ur.carousel",function(){b.update()});b.autoscrollStart();j.triggerHandler("load.ur.carousel")}function f(){if(b.options.infinite){if(b.options.cloneLength==0)if(b.options.fill)b.options.cloneLength=b.options.center?Math.min(1,b.options.fill-1):b.options.fill;else if(b.options.center){for(var a=[0,0],d=s/2+h[v].offsetWidth/2,e=v;d>0;e=(e-1+b.count)%b.count)d-=
h[e].offsetWidth,a[0]++;d=s/2+h[0].offsetWidth/2;for(e=0;d>0;e=(e+1)%b.count)d-=h[e].offsetWidth,a[1]++;b.options.cloneLength=Math.max(a[0],a[1])}else{d=s;for(e=0;d>0;)d-=h[e].offsetWidth,b.options.cloneLength++,e=(e+1)%h.length}j.attr("data-ur-clones",b.options.cloneLength);a=document.createDocumentFragment();for(e=0;e<b.options.cloneLength;e++){var g=e%b.count,g=h.eq(g).clone(!0).attr("data-ur-clone",g).attr("data-ur-state","inactive");a.appendChild(g[0])}h.parent().append(a);if(b.options.center){a=
document.createDocumentFragment();for(e=d=b.count-b.options.cloneLength%b.count;e<d+b.options.cloneLength;e++)g=e%b.count,g=h.eq(g).clone(!0).attr("data-ur-clone",g).attr("data-ur-state","inactive"),a.appendChild(g[0]);h.parent().prepend(a)}h=c(b.scroller).find("[data-ur-carousel-component='item']");v=h.length-1}else b.options.cloneLength=0,j.attr("data-ur-clones",0)}function l(){if(b.dots){var a=c(b.dots).find("[data-ur-carousel-component='dot']");if(a.length!=b.count){a.remove();for(var a=c("<div data-ur-carousel-component='dot'>"),
d=document.createDocumentFragment(),e=0;e<b.count;e++){var f=a.clone();d.appendChild(f[0])}c(b.dots).append(d)}}}function n(a){if(a!==void 0){b.itemIndex=a;if(b.itemIndex<0)b.itemIndex=0;else if(b.itemIndex>v)b.itemIndex=v;var d=b.itemIndex;b.options.infinite&&b.options.center&&(d=b.itemIndex-b.options.cloneLength);d%=b.count;c(b.counter).html(function(){return(c(this).attr("data-ur-template")||"{{index}} of {{count}}").replace("{{index}}",d+1).replace("{{count}}",b.count)});h.attr("data-ur-state",
"inactive");h.eq(b.options.center?b.itemIndex:d).attr("data-ur-state","active");c(b.dots).find("[data-ur-carousel-component='dot']").attr("data-ur-state","inactive").eq(d).attr("data-ur-state","active");b.options.infinite?c([b.button.prev,b.button.next]).attr("data-ur-state","enabled"):(c(b.button.prev).attr("data-ur-state",b.itemIndex==0?"disabled":"enabled"),c(b.button.next).attr("data-ur-state",b.itemIndex==b.count-Math.max(b.options.fill,1)?"disabled":"enabled"))}}function t(a){c(document).bind(U+
".carousel",w).bind(ca+".carousel",x);b.autoscrollStop();b.flag.touched=!0;b.flag.lock=null;b.flag.click=!0;m=F=r=aa(a);J=b.translate}function w(c){if(b.flag.touched){F=r;r=aa(c);if(Math.abs(m.y-r.y)+Math.abs(m.x-r.x)>0)b.flag.click=!1;if(L){var a=Math.abs((m.y-r.y)/(m.x-r.x));if(b.flag.lock){if(b.flag.lock=="y")return}else if(a>1.2){b.flag.lock="y";return}else if(a<=1.2)b.flag.lock="x";else return}Q(c);if(r!==null){var c=J+(r.x-m.x),d=-c;b.options.center&&(d+=s/2);h.each(function(c,a){var e=a.offsetLeft;
if(e+a.offsetWidth>d)return b.itemIndex=c,y=(d-e)/a.offsetWidth,b.options.center&&(y-=0.5),!1});b.options.infinite&&(b.options.center?b.itemIndex<b.options.cloneLength?(J-=q,c-=q,b.itemIndex+=b.count):b.itemIndex>=b.count+b.options.cloneLength&&(J+=q,c+=q,b.itemIndex-=b.count):y<0?(J-=q,c-=q,b.itemIndex+=b.count,a=h[b.itemIndex],y=(-c-a.offsetLeft)/a.offsetWidth):b.itemIndex>=b.count&&(a=h[b.count].offsetLeft-h[0].offsetLeft,J+=a,c+=a,b.itemIndex-=b.count));u(c)}}}function x(a){if(b.flag.touched){c(document).unbind(U+
".carousel").unbind(ca+".carousel");if(!b.flag.click||b.flag.lock)Q(a);else if(a.target.tagName=="AREA")location.href=a.target.href;b.flag.touched=!1;a=r.x-F.x;b.options.center?a<0&&y>0?C(-1):a>0&&y<0?C(1):C(0):C(a<0?-1:0)}}function C(c){b.autoscrollStop();clearTimeout(na);var a=b.itemIndex-c;b.options.infinite||(a=b.options.fill>0&&!b.options.center?p(a,[0,b.count-b.options.fill]):p(a,[0,v]));if(b.options.infinite){var d=b.translate;if(b.options.center)if(a<b.options.cloneLength)u(d-q),a+=b.count,
b.itemIndex=a+c;else{if(a>=b.count+b.options.cloneLength)u(d+q),a-=b.count,b.itemIndex=a+c}else if(a<0)u(d-q),a+=b.count,b.itemIndex=a+c;else if(a>b.count)u(d+q),a-=b.count,b.itemIndex=a+c}z=h[a];j.triggerHandler("slidestart",{index:a});setTimeout(function(){A();n(a)},0)}function A(){function a(){if(!b.flag.touched){var c=b.translate,d=M-c;d-=d/b.options.speed>=0?Math.floor(d/b.options.speed):Math.ceil(d/b.options.speed);Math.abs(d)<0.01&&(d=0);u(c+d);b.flag.snapping=d!=0;b.flag.snapping?na=setTimeout(a,
16):(b.options.infinite&&!b.options.center&&b.itemIndex>=b.count&&(u(b.translate+q),b.itemIndex-=b.count),y=0,b.flag.click=!0,b.autoscrollStart(),j.triggerHandler("slideend",{index:b.itemIndex}))}}M=-z.offsetLeft;b.options.center&&(M+=Math.floor((s-z.offsetWidth)/2));a()}function u(a){b.translate=a;a=X+a+"px, 0px"+Y;c(b.scroller).css({webkitTransform:a,MozTransform:a,msTransform:a,transform:a})}var b=this;b.urId=a._id;b.container=a.set;b.scroller=a.scroll_container;b.scroller||c.error("carousel missing item components");
b.items=a.item||[];b.button={prev:c(a.button).filter("[data-ur-carousel-button-type='prev']"),next:c(a.button).filter("[data-ur-carousel-button-type='next']")};b.counter=a.count;b.dots=a.dots;b.flag={click:!0,snapping:!1,lock:null,touched:!1};b.options={autoscroll:!1,autoscrollDelay:5E3,autoscrollForward:!0,center:!1,cloneLength:0,fill:0,infinite:!0,speed:1.1,transform3d:K,touch:!0};c.extend(b.options,d);b.count=b.items.length;b.itemIndex=0;b.translate=0;var j=c(b.container),h=c(b.items),r=null,F,
m={x:0,y:0},y=0,z=h[0],M,v=b.count-1,q,T,na,s=j.outerWidth(),J=null,X="translate3d(",Y=", 0)";b.update=function(a){a&&c.extend(b.options,a);a=h.length;h=c(b.scroller).find("[data-ur-carousel-component='item']");if(a!=h.length){b.items=h.filter(":not([data-ur-clone])").toArray();b.count=b.items.length;v=h.length-1;h.each(function(a,d){if(c(d).attr("data-ur-state")=="active")return b.itemIndex=a,!1});if(b.itemIndex>=h.length-b.options.cloneLength)b.itemIndex=v-b.options.cloneLength,h.eq(b.itemIndex).attr("data-ur-state",
"active");c.contains(b.scroller,z)||(z=h[b.itemIndex]);l();n(b.options.center?b.itemIndex+b.options.cloneLength:b.itemIndex)}s=j.outerWidth();var a=0,d=[];if(b.options.fill>0)for(var e=s,f=b.options.fill;f>0;f--){var g=Math.round(e/f);d.push(g);e-=g}for(f=q=0;f<h.length;f++)if(b.options.fill>0?(g=d[f%b.options.fill],e=h.eq(f),e.css("width",g+parseInt(e.css("width"))-e.outerWidth()),a+=g):a+=h[f].offsetWidth,f<=v-b.options.cloneLength&&f>=(b.options.center?b.options.cloneLength:0))q+=h[f].offsetWidth;
c(b.scroller).width(a);a=h[b.itemIndex];d=-(a.offsetLeft+y*a.offsetWidth);M=-z.offsetLeft;b.options.center&&(d+=Math.floor((s-a.offsetWidth)/2),M+=Math.floor((s-z.offsetWidth)/2));u(d)};b.autoscrollStart=function(){b.options.autoscroll&&(T=setTimeout(function(){s!=0?!b.options.infinite&&b.itemIndex==v&&b.options.autoscrollForward?b.jumpToIndex(0):!b.options.infinite&&b.itemIndex==0&&!b.options.autoscrollForward?b.jumpToIndex(v):C(b.options.autoscrollForward?-1:1):b.autoscrollStart()},b.options.autoscrollDelay))};
b.autoscrollStop=function(){clearTimeout(T)};b.jumpToIndex=function(a){C(b.itemIndex-a)};(function(){var a=j.attr("data-ur-android3d")||j.attr("data-ur-transform3d");if(a)b.options.transform3d=a!="disabled";j.attr("data-ur-transform3d",b.options.transform3d?"enabled":"disabled");if(la&&!b.options.transform3d)a=parseFloat(j.attr("data-ur-speed")),b.options.speed=a>1?a:1.3;j.attr("data-ur-speed",b.options.speed);a=parseInt(j.attr("data-ur-fill"));if(a>0)b.options.fill=a;j.attr("data-ur-fill",b.options.fill);
if(a=j.attr("data-ur-clones"))b.options.cloneLength=parseInt(a);j.attr("data-ur-clones",b.options.cloneLength);a=parseInt(j.attr("data-ur-autoscroll-delay"));if(a>=0)b.options.autoscrollDelay=a;j.attr("data-ur-autoscroll-delay",b.options.autoscrollDelay);if(a=j.attr("data-ur-autoscroll-dir"))b.options.autoscrollForward=a!="prev";j.attr("data-ur-autoscroll-dir",b.options.autoscrollForward?"next":"prev");c.each(["autoscroll","center","infinite","touch"],function(a,c){var d="data-ur-"+c.replace(/[A-Z]/g,
function(b){return"-"+b.toLowerCase()}),e=j.attr(d);e=="enabled"?b.options[c]=!0:e=="disabled"&&(b.options[c]=!1);j.attr(d,b.options[c]?"enabled":"disabled")})})();var Z=!1;b.options.infinite&&!b.options.fill&&b.options.cloneLength==0&&h.width(function(b,a){a==0&&(Z=!0)});if(Z){console.warn("carousel with id: "+b.urId+" will be late loaded");var $=h.find("img").addBack("img").filter(function(){return this.naturalWidth==0||this.width==0}),I=$.length;if(I>0)$.on("load.ur.carousel",function(){--I==0&&
e()});else c(window).on("load.ur.carousel",e)}else e()}var d=a.constructor==Object?x(a,"carousel"):A(a,"carousel");c.each(d,function(a,d){c(d.buttons).each(function(){var d=c(this).attr("data-ur-carousel-button-type");d||c.error("malformed carousel button type for carousel with id: "+a);c(this).attr("data-ur-state",d=="prev"?"disabled":"enabled")});Uranium.carousel[a]=new f(d,e);c(d.set).data("urInit",!0);c(d.set).attr("data-ur-state","enabled")})}};window.Uranium={lib:F};c.each(F,function(a){Uranium[a]=
{}});c.fn.Uranium=function(){var a=this;c.each(F,function(){this(a)});return this};c(document).ready(c(document).Uranium)})(jQuery);
