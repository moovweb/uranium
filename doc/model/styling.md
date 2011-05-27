# Styling #
   
You can set the 'data-ur-state' of given components explicitly, or allow the uranium javascript to assign the default state. If a component has a state, its usually either 'enabled' or 'disabled'. There are certain situations (outlined in the [examples](uranium/tree/master/examples) ) where you must assign a state to a widget component. In general, its good practice to only use the states to assign CSS that changes with the state -- use the component attribute or another style rule to give the component its general styles.

## Lazy ##

    Don't set the 'data-ur-state' on your components. 

   Uranium will assign the default state attributes to these elements when the widgets are initialized. 
      
   As an example, for our toggler example, I can not specify the state -- apply 'enabled' type styles to the elements by default (by using the [data-ur-toggler-component] selector) and only add 'state styles' for the disabled state, like so:
     
       [data-ur-toggler-component='content'] {
         /* content styles */
         display:inline-block;
       }

       [data-ur-toggler-component='content'][data-ur-state='disabled'] {
           /* disabled styles, like: */
           display: none;
       }
      
   Usually, you can get away with this when you're only really styling on one of two possible states AND you know that all widgets of this type will have the 'lazy' default state behavior. 

## Strict ##

    Set the 'data-ur-state' on all your components. 

   Strict styling is more well organized. This way, you can separate out the 'default' styles that you need for a component completely from the 'state' styles that can change based on the widget's state. 

   Additional advantages are: 
   -  you can mix and match initial states
   -  you will be able to match on the 'loaded' state (UPCOMING FEATURE)

   Here's an example that exploits the use of setting state explicitly. It highlights one content element at a time:

       <div data-ur-set='toggler'>
         <div data-ur-toggler-component='button' data-ur-state='enabled'> Click Me </div>
         <div data-ur-toggler-component='content' data-ur-state='enabled'> Show Me </div>
         <div data-ur-toggler-component='content' data-ur-state='disabled'> Show Different Me </div>
       </div>
          
    The style rules would look something like this:
     
        [data-ur-toggler-component='button'] {
          /* button styles */
          padding: 5px;
          border-radius: 5px;
        }
           
        [data-ur-toggler-component='button'][data-ur-state='enabled'] {
          background-color: green;
        }        
        
        [data-ur-toggler-component='button'][data-ur-state='disabled'] {
          background-color: red;
        }        
           
        [data-ur-toggler-component='content'] {
          /* content styles */
          display:inline-block;
        }
           
        [data-ur-toggler-component='content'][data-ur-state='enabled'] {
          opacity: 1.0;
        }        
           
        [data-ur-toggler-component='content'][data-ur-state='disabled'] {
          opacity: 0.5;
        }        

## UX cues ##

   The data-ur-state can provide some valuable UX cues ripe for the picking. 

   (UPCOMING FEATURE):

   In addition to setting the initial state of a component, uranium will add the 'loaded' state to a component after the given component has been initialized (all the listeners have been bound and its ready for user interaction). This gives you the ability to add styles to all components when they're in the 'loading' state. You can do all of this with CSS 2 (which is supported on most ... all? ... devices) ! Here's a simple example:

       [data-ur-component='button']
         opacity: 0.5;
       }

       [data-ur-component='button'][data-ur-state~='loaded'] {
         opacity: 1.0;              
       }
        
   Note: The 'attribute_name=~word' attribute syntax just means that an attribute's value consists of space delimited words, one of which is the word we're looking for.