(function(c){function x(b,e,f){var d={},g="[data-ur-set='"+e+"']",C="data-ur-"+e+"-component",k="["+C+"],"+g+":empty";c(b).find(k).addBack(k).each(function(){if(!c(this).data("urCompInit")){var b=[];this!=document&&(b=c(this).attr("data-ur-id")?c(this):c(this).closest(g));if(b[0]&&!b.data("urInit")){c(this).data("urCompInit",e);var k=b.attr("data-ur-id");k||(k=U(),b.attr("data-ur-id",k));d[k]=d[k]||{};d[k]._id=k;if(b.is(g))d[k].set=b[0];if(f)f(d[k],this);else if(b=c(this).attr(C))d[k][b]=d[k][b]||
[],d[k][b].push(this)}}});return d}function v(b,e,f){var d=U();c.each(b,function(g,d){typeof d=="string"&&(b[g]=d=c(d));for(var O=d.length-1;O>=0;O--){var l=c(d[O]);l[0]instanceof Node&&(l.data("urCompInit")?c(d).splice(O,1):c(this).data("urCompInit",e))}!f&&g!="set"&&c(d).attr("data-ur-"+e+"-component",g)});b.set&&b.set.length!==0?c(b.set).attr("data-ur-set",e).attr("data-ur-id",d):c.each(b,function(){c(this).attr("data-ur-id",d)});f&&f(b);var g={};g[d]=c.extend({_id:d},b);return g}function $(c){var e=
c.originalEvent.touches,c=e&&e[0]||c;return{x:c.clientX,y:c.clientY}}function R(c){c.preventDefault();c.stopPropagation()}function p(c,e){return Math.max(e[0],Math.min(c,e[1]))}function na(c){return typeof c=="string"?c!="disabled"&&c!="false":c}function y(c){return typeof c=="object"&&Object.getPrototypeOf(c)==Object.prototype}var t=c.fn.jquery.split(".");t[0]==1&&t[1]<4&&(c=c.extend(function(b,e){return new c.fn.init(b||[],e)},c));c.fn.on||c.fn.extend({on:function(c,e,f,d){f==null&&d==null?(d=e,
e=null):d==null&&typeof e!="string"&&(d=f,f=e,e=null);return e?this.delegate(e,c,f,d):this.bind(c,f,d)},off:function(c,e,f){f==null&&(f=e,e=null);return e?this.undelegate(e,c,f):this.unbind(c,f)}});if(!c.fn.addBack)c.fn.addBack=c.fn.andSelf;if(!c.error)c.error=function(c){throw Error(c);};var U=function(){var c=0;return function(){return"ur"+ ++c}}(),la=/Android [12]/.test(navigator.userAgent),L=!la;L&&(t=c("<a>").css({webkitTransform:"translate3d(0, 0, 0)",MozTransform:"translate3d(0, 0, 0)",msTransform:"translate3d(0, 0, 0)",
transform:"translate3d(0, 0, 0)"}),L=(t.css("WebkitTransform")+t.css("MozTransform")+t.css("msTransform")+t.css("transform")+"").indexOf("(")!=-1);var M="ontouchstart"in window,aa=(M?"touchstart":"mousedown")+".ur",ba=(M?"touchmove":"mousemove")+".ur",fa=(M?"touchend":"mouseup")+".ur",G={toggler:function(b){b=y(b)?v(b,"toggler"):x(b,"toggler");c.each(b,function(b,f){f.button||c.error("no button found for toggler with id: "+b);f.content||c.error("no content found for toggler with id: "+b);var d=c(f.button).attr("data-ur-state")||
"disabled";c(f.button).add(f.content).attr("data-ur-state",d);c(f.button).on("click.ur.toggler",function(){var d=c(f.button).attr("data-ur-state")=="enabled",b=d?"disabled":"enabled";c(f.button).add(f.content).attr("data-ur-state",b);d||c(f.drawer).attr("data-ur-state",b)});c(f.drawer).on("webkitTransitionEnd.ur.toggler transitionend.ur.toggler",function(){c(this).attr("data-ur-state",c(f.button).attr("data-ur-state"))});c(f.set).data("urInit",!0)})},tabs:function(b,e){var e=e||{},f=y(b)?v(b,"tabs",
function(d){c.each(d.tabs,function(d){c.each(this,function(b){c(this).attr({"data-ur-id":d,"data-ur-tabs-component":b})})})}):x(b,"tabs",function(d,b){var e=c(b).attr("data-ur-tab-id");d.tabs=d.tabs||{};d.tabs[e]=d.tabs[e]||{};var f=c(b).attr("data-ur-tabs-component");d.tabs[e][f]=d.tabs[e][f]||[];d.tabs[e][f].push(b)});c.each(f,function(b,g){g.closeable=na(c(g.set).attr("data-ur-closeable")||e.closeable);c.each(g.tabs,function(){var b=c(this.button).attr("data-ur-state")||"disabled";c(this.button).add(this.content).attr("data-ur-state",
b)});c.each(g.tabs,function(b,d){c(d.button).on("click.ur.tabs",function(){var b=c(this).attr("data-ur-state")=="enabled";c.each(g.tabs,function(){c(this.button).add(this.content).attr("data-ur-state","disabled")});(!b||!g.closeable)&&c(d.button).add(d.content).attr("data-ur-state","enabled")})});c(g.set).data("urInit",!0)})},inputclear:function(b){b=y(b)?v(b,"input-clear"):x(b,"input-clear");c.each(b,function(b,f){var d=c("<div class='data-ur-input-clear-ex'></div>").hide();c(f.set).append(d);d.on(M?
"touchstart.ur.inputclear":"click.ur.inputclear",function(){g[0].value="";g[0].focus()}).on("touchend.ur.inputclear",function(){g[0].blur()});var g=c(f.set).find("input");g.on("focus.ur.inputclear",function(){g[0].value!=""&&d.show()}).on("keydown.ur.inputclear",function(){d.show()}).on("blur.ur.inputclear",function(){setTimeout(function(){d.hide()},150)});c(f.set).data("urInit",!0)})},geocode:function(b,e){var e=e||{},f=y(b)?v(b,"reverse-geocode",function(b){b.elements=b.elements||{};c.each(b,function(e,
f){e!="set"&&(b.elements[e]=c(f))})}):x(b,"reverse-geocode",function(b,e){b.elements=b.elements||{};b.elements[c(e).attr("data-ur-reverse-geocode-component")]=e});c.each(f,function(b,f){function C(b,d,e){var f=0,a=null,g=null,h=null;switch(c(b).attr("data-ur-reverse-geocode-component")){case "rg-city":g="locality";break;case "rg-street":g="street_number";break;case "rg-zip":g="postal_code";break;case "rg-state":g="administrative_area_level_1";break;case "rg-country":g="country"}for(var h=d[0],k=null,
C=h.address_components.length,m=0;m<C;m++)for(var n=h.address_components[m].types.length,l=0;l<n;l++)if(k=h.address_components[m].types[l],g==k){switch(k){case "street_number":f=m;a=m+1;break;case "locality":f=m;break;case "postal_code":f=m;break;case "administrative_area_level_1":f=m;break;case "country":f=m}break}if(e==="input")b.value=a===null?d[0].address_components[f].long_name:d[0].address_components[f].long_name+" "+d[0].address_components[a].long_name;else if(e==="select"){d=d[0].address_components[f];
e=0;for(f=b.length;e<f;e++)if(b[e].value===d.long_name||b[e].value.toUpperCase()===d.short_name)b.selectedIndex=e}}var k=this.set,p=c(k).attr("data-ur-callback")||e.callback,l=c(k).attr("data-ur-error-callback")||e.errorCallback,n,H,w;this.setupCallbacks=function(){w=this;var b=this.elements["rg-button"];if(b)c(b).on("click.ur.inputclear",function(c){return function(){c.geocodeInit()}}(this));else console.warn("no button for triggering reverse geocoding present"),this.geocodeInit()};this.geoSuccess=
function(c){c={lat:c.coords.latitude,lng:c.coords.longitude};this.codeLatLng(c.lat,c.lng)};this.geoError=function(c){console.error("Ur geolocation error -- Error Getting Your Coordinates!");switch(c.code){case c.TIMEOUT:console.error("Ur geolocation error -- Timeout");break;case c.POSITION_UNAVAILABLE:console.error("Ur geolocation error -- Position unavailable");break;case c.PERMISSION_DENIED:console.error("Ur geolocation error -- Permission denied");break;case c.UNKNOWN_ERROR:console.error("Ur geolocation error -- Unknown error")}typeof l==
"function"?l():eval(l)};this.geoDenied=function(){console.error("Ur geolocation error -- User Denied Geolocation")};this.codeLatLng=function(c,b){var d=new google.maps.LatLng(c,b);n.geocode({latLng:d},function(c,a){if(a==google.maps.GeocoderStatus.OK)if(c[1]){H=c;var b=w.elements;for(elm in b)b[elm].localName==="input"?C(b[elm],H,"input"):b[elm].localName==="select"&&C(b[elm],H,"select");typeof p=="function"?p():eval(p);return c}else console.error("Geocoder failed due to: "+a)})};this.geocodeInit=
function(){navigator.geolocation&&(n=new google.maps.Geocoder,navigator.geolocation.getCurrentPosition(function(c){return function(b){c.geoSuccess(b)}}(this),function(c){return function(b){c.geoError(b)}}(this),this.geoDenied))};UrGeocode=function(c){return function(){c.setupCallbacks()}}(this);k=document.createElement("script");k.type="text/javascript";k.src="https://maps.googleapis.com/maps/api/js?sensor=true&callback=UrGeocode";c("head").append(k);c(f.set).data("urInit",!0)})},zoom:function(b,
e){function f(b){function d(a){if(w&&a!=w[0]){l.state="enabled-out";var b=w.data("urZoomImg");b.transform(0,0,1);b.transitionEnd()}w=c(a)}function f(b){function C(){H.attr("data-ur-transform3d",n.transform3d?"enabled":"disabled");ha=ha||i.parent().outerWidth();ia=ia||i.parent().outerHeight();P=P||parseInt(i.attr("width"))||parseInt(i.css("width"))||i[0].width;ca=ca||parseInt(i.attr("height"))||parseInt(i.css("height"))||i[0].height;V=parseInt(i.attr("data-ur-width"))||i[0].naturalWidth;da=parseInt(i.attr("data-ur-height"))||
i[0].naturalHeight;i.attr("data-ur-src")||i.attr("data-ur-src",i.attr("src"));if(i.attr("data-ur-width")&&i.attr("data-ur-height")||i.attr("src")==i.attr("data-ur-src"))S=!0;I=V/P;E=(V-ha)/2;F=(da-ia)/2}function l(c){if(n.state=="enabled-slide"){Q("enabled");var b=(Date.now()-W)/300;if(b<1){clearTimeout(X);var o=1-Math.pow(1-b,1.685),b=p(h+o*ja,[-E,E]),o=p(r+o*ka,[-F,F]);T(b,o,I)}}B=!1;ga=c.pageX;m=c.pageY;A=!0;if(b=c.originalEvent.touches)ga=b[0].pageX,m=b[0].pageY;b=i[0].style;window.WebKitCSSMatrix?
(b=new WebKitCSSMatrix(b.webkitTransform),a=b.m41,j=b.m42):(b=b.MozTransform||b.msTransform||b.transform||"translate(0, 0)",b=b.replace(/.*?\(|\)/,"").split(","),a=parseInt(b[0]),j=parseInt(b[1]));R(c)}function w(c){if(A){R(c);var b=c.pageX,d=c.pageY;if(c=c.originalEvent.touches)b=c[0].pageX,d=c[0].pageY;b-=ga;d-=m;if(Math.abs(b)>5||Math.abs(d)>5)B=!0;h=p(a+b,[-E,E]);r=p(j+d,[-F,F]);T(h,r,I);Y=J;Z=o;J=b;o=d;ma=ea;ea=Date.now()}}function O(a){B?Date.now()<ea+50&&M():G.zoomOut();R(a);A=!1;B=!0}function M(){Q("enabled-slide");
var a=J-Y,c=o-Z,a=100*Math.sqrt((a*a+c*c)/(J*J+o*o))/(ea-ma);ja=a*J;ka=a*o;a=p(h+ja,[-E,E]);c=p(r+ka,[-F,F]);T(a,c,I);W=Date.now();X=setTimeout(function(){Q("enabled")},300)}function Q(a){n.state=a;i.attr("data-ur-state",a);n.img.length==1&&H.attr("data-ur-state",a)}function L(a,c){D.attr("data-ur-state","enabled");Q("enabled-in");T(a||0,c||0,I)}function T(a,c,b){var o="";a!=null&&(o=N+a+"px, "+c+"px"+u);b!=null&&(o+=q+b+", "+b+v);return i.css({webkitTransform:o,MozTransform:o,msTransform:o,transform:o})}
var G=this,i=c(b),ha,ia,P,ca,V,da,E,F,I,S;this.transitionEnd=function(){n.state=="enabled-in"?(i.css({webkitTransitionDelay:"",MozTransitionDelay:"",OTransitionDelay:"",transitionDelay:""}),i.attr("src",i.attr("data-ur-src")),g.indexOf(i.attr("data-ur-src"))==-1&&setTimeout(function(){g.indexOf(i.attr("data-ur-src"))==-1&&t.attr("data-ur-state","enabled")},16),Q("enabled"),i.on(aa+".zoom",l).on(ba+".zoom",w).on(fa+".zoom",O)):n.state=="enabled-out"&&(Q("disabled"),i.off(aa+".zoom",l).off(ba+".zoom",
w).off(fa+".zoom",O))};this.transform=T;this.zoomIn=function(a){if(n.state=="disabled")if(P||(C(),i.css("width",P+"px"),i.css("height",ca+"px")),x=a.originalEvent.layerX||a.offsetX,z=a.originalEvent.layerY||a.offsetY,S){var a=p(V/2-I*x,[-E,E]),c=p(da/2-I*z,[-F,F]);L(a,c)}else n.state="enabled-in",i.attr("src",i.attr("data-ur-src")),setTimeout(function(){S||t.attr("data-ur-state","enabled")},0)};this.zoomOut=function(){n.state=="enabled"&&(D.attr("data-ur-state","disabled"),Q("enabled-out"),T(0,0,
1))};if(H.attr("data-ur-touch")!="disabled"||e.touch)i.on(aa+".zoom",function(a){s=K=!0;y=$(a)}),i.on(ba+".zoom",function(a){a=$(a);K&&Math.abs(y.x-a.x)+Math.abs(y.x-a.x)>0&&(s=!1)}),i.on("click.ur.zoom",function(a){s&&(d(this),this==i[0]&&G.zoomIn(a))});i.on("load.ur.zoom",function(){i.attr("src")==i.attr("data-ur-src")&&g.push(i.attr("src"));t.attr("data-ur-state","disabled");if(!S&&n.state=="enabled-in"){S=!0;C();var a=p(V/2-I*x,[-E,E]),c=p(da/2-I*z,[-F,F]);i.css({webkitTransitionDelay:"0.3s",
MozTransitionDelay:"0.3s",OTransitionDelay:"0.3s",transitionDelay:"0.3s"});L(a,c)}});this.zoom=function(){n.state=="disabled"?(P||(C(),i.css("width",P+"px"),i.css("height",ca+"px")),S?L(0,0):(n.state="enabled-in",i.attr("src",i.attr("data-ur-src")),setTimeout(function(){g.indexOf(i.attr("data-ur-src"))==-1&&t.attr("data-ur-state","enabled")},0))):G.zoomOut()};i.on("webkitTransitionEnd.ur.zoom transitionend.ur.zoom",this.transitionEnd)}var l=this,n=this;this.container=b.set;this.img=b.img;this.state=
"disabled";this.button=b.button;this.idler=b.loading;var H=c(this.container),w,t=c(this.idler),D=c(this.button),x,z,a=0,j=0,h=0,r=0,ga=0,m=0,A=!1,B=!0,N="translate(",u=")",q=" scale(",v=")",y,s,K,W,X,Y=0,Z=0,J=0,o=0,ma=0,ea=0,ja,ka;this.transform3d=L;if(b=H.attr("data-ur-transform3d"))this.transform3d=b!="disabled";else if("transform3d"in e)this.transform3d=e.transform3d;l.transform3d&&(N="translate3d(",u=",0)",q=" scale3d(",v=",1)");c(l.img).each(function(){g.push(c(this).attr("src"));c(this).data("urZoomImg",
new f(this))});c(l.button).on(M?"touchstart.ur.zoom":"click.ur.zoom",function(){l.img.length>1?d(c(l.img).filter(H.find("[data-ur-state='active'] *"))[0]):d(l.img[0]);w.data("urZoomImg").zoom()})}var e=c.extend({touch:!0},e),d=y(b)?v(b,"zoom",function(b){b.img=[];c.each(b.imgs,function(){c(this.img).attr({"data-ur-zoom-component":"img","data-ur-width":this.width,"data-ur-height":this.height,"data-ur-src":this.src});b.img.push(c(this.img))});c(b.loading).attr({"data-ur-zoom-component":"loading","data-ur-state":"disabled"})}):
x(b,"zoom"),g=[];c.each(d,function(b,d){Uranium.zoom[b]=new f(this);c(d.set).data("urInit",!0)})},carousel:function(b,e){function f(b,d){function e(){a.options.transform3d||(W="translate(",X=")");h.each(function(b,d){if(c(d).attr("data-ur-state")=="active")return a.itemIndex=b,!1});f();l();n(a.options.center?a.itemIndex+a.options.cloneLength:a.itemIndex);a.update();c(a.scroller).on("dragstart.ur.carousel",function(){return!1});a.options.touch&&(c(a.scroller).on(aa+".carousel",t).on(ba+".carousel",
w).on(fa+".carousel",x),h.each(function(b,d){d.onclick&&c(d).data("urClick",d.onclick);d.onclick=function(b){if(a.flag.click||!b.clientX&&!b.clientY){var o=c(this).data("urClick");o&&o.call(this,b)}else R(b),b.stopImmediatePropagation()}}));a.button.prev.on("click.ur.carousel",function(){D(1)});a.button.next.on("click.ur.carousel",function(){D(-1)});if("onorientationchange"in window&&!/Android/.test(navigator.userAgent))c(window).on("orientationchange.ur.carousel",function(){a.update()});else c(window).on("resize.ur.carousel",
function(){s!=j.outerWidth()&&a.update()});h.find("img").addBack("img").on("load.ur.carousel",function(){a.update()});a.autoscrollStart();j.triggerHandler("load.ur.carousel")}function f(){if(a.options.infinite){if(a.options.cloneLength==0)if(a.options.fill)a.options.cloneLength=a.options.center?Math.min(1,a.options.fill-1):a.options.fill;else if(a.options.center){for(var b=[0,0],d=s/2+h[u].offsetWidth/2,e=u;d>0;e=(e-1+a.count)%a.count)d-=h[e].offsetWidth,b[0]++;d=s/2+h[0].offsetWidth/2;for(e=0;d>
0;e=(e+1)%a.count)d-=h[e].offsetWidth,b[1]++;a.options.cloneLength=Math.max(b[0],b[1])}else{d=s;for(e=0;d>0;)d-=h[e].offsetWidth,a.options.cloneLength++,e=(e+1)%h.length}j.attr("data-ur-clones",a.options.cloneLength);b=document.createDocumentFragment();for(e=0;e<a.options.cloneLength;e++){var g=e%a.count,g=h.eq(g).clone(!0).attr("data-ur-clone",g).attr("data-ur-state","inactive");b.appendChild(g[0])}h.parent().append(b);if(a.options.center){b=document.createDocumentFragment();for(e=d=a.count-a.options.cloneLength%
a.count;e<d+a.options.cloneLength;e++)g=e%a.count,g=h.eq(g).clone(!0).attr("data-ur-clone",g).attr("data-ur-state","inactive"),b.appendChild(g[0]);h.parent().prepend(b)}h=c(a.scroller).find("[data-ur-carousel-component='item']");u=h.length-1}else a.options.cloneLength=0,j.attr("data-ur-clones",0)}function l(){if(a.dots){var b=c(a.dots).find("[data-ur-carousel-component='dot']");if(b.length!=a.count){b.remove();for(var b=c("<div data-ur-carousel-component='dot'>"),d=document.createDocumentFragment(),
e=0;e<a.count;e++){var f=b.clone();d.appendChild(f[0])}c(a.dots).append(d)}}}function n(b){if(b!==void 0){a.itemIndex=b;if(a.itemIndex<0)a.itemIndex=0;else if(a.itemIndex>u)a.itemIndex=u;var d=a.itemIndex;a.options.infinite&&a.options.center&&(d=a.itemIndex-a.options.cloneLength);d%=a.count;c(a.counter).html(function(){return(c(this).attr("data-ur-template")||"{{index}} of {{count}}").replace("{{index}}",d+1).replace("{{count}}",a.count)});h.attr("data-ur-state","inactive");h.eq(a.options.center?
a.itemIndex:d).attr("data-ur-state","active");c(a.dots).find("[data-ur-carousel-component='dot']").attr("data-ur-state","inactive").eq(d).attr("data-ur-state","active");a.options.infinite?c([a.button.prev,a.button.next]).attr("data-ur-state","enabled"):(c(a.button.prev).attr("data-ur-state",a.itemIndex==0?"disabled":"enabled"),c(a.button.next).attr("data-ur-state",a.itemIndex==a.count-Math.max(a.options.fill,1)?"disabled":"enabled"))}}function t(c){a.autoscrollStop();a.flag.touched=!0;a.flag.lock=
null;a.flag.click=!0;m=v=r=$(c);K=a.translate}function w(c){if(a.flag.touched){v=r;r=$(c);if(Math.abs(m.y-r.y)+Math.abs(m.x-r.x)>0)a.flag.click=!1;if(M){var b=Math.abs((m.y-r.y)/(m.x-r.x));if(a.flag.lock){if(a.flag.lock=="y")return}else if(b>1.2){a.flag.lock="y";return}else if(b<=1.2)a.flag.lock="x";else return}R(c);if(r!==null){var c=K+(r.x-m.x),d=-c;a.options.center&&(d+=s/2);h.each(function(c,b){var e=b.offsetLeft;if(e+b.offsetWidth>d)return a.itemIndex=c,A=(d-e)/b.offsetWidth,a.options.center&&
(A-=0.5),!1});a.options.infinite&&(a.options.center?a.itemIndex<a.options.cloneLength?(K-=q,c-=q,a.itemIndex+=a.count):a.itemIndex>=a.count+a.options.cloneLength&&(K+=q,c+=q,a.itemIndex-=a.count):A<0?(K-=q,c-=q,a.itemIndex+=a.count,b=h[a.itemIndex],A=(-c-b.offsetLeft)/b.offsetWidth):a.itemIndex>=a.count&&(b=h[a.count].offsetLeft-h[0].offsetLeft,K+=b,c+=b,a.itemIndex-=a.count));z(c)}}}function x(c){if(a.flag.touched){if(!a.flag.click||a.flag.lock)R(c);else if(c.target.tagName=="AREA")location.href=
c.target.href;a.flag.touched=!1;c=r.x-v.x;a.options.center?c<0&&A>0?D(-1):c>0&&A<0?D(1):D(0):D(c<0?-1:0)}}function D(c){a.autoscrollStop();clearTimeout(U);var b=a.itemIndex-c;a.options.infinite||(b=a.options.fill>0&&!a.options.center?p(b,[0,a.count-a.options.fill]):p(b,[0,u]));if(a.options.infinite){var d=a.translate;if(a.options.center)if(b<a.options.cloneLength)z(d-q),b+=a.count,a.itemIndex=b+c;else{if(b>=a.count+a.options.cloneLength)z(d+q),b-=a.count,a.itemIndex=b+c}else if(b<0)z(d-q),b+=a.count,
a.itemIndex=b+c;else if(b>a.count)z(d+q),b-=a.count,a.itemIndex=b+c}B=h[b];j.triggerHandler("slidestart",{index:b});setTimeout(function(){y();n(b)},0)}function y(){function c(){if(!a.flag.touched){var b=a.translate,d=N-b;d-=d/a.options.speed>=0?Math.floor(d/a.options.speed):Math.ceil(d/a.options.speed);Math.abs(d)<0.01&&(d=0);z(b+d);a.flag.snapping=d!=0;a.flag.snapping?U=setTimeout(c,16):(a.options.infinite&&!a.options.center&&a.itemIndex>=a.count&&(z(a.translate+q),a.itemIndex-=a.count),A=0,a.flag.click=
!0,a.autoscrollStart(),j.triggerHandler("slideend",{index:a.itemIndex}))}}N=-B.offsetLeft;a.options.center&&(N+=Math.floor((s-B.offsetWidth)/2));c()}function z(b){a.translate=b;b=W+b+"px, 0px"+X;c(a.scroller).css({webkitTransform:b,MozTransform:b,msTransform:b,transform:b})}var a=this;a.urId=b._id;a.container=b.set;a.scroller=b.scroll_container;a.scroller||c.error("carousel missing item components");a.items=b.item||[];a.button={prev:c(b.button).filter("[data-ur-carousel-button-type='prev']"),next:c(b.button).filter("[data-ur-carousel-button-type='next']")};
a.counter=b.count;a.dots=b.dots;a.flag={click:!0,snapping:!1,lock:null,touched:!1};a.options={autoscroll:!1,autoscrollDelay:5E3,autoscrollForward:!0,center:!1,cloneLength:0,fill:0,infinite:!0,speed:1.1,transform3d:L,touch:!0};c.extend(a.options,d);a.count=a.items.length;a.itemIndex=0;a.translate=0;var j=c(a.container),h=c(a.items),r=null,v,m={x:0,y:0},A=0,B=h[0],N,u=a.count-1,q,G,U,s=j.outerWidth(),K=null,W="translate3d(",X=", 0)";a.update=function(b){b&&c.extend(a.options,b);b=h.length;h=c(a.scroller).find("[data-ur-carousel-component='item']");
if(b!=h.length){a.items=h.filter(":not([data-ur-clone])").toArray();a.count=a.items.length;u=h.length-1;h.each(function(b,d){if(c(d).attr("data-ur-state")=="active")return a.itemIndex=b,!1});if(a.itemIndex>=h.length-a.options.cloneLength)a.itemIndex=u-a.options.cloneLength,h.eq(a.itemIndex).attr("data-ur-state","active");c.contains(a.scroller,B)||(B=h[a.itemIndex]);l();n(a.options.center?a.itemIndex+a.options.cloneLength:a.itemIndex)}s=j.outerWidth();var b=0,d=[];if(a.options.fill>0)for(var e=s,f=
a.options.fill;f>0;f--){var g=Math.round(e/f);d.push(g);e-=g}for(f=q=0;f<h.length;f++)if(a.options.fill>0?(g=d[f%a.options.fill],e=h.eq(f),e.css("width",g+parseInt(e.css("width"))-e.outerWidth()),b+=g):b+=h[f].offsetWidth,f<=u-a.options.cloneLength&&f>=(a.options.center?a.options.cloneLength:0))q+=h[f].offsetWidth;c(a.scroller).width(b);b=h[a.itemIndex];d=-(b.offsetLeft+A*b.offsetWidth);N=-B.offsetLeft;a.options.center&&(d+=Math.floor((s-b.offsetWidth)/2),N+=Math.floor((s-B.offsetWidth)/2));z(d)};
a.autoscrollStart=function(){a.options.autoscroll&&(G=setTimeout(function(){s!=0?!a.options.infinite&&a.itemIndex==u&&a.options.autoscrollForward?a.jumpToIndex(0):!a.options.infinite&&a.itemIndex==0&&!a.options.autoscrollForward?a.jumpToIndex(u):D(a.options.autoscrollForward?-1:1):a.autoscrollStart()},a.options.autoscrollDelay))};a.autoscrollStop=function(){clearTimeout(G)};a.jumpToIndex=function(b){D(a.itemIndex-b)};(function(){var b=j.attr("data-ur-android3d")||j.attr("data-ur-transform3d");if(b)a.options.transform3d=
b!="disabled";j.attr("data-ur-transform3d",a.options.transform3d?"enabled":"disabled");if(la&&!a.options.transform3d)b=parseFloat(j.attr("data-ur-speed")),a.options.speed=b>1?b:1.3;j.attr("data-ur-speed",a.options.speed);b=parseInt(j.attr("data-ur-fill"));if(b>0)a.options.fill=b;j.attr("data-ur-fill",a.options.fill);if(b=j.attr("data-ur-clones"))a.options.cloneLength=parseInt(b);j.attr("data-ur-clones",a.options.cloneLength);b=parseInt(j.attr("data-ur-autoscroll-delay"));if(b>=0)a.options.autoscrollDelay=
b;j.attr("data-ur-autoscroll-delay",a.options.autoscrollDelay);if(b=j.attr("data-ur-autoscroll-dir"))a.options.autoscrollForward=b!="prev";j.attr("data-ur-autoscroll-dir",a.options.autoscrollForward?"next":"prev");c.each(["autoscroll","center","infinite","touch"],function(b,c){var d="data-ur-"+c.replace(/[A-Z]/g,function(a){return"-"+a.toLowerCase()}),e=j.attr(d);e=="enabled"?a.options[c]=!0:e=="disabled"&&(a.options[c]=!1);j.attr(d,a.options[c]?"enabled":"disabled")})})();var Y=!1;a.options.infinite&&
!a.options.fill&&a.options.cloneLength==0&&h.width(function(a,b){b==0&&(Y=!0)});if(Y){console.warn("carousel with id: "+a.urId+" will be late loaded");var Z=h.find("img").addBack("img").filter(function(){return this.naturalWidth==0||this.width==0}),J=Z.length;if(J>0)Z.on("load.ur.carousel",function(){--J==0&&e()});else c(window).on("load.ur.carousel",e)}else e()}var d=y(b)?v(b,"carousel"):x(b,"carousel");c.each(d,function(b,d){c(d.buttons).each(function(){var d=c(this).attr("data-ur-carousel-button-type");
d||c.error("malformed carousel button type for carousel with id: "+b);c(this).attr("data-ur-state",d=="prev"?"disabled":"enabled")});Uranium.carousel[b]=new f(d,e);c(d.set).data("urInit",!0);c(d.set).attr("data-ur-state","enabled")})}};window.Uranium={lib:G};c.each(G,function(b){Uranium[b]={}});c.fn.Uranium=function(){var b=this;c.each(G,function(){this(b)});return this};c(document).ready(c(document).Uranium)})(jQuery);
