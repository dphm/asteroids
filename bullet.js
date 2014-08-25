;(function(exports) {
  function Bullet(center, angle, creator) {
    this.creator = creator;
    this.game = creator.game;
    this.color = creator.color;

    this.angle = angle;
    this.speed = 5;

    // Set points and lines about bullet center.
    this.center = { x: center.x, y: center.y };
    this.resetPoints();
    this.resetLineSegments();
  }

  Bullet.prototype = {
    /**
     * Updates position of the bullet.
     */
    update: function() {
      // Move center by speed and angle.
      this.game.trig.translatePoint(this.center, this.speed, this.angle);

      // Reset points and lines about new center.
      this.resetPoints();
      this.resetLineSegments();

      // Kill bullets that leave the screen.
      if (this.offScreen()) {
        this.die();
      }
    },

    /**
     * Draws the bullet on the screen.
     */
    draw: function(screen) {
      screen.strokeStyle = this.color;
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, 1, 0, this.game.FULL_ROTATION);
      screen.stroke();
    },

    /**
     * Handles events occurring upon the destruction of the bullet.
     */
    die: function() {
      // Remove the dead bullet from the list of game bodies.
      this.game.removeBody(this);
    },

    /**
     * Returns true if the bullet center is off-screen.
     */
    offScreen: function() {
      return this.center.x < 0 || this.center.x > this.game.size.x ||
             this.center.y < 0 || this.center.y > this.game.size.y;
    },

    /**
     * Resets the points of the path of the bullet between time t and t+1,
     * relative to its center.
     */
    resetPoints: function() {
      this.points = [
        { x: this.center.x, y: this.center.y },
        { x: this.center.x + this.speed *  Math.cos(this.angle),
          y: this.center.y + this.speed * -Math.sin(this.angle) }
      ];
    },

    /**
     * Resets the line segment of the path of the bullet between time t and t+1,
     * relative to its points. Used for collision detection.
     */
    resetLineSegments: function() {
      this.lineSegments = [{ p1: this.points[0], p2: this.points[1] }];
    }
  };

  exports.Bullet = Bullet;
})(this);
