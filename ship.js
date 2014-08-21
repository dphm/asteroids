;(function(exports) {

  /* Constant: Angle of a full circle. */
  var FULL_ROTATION = 2 * Math.PI;

  /* Constructor to create a ship body in game. */
  function Ship(game) {
    this.game = game;

    /* Create a keyboard object to track button presses. */
    this.keyboarder = new Keyboarder();
    this.lastFired = 0;
    
    /* Create the ship in the center of the canvas. */
    this.resetCenter();
    this.resetPoints();
    this.resetLineSegments();
    
    /* Angle at which the ship is moving. Initialized to PI/2 */
    this.angle = Math.PI / 2;
    
    /* The difference in angle for every left or right keypress. */
    this.deltaAngle = 5 * Math.PI / 180;
    this.maxLinearSpeed = 4;
  }

  /* Prototype object - contains all ship methods. */
  Ship.prototype = {
    /* Updates the position of the ship's center, and resets points and lines based on new center. */
    update: function() {
      /* If the space bar is pressed, then the user can fire every .3 seconds. This adds bullet 
      bodies to the game. */
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE) &&
          Date.now() - this.lastFired >= 300) {
        var bullet = new Bullet({ x: this.points[2].x, y: this.points[2].y }, this.angle, this);
        this.game.addBody(bullet);
        this.lastFired = Date.now();
      }

      /* If left key is pressed, the ship angle is rotated counter-clockwise, indicated by a negative deltaAngle.
      Else, if the right key is pressed, the ship angle is rotated clockwise, indicated by a positive deltaAngle. */
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.updateAngle(-this.deltaAngle);
        this.game.trig.rotatePoints(this.points, this.center, -this.deltaAngle);
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.updateAngle(this.deltaAngle);
        this.game.trig.rotatePoints(this.points, this.center, this.deltaAngle);
      }

      /* If the up key is pressed, the ship moves forward with the the maxLinearSpeed and angle. */
      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.game.trig.translatePoint(this.center, this.maxLinearSpeed, this.angle);
        this.game.trig.translatePoints(this.points, this.maxLinearSpeed, this.angle);
      }

      /* When the ship goes off screen, it wraps around the screen back into the canvas. */
      this.game.wrapScreen(this);
    },

    /* Draws the asteroid body on the screen. */
    draw: function(screen) {
      screen.lineWidth = 1;
      screen.strokeStyle = '#acd268';
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
      console.log('Lives:', this.game.lives);
      if (this.game.lives > 0) {
        this.game.addBody(new Ship(this.game));
      }
      this.game.removeBody(this);
    },

    /* This changes the angle of the ship's movement, and ensures that it is between 0 and 2 PI. */
    updateAngle: function(deltaAngle) {
      this.angle = (this.angle - deltaAngle) % FULL_ROTATION;
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
    }
  };

  exports.Ship = Ship;
})(this);
