# Uranium Model #

## Attributes ##

Uranium uses declarative javascript. This means that the attributes that we add on the html tell the javascript what to do. Here are a few examples of uranium attributes on html elements:

    <div data-ur-set='toggler'>   </div>

    <span data-ur-toggler-component='button' data-ur-state='enabled'>   </span>

The naming convention here is worth discussing. In HTML4 adding attributes other than id/class/name isn't strictly to spec. But -- in HTML5, we can add custom attributes, so long as they're prefixed with 'data-'. The next part, the 'ur' you see, is uranium's periodic symbol! The last part of the attribute name is specific to the function / declaration you're making -- more on that below.

## How? ##

In making [widgets](uranium/blob/master/doc/widgets.md), you'll really be performing three functions:

### I. Making Components ###

#### Convention ####

The thing you'll find yourself doing the most often is just defining the html in question's component type. Like so:

    <div data-ur-toggler-component='button'> Click Me </div>

This tells the javascript two things:
+  'This' div is part of a toggler
+  'This' div is the button part of the toggler

The general syntax here is:

    data-ur-{widget-type}='{widget-component-type}'

Each widget will have slightly different component types, you can refer [here](uranium/blob/master/doc/widgets.md) for a brief spec, or look at the [tests](uranium/blob/master/tests) for some built examples.

#### Custom properties ####
   
A few widgets require more information than just their type. An example is the Zoom-Preview widget. The zoom image needs to be a large version of the normal image. The easiest way to accomplish this is to set the zoom-image's src to a modified version of the normal image's src (this integrates nicely with scene7, but will work just as well for your own urls). To accomplish this, we need to tell the components how to modify the incoming src url to the desired url. We can do this with a custom attribute! Like so:

   <pre><code> &lt;img data-ur-zoom-preview-component='zoom_image' 
   data-ur-src-modifier-match='(some_attr=)(.*)' data-ur-src-modifier-replace='$1yesway' /&gt; </code></pre>

### II. Grouping Components ###

Uranium needs to know which components belong to which widget (you could have many togglers). To do this, it associates widget components to a widget set. 

#### Group by structure (recommended) ####

Grouping by html structure is easier in most situations, and a lot more readable. To defined a widget set, just set the 'data-ur-set' attribute to the widget type (e.g. 'toggler') on any element that is a common ancestor of all the widget components:

    <div data-ur-set='toggler'>
      <div data-ur-toggler-component='button'> Click Me </div>
      <div data-ur-toggler-component='content'> Show Me </div>
    </div>

Its recommended that you add the set attribute to the first common ancestor. This method encourages well-organized (hierarchical) html.

#### Group by UID ####

Grouping by unique ID should be reserved for instances in which you can't easily make the html hierarchical (e.g. adjacent rows in a table, or if the container already has a data-ur-set attribute ). The only requirement is that the 'data-ur-id' attribute be set to a value unique to the widget component set:

    <div data-ur-toggler-component='button' data-ur-id='Charlie'> Click Me </div>
    <div data-ur-toggler-component='content' data-ur-id='Charlie'> Show Me </div>


### III. Observing States ###

The widgets are assigned different states according to their function. 

For example, a toggler button component will have either 'enabled' or 'disabled' states assigned to its 'data-ur-state' attribute. These attributes allow you to style the widget's UI appropriately. Since 'data-ur-state' is a bit of a mouthful in css, we highly recommend using [Sass](http://sass-lang.com/).

Here's how some basic styling would look:

    [data-ur-toggler-component='button'] {
      padding: 5px;
      border-radius: 5px;
    }
           
    [data-ur-toggler-component='button'][data-ur-state='enabled'] {
      background-color: green;
    }        
        
    [data-ur-toggler-component='button'][data-ur-state='disabled'] {
      background-color: red;
    }  

Look [here](uranium/blob/master/doc/styling.md) for more details about styling.