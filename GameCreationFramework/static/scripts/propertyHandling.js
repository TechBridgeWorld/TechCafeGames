/* 
  this is code that Erik wrote that goes *somewhere* for:
    1. after a player collides with an element,
      (by tapping on it in tapping mode (TM) or
       by the avatar colliding with the element in directional mode (DM))
    2. we check the element properties
      (in a specific order of property priority)
    3. and respond to those properties accordingly
      (here represented by comments to be implemented later)
*/

// element collides with player (event handler setup)
// elem is an object of type ElementData
elem.oncollide(function() {
  
  var eprops = elem.properties;
  var TM = (minigame.inputMethod === "mouse");
  var DM = (minigame.inputMethod === "keys");
  assert(TM || DM);
  var gravity = minigame.gravity;

  if (eprops.deadly) { 
    if (TM) {
      // flash screen menacingly!
    }
    else {
      // player goes back to start spot
    }
  }

  else if (eprops.collapseontouch) {
    // initially, let's just have this make the object disappear
    if (TM) {
      // break object (animation of shattering?)
    }
    else {
      if (gravity) {
        // object slowly breaks (like a crumbling/disappearing platform)
      }
      else {
        // object breaks the more you collide with it, then disappears
      }
    }
  }

  // Erik will finish these, he has a plan for them.

});