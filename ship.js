;(function(exports) {
  /* Constructor to create a ship body in game. */
  function Ship(game) {
    this.game = game;
    this.color = game.COLORS.GREEN;
    this.created = Date.now();

    /* Create a keyboard object to track button presses. */
    this.keyboarder = new Keyboarder();
    this.lastFired = 0;
    this.lastAccelerated = 0;
    this.lastWentIntoHyperspace = 0;
    
    /* Create the ship in the center of the canvas. */
    this.resetCenter();
    this.resetPoints();
    this.resetLineSegments();
    
    /* Angle at which the ship is moving. Initialized to PI/2 */
    this.angle = Math.PI / 2;
    this.speed = 0;
  }

  /* Prototype object - contains all ship methods. */
  Ship.prototype = {
    /* Movement and shooting constants. */
    DELTA_ANGLE: 5 * Math.PI / 180,
    DELTA_SPEED: 1,
    MAX_LINEAR_SPEED: 6,
    DECELERATION_DELAY: 100,
    HYPERSPACE_LIMIT: 3000,
    FIRING_LIMIT: 300,

    /* Updates the position of the ship's center, and resets points and lines based on new center. */
    update: function() {
      var now = Date.now();

      /* If the space bar is pressed, then the user adds a bullet to the game every FIRING_LIMIT milliseconds. */
      if (this.shooting() && now - this.lastFired >= this.FIRING_LIMIT) {
        var bullet = new Bullet({ x: this.points[2].x, y: this.points[2].y }, this.angle, this);
        this.game.addBody(bullet);
        this.lastFired = now;
      }

      /* If left key is pressed, the ship angle is rotated counter-clockwise, indicated by a negative DELTA_ANGLE. */
      if (this.turningLeft()) {
        this.updateAngle(-this.DELTA_ANGLE);
        this.game.trig.rotatePoints(this.points, this.center, -this.DELTA_ANGLE);
      }

      /* If the right key is pressed, the ship angle is rotated clockwise, indicated by a positive DELTA_ANGLE. */
      if (this.turningRight()) {
        this.updateAngle(this.DELTA_ANGLE);
        this.game.trig.rotatePoints(this.points, this.center, this.DELTA_ANGLE);
      }

      /* If the up key is pressed, the ship accelerates by DELTA_SPEED up to the MAX_LINEAR_SPEED. */
      if (this.accelerating()) {
        if (this.speed < this.MAX_LINEAR_SPEED) {
          this.updateSpeed(this.DELTA_SPEED);
        }
        this.lastAccelerated = now;
      } else {
        if (this.speed > 0 && now - this.lastAccelerated >= this.DECELERATION_DELAY) {
          this.updateSpeed(-this.DELTA_SPEED);
        }
      }

      /* If the down key is pressed, the ship is moved to a random point on the game screen.
      Hyperspace can only be used every 3 seconds. */
      if (this.jumpingIntoHyperspace() && now - this.lastWentIntoHyperspace >= this.HYPERSPACE_LIMIT) {
        this.center = this.game.randomPoint();
        this.resetPoints();
        this.resetLineSegments();
        this.game.trig.rotatePoints(this.points, this.center, -this.angle + Math.PI / 2);
        this.lastWentIntoHyperspace = now;
      }

      /* Move ship by speed and angle. */
      this.game.trig.translatePoint(this.center, this.speed, this.angle);
      this.game.trig.translatePoints(this.points, this.speed, this.angle);

      /* When the ship goes off screen, it wraps around the screen back into the canvas. */
      this.game.wrapScreen(this);
    },

    /* Draws the ship body on the screen. */
    draw: function(screen) {
      screen.lineWidth = 1;
      var now = Date.now();
      screen.strokeStyle = this.color;

      /* Flash ship on creation. */
      if (now - this.created <= 300 && now % 5 > 0) {
        screen.strokeStyle = this.game.color;
      }

      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      for (var i = 1; i < this.points.length; i++) {
        screen.lineTo(this.points[i].x, this.points[i].y);
      }
      screen.closePath();
      screen.stroke();
    },

    /* When the ship dies, the number of game lives is decremented and the ship is removed from the game list of bodies. */
    die: function() {
      this.game.lives--;
      if (this.game.lives > 0) {
        this.game.ship = new Ship(this.game);
        this.game.addBody(this.game.ship);
      }
      this.game.removeBody(this);
    },

    /* This changes the angle of the ship's movement, and ensures that it is between 0 and 2 PI. */
    updateAngle: function(deltaAngle) {
      this.angle = (this.angle - deltaAngle) % this.game.FULL_ROTATION;
    },

    /* Updates the speed by DELTA_SPEED. */
    updateSpeed: function(deltaSpeed) {
      this.speed += deltaSpeed;
    },

    /* Moves center of the ship to the center of the screen. */
    resetCenter: function() {
      this.center = { x: this.game.size.x / 2, y: this.game.size.y / 2 };
    },

    /* Represents the ship as a set of points. */
    resetPoints: function() {
      this.points = [
        { x: this.center.x     , y: this.center.y + 10 },
        { x: this.center.x - 10, y: this.center.y + 15 },
        { x: this.center.x     , y: this.center.y - 15 },
        { x: this.center.x + 11, y: this.center.y + 15 }
      ];
    },

    /* Represents the ship as a set of line segments; this is used in collision detection. */
    resetLineSegments: function() {
      this.lineSegments = [];
      var self = this;
      this.points.forEach(function(point, i, points) {
        if (i !== points.length - 1) {
          self.lineSegments.push({ p1: points[i], p2: points[i + 1] });
        } else {
          self.lineSegments.push({ p1: points[i], p2: points[0] });
        }
      });
    },

    shooting: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.SPACE);
    },

    turningLeft: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.LEFT);
    },

    turningRight: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT);
    },

    accelerating: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.UP);
    },

    jumpingIntoHyperspace: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.DOWN);
    }
  };

  exports.Ship = Ship;
})(this);
