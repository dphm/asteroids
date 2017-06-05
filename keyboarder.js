;(function(exports) {
  function Keyboarder() {
    // Map key names to key codes
    this.KEYS = {
      SPACE: 32,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    }

    // Store key state
    var keyState = {};

    /**
     * Updates state of pressed key to true.
     */
    window.onkeydown = function(e) {
      keyState[e.keyCode] = true;
    };

    /**
     * Updates state of released key to false.
     */
    window.onkeyup = function(e) {
      keyState[e.keyCode] = false;
    };

    /**
     * Returns true if the key corresponding to keyCode is being pressed.
     */
    this.isDown = function(keyCode) {
      return keyState[keyCode];
    };
  }

  exports.Keyboarder = Keyboarder;
})(this);
