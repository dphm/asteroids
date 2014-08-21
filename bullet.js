;(function(exports) {
  /* Constructor to create a bullet body in game. */
  function Bullet(center, angle, creator) {
    this.game = creator.game;
    this.color = creator.color;
    this.center = { x: center.x, y: center.y };
    this.radius = 1;
    this.angle = angle;
    this.speed = 5;
    this.creator = creator;
    this.resetPoints();
    this.resetLineSegments();
  }

  /* Prototype object - contains all bullet methods. */
  Bullet.prototype = {
    /* Updates the position of the bullet's center, and resets points and lines based on new center */
    update: function() {
      this.game.trig.translatePoint(this.center, this.speed, this.angle);
      this.resetPoints();
      this.resetLineSegments();

      /* Kills the bullet that leave the screen */
      if (this.offScreen()) {
        this.die();
      }
    },

    /* Draws the bullet on the screen. */
    draw: function(screen) {
      screen.strokeStyle = this.color;
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, this.game.FULL_ROTATION);
      screen.stroke();
    },

    /* Removes the bullet from the game's list of bodies. */
    die: function() {
      this.game.removeBody(this);
    },

    /* Checks if the bullet's center is off screen */
    offScreen: function() {
      return this.center.x < 0 || this.center.x > this.game.size.x ||
             this.center.y < 0 || this.center.y > this.game.size.y;
    },

    /* Represents the bullet as the path of the bullet from time t to t+1. This two-point representation is
    necessary so collisions that occur between time t and t+1 are detected. */
    resetPoints: function() {
      this.points = [
        { x: this.center.x, y: this.center.y },
        { x: this.center.x + this.speed *  Math.cos(this.angle),
          y: this.center.y + this.speed * -Math.sin(this.angle) }
      ];
    },

    /* Line segment representation used in the calculation of line intersection between times t and t+1. */
    resetLineSegments: function() {
      this.lineSegments = [{ p1: this.points[0], p2: this.points[1] }];
    }
  };

  exports.Bullet = Bullet;
})(this);
