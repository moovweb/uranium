# States #

States reflect the current status of a widget. Usually, these states provide a UX cue -- it is up to you to style upon the states that you care about.

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