;(function(exports) {
  function Ship(game) {
    this.game = game;
    this.color = game.COLORS.GREEN;
    this.created = Date.now();

    this.angle = Math.PI / 2;
    this.speed = 0;

    // Set points and lines about the ship center.
    this.resetCenter();
    this.resetPoints();
    this.resetLineSegments();

    // Create a keyboard object to track button presses.
    this.keyboarder = new Keyboarder();

    // Record the last occurrence of rate-limited events.
    this.lastFired = 0;
    this.lastAccelerated = 0;
    this.lastJumpedIntoHyperspace = 0;
  }

  Ship.prototype = {
    // Movement constants.
    DELTA_ANGLE: 5 * Math.PI / 180,
    DELTA_SPEED: 1,
    MAX_LINEAR_SPEED: 6,
    DECELERATION_DELAY: 100,

    // Limit constants.
    FIRING_LIMIT: 300,
    HYPERSPACE_LIMIT: 3000,

    /**
     * Updates the position, angle, and speed of the ship.
     */
    update: function() {
      var now = Date.now();

      // Shoot up to once per FIRING_LIMIT milliseconds.
      if (this.shooting() && now - this.lastFired >= this.FIRING_LIMIT) {
        this.shoot();
      }

      // Rotate counter-clockwise by negative DELTA_ANGLE.
      if (this.turningLeft()) {
        this.updateAngle(-this.DELTA_ANGLE);
        this.game.trig.rotatePoints(this.points, this.center, -this.DELTA_ANGLE);
      }

      // Rotate clockwise by positive DELTA_ANGLE.
      if (this.turningRight()) {
        this.updateAngle(this.DELTA_ANGLE);
        this.game.trig.rotatePoints(this.points, this.center, this.DELTA_ANGLE);
      }

      if (this.accelerating()) {
        // Accelerate by positive DELTA_SPEED up to MAX_LINEAR_SPEED.
        if (this.speed < this.MAX_LINEAR_SPEED) {
          this.updateSpeed(this.DELTA_SPEED);
        }

        // Update last occurrence of acceleration.
        this.lastAccelerated = now;
      } else {
        // Decelerate by negative DELTA_SPEED after DECELERATION_DELAY milliseconds.
        if (this.speed > 0 && now - this.lastAccelerated >= this.DECELERATION_DELAY) {
          this.updateSpeed(-this.DELTA_SPEED / 4);
        }
      }

      // Jump into hyperspace up to once per HYPERSPACE_LIMIT milliseconds.
      var canJump = now - this.lastJumpedIntoHyperspace >= this.HYPERSPACE_LIMIT;
      if (this.jumpingIntoHyperspace() && canJump) {
        // Move center to a random point.
        this.center = this.game.randomPoint();

        // Reset points and lines about new center.
        this.resetPoints();
        this.resetLineSegments();

        // Maintain the angle of rotation.
        this.game.trig.rotatePoints(this.points, this.center,
                                    -this.angle + Math.PI / 2);

        // Update last occurrence of hyperspace jump.
        this.lastJumpedIntoHyperspace = now;
      }

      // Move by speed and angle.
      this.game.trig.translatePoint(this.center, this.speed, this.angle);
      this.game.trig.translatePoints(this.points, this.speed, this.angle);
    },

    /**
     * Draws the ship on the screen.
     */
    draw: function(screen) {
      var now = Date.now();
      screen.lineWidth = 1;
      screen.strokeStyle = this.color;

      var FLASH_TIME = 300;
      var onCreation = now - this.created <= FLASH_TIME;
      var onHyperspace = now - this.lastJumpedIntoHyperspace <= FLASH_TIME;

      // Flash lines on creation or on hyperspace jump.
      if ((onCreation || onHyperspace) && now % 5 > 0) {
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

    /**
     * Handles events occurring upon the destruction of the ship.
     */
    collide: function() {
    },

    /**
     * Updates ship angle by deltaAngle, and ensures angle is between 0 and 2 PI.
     */
    updateAngle: function(deltaAngle) {
      this.angle = (this.angle - deltaAngle) % this.game.FULL_ROTATION;
    },

    /**
     * Updates ship speed by deltaSpeed.
     */
    updateSpeed: function(deltaSpeed) {
      this.speed += deltaSpeed;
    },

    /**
     * Moves ship center to the center of the screen.
     */
    resetCenter: function() {
      this.center = { x: this.game.size.x / 2, y: this.game.size.y / 2 };
    },

    /**
     * Resets the points of the ship relative to its center.
     */
    resetPoints: function() {
      this.points = [
        { x: this.center.x     , y: this.center.y + 10 },
        { x: this.center.x - 10, y: this.center.y + 15 },
        { x: this.center.x     , y: this.center.y - 15 },
        { x: this.center.x + 11, y: this.center.y + 15 }
      ];
    },

    /**
     * Resets the line segments of the ship relative to its points.
     * Used in collision detection.
     */
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

    /**
     * Adds a bullet to the list of game bodies.
     */
    shoot: function() {
      // Create a bullet at the nose of the ship with the angle of the ship.
      var bullet = new Bullet({ x: this.points[2].x, y: this.points[2].y },
                              this.angle, this);
      this.game.addBody(bullet);

      // Update last occurrence of shooting.
      this.lastFired = Date.now();
    },

    /**
     * Returns true if the SPACE key is being pressed.
     */
    shooting: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.SPACE);
    },

    /**
     * Returns true if the LEFT key is being pressed.
     */
    turningLeft: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.LEFT);
    },

    /**
     * Returns true if the RIGHT key is being pressed.
     */
    turningRight: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT);
    },

    /**
     * Returns true if the UP key is being pressed.
     */
    accelerating: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.UP);
    },

    /**
     * Returns true if the DOWN key is being pressed.
     */
    jumpingIntoHyperspace: function() {
      return this.keyboarder.isDown(this.keyboarder.KEYS.DOWN);
    }
  };

  exports.Ship = Ship;
})(this);
