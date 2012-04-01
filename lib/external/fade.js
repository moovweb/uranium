xui.extend({
   fade:function(to, callback) {
       var target = 0;
       if (typeof to == 'string' && to == 'in') target = 1;
       else if (typeof to == 'number') target = to;
       return this.tween({opacity:target,duration:.2}, callback);
   } 
});
