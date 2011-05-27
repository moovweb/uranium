# Construction #

## Convention ##

The thing you'll find yourself doing the most often is just defining the html in question's component type. Like so:

    <div data-ur-toggler-component='button'> Click Me </div>

This tells the javascript two things:
+  'This' div is part of a toggler
+  'This' div is the button part of the toggler

The general syntax here is:

    data-ur-{widget-type}='{widget-component-type}'

Each widget will have slightly different component types, you can refer [here](uranium/blob/master/doc/widgets/widgets.md) for a brief spec, or look at the [examples](uranium/blob/master/examples) for some built examples.

## Custom properties ##
   
A few widgets require more information than just their type. An example is the [Zoom-Preview](uranium/blob/master/examples/zoom_preview.html) widget. The zoom image needs to be a large version of the normal image. The easiest way to accomplish this is to set the zoom-image's src to a modified version of the normal image's src (this integrates nicely with scene7, but will work just as well for your own urls). To accomplish this, we need to tell the components how to modify the incoming src url to the desired url. We can do this with a custom attribute! Like so:

   <pre><code> &lt;img data-ur-zoom-preview-component='zoom_image' 
   data-ur-src-modifier-match='(some_attr=)(.*)' data-ur-src-modifier-replace='$1yesway' /&gt; </code></pre>