# utilities:simple-state

A simplified reactive state transitions engine 

## Installation

```
meteor add utilities:simple-state
```

## Description

This package watches a given property on your documents, and executes a callback when it changes to a specified value. 

Note that this is not a full-fledged [state machine](https://atmospherejs.com/natestrauser/statemachine), but just a way to conditionally execute code when a document's property changes between a set of given values. 

## Usage

`myCollection.stateTransitions(property, transitions)`

- `property`: `String`
- `transitions`: `Array` of *transitions*.

This will watch `property` on every document belonging to the `myCollection` collection, and whenever it changes check to see if a transition should be triggered. 

Transitions have the following properties:

- `name`: the transition's name.
- `from`: the start state to match, array of start states, or wildcard (`*`).
- `to`: the end state to match, array of start states, or wildcard (`*`)
- `callback(oldDocument, newDocument)`: the function to execute if the transition is matched. 

## Example

Let's suppose posts in our app each have a `status` property that tracks whether they're `approved`, `pending`, `rejected`, `deleted`, etc. 

Here's how you would increment a category's `postsCount` property whenever a post belonging to that category is approved, and decrement it whenever that post is *un*approved. 

By using the `*` wildcard, we can match transitions between `approved` and any other possible value for the `status` property.

```js
Posts = new Mongo.Collection("posts");

Posts.transitions.add("status", [
  {
    name: "approve",
    from: "*",
    to: "approved",
    callback: function (post) {
      Categories.update(post.categoryId, {$inc: {"postsCount": 1}});
    }
  },
  {
    name: "unapprove",
    from: "*",
    to: "approved",
    callback: function (post) {
      Categories.update(post.categoryId, {$inc: {"postsCount": -1}});
    }
  }
]);
```