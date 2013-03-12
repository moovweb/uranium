// jQuery.Uranium.js
// Build out Uranium widgets in jQuery

(function ( $ ) {

  // helper function for log
  // TODO: Remove
  var log = function (msg) {
    return console.log(msg);
  }

  var findElements = function(fragment, type) {
    var all_elements = $(fragment).find("*[data-ur-" + type + "-component]");
  }

  // Toggler
  var toggler = function( fragment ) {

    log("Toggler");
    // log(this);
    // log($(this));
    // log(fragment);
    // log($(fragment));

    var funcs = {

      _onLoad : function() {
        // body...
        log("toggler.funcs._onLoad");
        var togglers = $(fragment);
        log(togglers);
      }
    };

    funcs['_onLoad'].apply(fragment);

  }

  var initialized = false;

  // Have methods here to make private
  var methods = {
    init : function( options ) {
      // Initialize the function here
      log("Uranium init: " + options);

      // log(this);
      // log($(this));
      if (! initialized) {

        // Define the fragment
        if (this === undefined) {
          this = document.body;
        }

        toggler(this);

      }

      initialized = true;
    },
    // Error not needed, just call $.error
    warn : function( msg ) {
      console.warn("Uranium: " + msg);
    },
    initialized : function() {
      log("initialized " + initialized);
      return initialized;
    }
  }

  $.fn.Uranium = function( method, debug ) {

    return this.each(function() {
      log("Iterating through the items in the jQuery function");

      // Call functions to prove they are working as we build out the framework

      // warn
      methods.warn.apply( this, Array.prototype.slice.call( arguments, 1 ));
      methods.warn.apply( this, arguments );

      // initialized?
      methods.initialized.apply( this );

      // init
      methods.init.apply( this, arguments );

      // initialized?
      methods.initialized.apply( this );

      if ( methods[method] ) {
        return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' + method + ' does not exist on jQuery.Uranium');
      }

    });
  };
})( jQuery );

