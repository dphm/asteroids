;(function(exports) {
  function Steroid(game, center) {
    this.game = game;
    this.color = game.COLORS.TEAL;

    this.angle = game.validAngle(); // 'Good' random angle.
    this.speed = 1;

    // Set points and line segments about steroid center.
    this.center = center;
    this.resetPoints();
    this.resetLineSegments();
    
    // Increment the number of enemies in the game.
    this.game.numberOfEnemies++;
  }

  Steroid.prototype = {
    /**
     * Updates the position of the steroid.
     */
    update: function() {
      // Move center by speed and angle.
      this.game.trig.translatePoint(this.center, this.speed, this.angle);

      // Reset points and lines about new center.
      this.resetPoints();
      this.resetLineSegments();
    },

    /**
     * Draws the steroid on the screen.
     */
    draw: function(screen) {
      screen.lineWidth = 1;
      screen.strokeStyle = this.color;
      screen.fillStyle = this.game.color;
      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      for (var i = 1; i < this.points.length; i++) {
        screen.lineTo(this.points[i].x, this.points[i].y);
      }
      screen.closePath();
      screen.stroke();

      screen.beginPath();
      screen.moveTo(this.points[1].x, this.points[1].y);
      screen.lineTo(this.points[14].x, this.points[14].y);
      screen.closePath();
      screen.stroke();

      screen.beginPath();
      screen.moveTo(this.points[17].x, this.points[17].y);
      screen.lineTo(this.points[0].x, this.points[0].y);
      screen.closePath();
      screen.stroke();

      screen.beginPath();
      screen.moveTo(this.points[18].x, this.points[18].y);
      screen.lineTo(this.points[24].x, this.points[24].y);
      screen.closePath();
      screen.stroke();

      screen.beginPath();
      screen.moveTo(this.points[13].x - 1, this.points[13].y - 1);
      screen.lineTo(this.points[14].x, this.points[14].y - 2);
      screen.closePath();
      screen.stroke();
      screen.fill();
    },

    /**
     * Creates another steroid and adds it to the list of game bodies
     * if the number of enemies has not exceeded the maximum.
     */
    spawn: function() {
      if (this.game.numberOfEnemies < this.game.MAX_NUM_OF_ENEMIES) {
        this.game.addBody(new Steroid(this.game, { x: this.center.x,
                                                   y: this.center.y }));
      }
    },

    /**
     * Handles events occurring upon the destruction of the steroid.
     */
    collide: function() {
      this.spawn();
    },

    /**
     * Resets the points of the steroid relative to its center.
     */
    resetPoints: function() {
      this.points = [
        { x: this.center.x +     0, y: this.center.y +     0 }, // 0
        { x: this.center.x + -15.5, y: this.center.y +   8.5 }, // 1
        { x: this.center.x + -15.5, y: this.center.y +  -8.5 }, // 2
        { x: this.center.x + -15.5, y: this.center.y +   8.5 }, // 3
        { x: this.center.x + -31.5, y: this.center.y +     0 }, // 4
        { x: this.center.x + -47.5, y: this.center.y +   8.5 }, // 5
        { x: this.center.x + -47.5, y: this.center.y +  25.5 }, // 6
        { x: this.center.x + -59.5, y: this.center.y +    32 }, // 7
        { x: this.center.x + -47.5, y: this.center.y +  25.5 }, // 8
        { x: this.center.x + -47.5, y: this.center.y +  26.5 }, // 9
        { x: this.center.x +   -47, y: this.center.y +  26.5 }, // 10
        { x: this.center.x +   -59, y: this.center.y +  33.5 }, // 11
        { x: this.center.x +   -47, y: this.center.y +  26.5 }, // 12
        { x: this.center.x + -31.5, y: this.center.y +  33.5 }, // 13
        { x: this.center.x + -15.5, y: this.center.y +  26.5 }, // 14
        { x: this.center.x +     0, y: this.center.y +  33.5 }, // 15
        { x: this.center.x +  14.5, y: this.center.y +  26.5 }, // 16
        { x: this.center.x +  14.5, y: this.center.y +   8.5 }, // 17
        { x: this.center.x +    29, y: this.center.y +     0 }, // 18
        { x: this.center.x +    45, y: this.center.y +     5 }, // 19
        { x: this.center.x +    55, y: this.center.y +    -9 }, // 20
        { x: this.center.x +  45.5, y: this.center.y + -22.5 }, // 21
        { x: this.center.x +  49.5, y: this.center.y + -35.5 }, // 22
        { x: this.center.x +  45.5, y: this.center.y + -22.5 }, // 23
        { x: this.center.x +    29, y: this.center.y + -17.5 }, // 24
        { x: this.center.x +    29, y: this.center.y +   -34 }, // 25
        { x: this.center.x +    29, y: this.center.y + -17.5 }, // 26
        { x: this.center.x +  14.5, y: this.center.y +   -26 }, // 27
        { x: this.center.x +     0, y: this.center.y + -17.5 }  // 28
      ];
    },

    /**
     * Resets the line segments of the steroid, relative to its points.
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
    }
  };

  exports.Steroid = Steroid;
})(this);