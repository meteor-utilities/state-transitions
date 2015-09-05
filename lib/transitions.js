// see http://stackoverflow.com/questions/8051975/access-object-child-properties-using-a-dot-notation-string
var getNestedProperty = function (obj, desc) {
  var arr = desc.split(".");
  while(arr.length && (obj = obj[arr.shift()]));
  return obj;
};

var collectionsWithTransitions = [];

Mongo.Collection.prototype.stateTransitions = {};

// add state transition to a list
Mongo.Collection.prototype.addStateTransition = function (property, transitions) {

  var collection = this;
  
  // add collection to the list of collections with transitions
  collectionsWithTransitions.push(collection);

  // get transitions for the current property, or an empty array if property has no transitions yet
  var propertyTransitions = typeof collection.stateTransitions[property] === "undefined" ? [] : collection.stateTransitions[property];
  
  // add transitions to property's transitions
  collection.stateTransitions[property] = propertyTransitions.concat(transitions);

}

// on startup, go over transition list and create a hook for each collection
Meteor.startup(function () {

  // loop over each collection that has state transitions assigned to it
  collectionsWithTransitions.forEach(function (collection) {

    collection.after.update(function (userId, doc, fieldNames, modifier, options) {

      var oldDocument = this.previous;
      var newDocument = doc;

      // loop over each property
      _.each(collection.stateTransitions, function (transitions, property) {

        var oldState = getNestedProperty(oldDocument, property);
        var newState = getNestedProperty(newDocument, property);

        // if state has changed
        if (oldState !== newState) {

          // console.log("current transition:  "+oldState+" to "+newState)

          // loop through each transition, and see if it applies to the current update
          transitions.forEach(function (transition) {
            
            // check if the "from" part matches
            var fromMatch = 
              transition.from === "*" || 
              transition.from === oldState || 
              (Array.isArray(transition.from) && _.contains(transition.from, oldState));

            // check if the "to" part matches
            var toMatch = 
              transition.to === "*" || 
              transition.to === newState || 
              (Array.isArray(transition.from) && _.contains(transition.to, newState));

            // console.log(transition.name+":  "+transition.from+" to "+transition.to)

            if (fromMatch && toMatch) {

              // console.log("// detected "+transition.name+" transition, executing callback");
              transition.callback(oldDocument, newDocument);
            
            }
          }); // transitions.forEach
        
        } // if oldState !== newState

      }); // _.each(collection.stateTransition)
    
    }); // collection.after.update
  
  }); // collectionsWithTransitions.forEach

}); // Meteor.startup