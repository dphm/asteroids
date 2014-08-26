;(function(exports) {
  function Alien(game, size) {
    this.game = game;
    this.color = game.COLORS.YELLOW;

    this.size = size;
    this.angle = game.validAngle();
    this.speed = 3 - size;

    // Set points and lines about alien center.
    this.center = game.randomPoint();
    this.resetPoints();
    this.resetLineSegments();

    // Record the last occurrence of shooting.
    this.lastShot = 0;

    // Increment the number of enemies in the game.
    this.game.numberOfEnemies++;
  }

  Alien.prototype = {
    /* Limit constants. */
    FIRING_LIMIT: 3000,
    FIRING_THRESHOLD: 0.5,

    /**
     * Updates the position of the alien.
     */
    update: function() {
      // Move center by speed and angle.
      this.game.trig.translatePoint(this.center, this.speed, this.angle);

      // Rest points and lines about the new center.
      this.resetPoints();
      this.resetLineSegments();

      // Wrap around if flying past the edges of the screen.
      this.game.wrapScreen(this);

      // Shoot once per FIRING_LIMIT milliseconds with a probability of FIRING_THRESHOLD.
      if (Date.now() - this.lastShot >= this.FIRING_LIMIT && Math.random() >= this.FIRING_THRESHOLD) {
        this.shoot();
      }
    },

    /**
     * Draws the alien on the screen.
     */
    draw: function(screen) {
      screen.lineWidth = 2;
      screen.strokeStyle = this.color;
      screen.fillStyle = this.game.color;

      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      for (var i = 1; i < this.points.length; i++) {
        screen.lineTo(this.points[i].x, this.points[i].y);
      }
      screen.closePath();
      screen.stroke();
      screen.fill();

      screen.lineWidth = 1;
      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      screen.lineTo(this.points[3].x, this.points[3].y);
      screen.closePath();
      screen.stroke();

      screen.lineWidth = 1;
      screen.beginPath();
      screen.moveTo(this.points[4].x, this.points[4].y);
      screen.lineTo(this.points[7].x, this.points[7].y);
      screen.closePath();
      screen.stroke();
    },

    /**
     * Handles events occurring upon the death of the alien.
     */
    die: function() {
      // Add points to the game score.
      switch(this.size) {
        case 2:
          this.game.addToScore(200);
          break;
        case 1:
          this.game.addToScore(1000);
          break;
      }

      // Remove the dead asteroid from the list of game bodies.
      this.game.removeBody(this);

      // Decrement the number of enemies in the game.
      this.game.numberOfEnemies--;
    },

    /**
     * Resets the points of the alien relative to its center.
     */
    resetPoints: function() {
      switch(this.size) {
        case 2:
          this.points = [
            { x: this.center.x -  22.5, y: this.center.y       },
            { x: this.center.x - 11.25, y: this.center.y + 7.5 },
            { x: this.center.x + 11.25, y: this.center.y + 7.5},
            { x: this.center.x +  22.5, y: this.center.y       },
            { x: this.center.x + 11.25, y: this.center.y - 7.5 },
            { x: this.center.x +   7.5, y: this.center.y -  15 },
            { x: this.center.x -   7.5, y: this.center.y -  15 },
            { x: this.center.x - 11.25, y: this.center.y - 7.5 }
          ];
          break;
        case 1:
          this.points = [
            { x: this.center.x - 18, y: this.center.y      },
            { x: this.center.x -  9, y: this.center.y +  6 },
            { x: this.center.x +  9, y: this.center.y +  6 },
            { x: this.center.x + 18, y: this.center.y      },
            { x: this.center.x +  9, y: this.center.y -  6 },
            { x: this.center.x +  6, y: this.center.y - 12 },
            { x: this.center.x -  6, y: this.center.y - 12 },
            { x: this.center.x -  9, y: this.center.y -  6 }
          ];
          break;
      }
    },

    /**
     * Resets the line segments of the alien relative to its points.
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
      // Default to a random angle.
      var angle = this.game.randomAngle();

      // Small aliens shoot toward the ship center.
      if (this.size === 1) {
        // Shooting error is proportional to the level of the game.
        var epsilon = Math.PI / (this.game.level * 6);
        epsilon = Math.random() >= 0.5 ? epsilon : -epsilon;
        angle = this.game.trig.angleToPoint(this.center, this.game.ship.center) + epsilon;
      }

      // Create a bullet at the center of the alien with the specified angle.
      var bullet = new Bullet({ x: this.center.x, y: this.center.y }, angle, this);
      this.game.addBody(bullet);

      // Update last occurrence of shooting.
      this.lastShot = Date.now();
    }
  };

  exports.Alien = Alien;
})(this);