;(function(exports) {
  function Asteroid(game, center, size) {
    this.game = game;
    this.color = game.COLORS.TEAL;

    this.size = size;
    this.angle = game.validAngle(); // 'Good' random angle.
    this.speed = (4 - size) / 2;    // Inversely proportional to size.

    // Set points and line segments about asteroid center.
    this.center = center;
    this.resetPoints();
    this.resetLineSegments();
    
    // Increment the number of enemies in the game.
    this.game.numberOfEnemies++;
  }

  Asteroid.prototype = {
    /**
     * Updates the position of the asteroid.
     */
    update: function() {
      // Move center by speed and angle.
      this.game.trig.translatePoint(this.center, this.speed, this.angle);

      // Reset points and lines about new center.
      this.resetPoints();
      this.resetLineSegments();
    },

    /**
     * Draws the asteroid on the screen.
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
    },

    /**
     * Creates three asteroids of size n-1 where n is the size of the asteroid
     * being destroyed, and adds them to the list of game bodies.
     */
    spawn: function() {
      for (var i = 0; i < 3; i++) {
        this.game.addBody(new Asteroid(this.game, { x: this.center.x, y: this.center.y }, this.size - 1));
      }
    },

    /**
     * Handles events occurring upon the destruction of the asteroid.
     */
    die: function() {
      // Spawn smaller asteroids if size 2 or 3
      if (this.size > 1) {
        this.spawn();
      }

      // Add points to the game score.
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

      // Remove the dead asteroid from the list of game bodies.
      this.game.removeBody(this);

      // Decrement the number of enemies in the game.
      this.game.numberOfEnemies--;
    },

    /**
     * Resets the points of the asteroid relative to its center.
     */
    resetPoints: function() {
      switch(this.size) {
        case 3:
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
          break;
        case 2:
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
          break;
        case 1:
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
          break;
      }
      
    },

    /**
     * Resets the line segments of the asteroid, relative to its points.
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

  exports.Asteroid = Asteroid;
})(this);