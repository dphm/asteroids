;(function(exports) {
  /* Keyboarder recognizes key presses and keeps track of the state of which keys are being pressed 
     at the instant of "pressing." */
  function Keyboarder() {
    this.KEYS = {
      SPACE: 32,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    }

    var keyState = {};

    window.onkeydown = function(e) {
      keyState[e.keyCode] = true;
    };

    window.onkeyup = function(e) {
      keyState[e.keyCode] = false;
    };

    this.isDown = function(keyCode) {
      return keyState[keyCode];
    };
  }

  exports.Keyboarder = Keyboarder;
})(this);
