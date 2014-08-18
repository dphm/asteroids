;(function(exports) {

  /* Constant: Angle of a full circle. */
  var FULL_ROTATION = 2 * Math.PI;

  /* Constructor to create an asteroid body in game. */
  var Asteroid = function(game, center, size) {
    this.game = game;
    this.center = center;
    this.angle = validAngle();
    this.speed = (4 - size) / 2;
    this.size = size;
    this.resetPoints();
    this.resetLineSegments();
    this.game.numberOfEnemies++;
  };

  /* Prototype object - contains all asteroid methods. */
  Asteroid.prototype = {

    /* Updates the position of the bullet's center, and resets points and lines based on new center. */
    update: function() {
      this.game.trig.translatePoint(this.center, this.speed, this.angle);
      this.resetPoints();
      this.resetLineSegments();
      /* Off-screen asteroids wrap around the screen, back into the canvas. */
      this.game.wrapScreen(this);
    },

    /* Draws the asteroid body on the screen. */
    draw: function(screen) {
      screen.lineWidth = 2;
      screen.strokeStyle = '#659893';
      screen.fillStyle = '#504b6a';
      screen.beginPath();
      /* Draws a path containing all the points of the asteroid. */
      screen.moveTo(this.points[0].x, this.points[0].y);
      for (var i = 1; i < this.points.length; i++) {
        screen.lineTo(this.points[i].x, this.points[i].y);
      }
      screen.closePath();
      screen.stroke();
      screen.fill();
    },

    /* Creates three smaller asteroids of size n-1 where n is the size of the asteroid being destroyed. */
    spawn: function() {
      for (var i = 0; i < 3; i++) {
        this.game.addBody(new Asteroid(this.game, { x: this.center.x, y: this.center.y }, this.size - 1));
      }
    },

    /* Creates 3 smaller asteroids once an asteroid of size 3 and 2 die. Asteroids of size 1 do not spawn 
    any new asteroids. Removes the destroyed asteroid from the game's list of bodies. */
    die: function() {
      if (this.size > 1) {
        this.spawn();
      }

      switch(this.size) {
        case 3:
          this.game.addToScore(20);
          break;
        case 2:
          this.game.addToScore(50);
          break;
        case 1:
          this.game.addToScore(100);
          break;
      }

      this.game.numberOfEnemies--;
      this.game.removeBody(this);
    },

    /* Represents the asteroid as a set of points specific to the asteroid's size. */
    resetPoints: function() {
      if (this.size === 3) {
        this.points = [
          { x: this.center.x -  7.5, y: this.center.y - 22.5 },
          { x: this.center.x - 22.5, y: this.center.y -   12 },
          { x: this.center.x -   18, y: this.center.y -    3 },
          { x: this.center.x - 25.5, y: this.center.y        },
          { x: this.center.x -   24, y: this.center.y +   15 },
          { x: this.center.x -  7.5, y: this.center.y + 22.5 },
          { x: this.center.x       , y: this.center.y +   15 },
          { x: this.center.x +  7.5, y: this.center.y + 22.5 },
          { x: this.center.x +   15, y: this.center.y +   12 },
          { x: this.center.x +   12, y: this.center.y +  4.5 },
          { x: this.center.x + 22.5, y: this.center.y        },
          { x: this.center.x +   12, y: this.center.y -   21 }
        ];
      } else if (this.size === 2) {
        this.points = [
          { x: this.center.x -  5, y: this.center.y - 15 },
          { x: this.center.x - 15, y: this.center.y -  8 },
          { x: this.center.x - 12, y: this.center.y -  2 },
          { x: this.center.x - 17, y: this.center.y      },
          { x: this.center.x - 16, y: this.center.y + 10 },
          { x: this.center.x -  5, y: this.center.y + 15 },
          { x: this.center.x     , y: this.center.y + 10 },
          { x: this.center.x +  5, y: this.center.y + 15 },
          { x: this.center.x + 10, y: this.center.y +  8 },
          { x: this.center.x +  8, y: this.center.y +  3 },
          { x: this.center.x + 15, y: this.center.y      },
          { x: this.center.x +  8, y: this.center.y - 14 }
        ];
      } else {
        this.points = [
          { x: this.center.x -  3.75, y: this.center.y - 11.25 },
          { x: this.center.x - 11.25, y: this.center.y -   6.0 },
          { x: this.center.x -   9.0, y: this.center.y -   1.5 },
          { x: this.center.x - 12.75, y: this.center.y         },
          { x: this.center.x -    12, y: this.center.y +   7.5 },
          { x: this.center.x -  3.75, y: this.center.y + 11.25 },
          { x: this.center.x        , y: this.center.y +   7.5 },
          { x: this.center.x +  3.75, y: this.center.y + 11.25 },
          { x: this.center.x +   7.5, y: this.center.y +     6 },
          { x: this.center.x +     6, y: this.center.y +  2.25 },
          { x: this.center.x + 11.25, y: this.center.y         },
          { x: this.center.x +     6, y: this.center.y -  10.5 }
        ];
      }
      
    },

    /* Represents the asteroid as line segments; this is used in collision detection. */
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

  /* Returns a random speed between 0 and 1. */
  function randomSpeed() {
    return Math.random();
  }

  /* Returns a random speed between 0 and 1. Bodies with speed less than 0.5 travel right to left. */
  function randomAngle() {
    return Math.random() * FULL_ROTATION;
  }

  /* Returns a random angle, avoiding ranges that may cause an asteroid to loop forever on a horizontal or vertical axis. */
  function validAngle() {
    /* Returns true if the given angle is in a bad range. */
    function inBadRange(angle) {
      var e = Math.PI / 36;
      var badRanges = [[0, 0 + e],
                       [Math.PI / 2 - e, Math.PI / 2 + e],
                       [Math.PI - e, Math.PI + e],
                       [3 * Math.PI / 2 - e, 3 * Math.PI / 2 + e],
                       [2 * Math.PI - e, 2 * Math.PI]];
      return badRanges.some(function(range) {
        return angle >= range[0] && angle <= range[1];
      });
    }
    /* Ensures that the angle returned is not in a bad range. */
    var angle = 0;
    do {
      angle = randomAngle();
    } while (inBadRange(angle))
    return angle;
  }

  exports.Asteroid = Asteroid;
})(this);