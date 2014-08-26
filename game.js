;(function() {
  function Game(canvas) {
    var screen = canvas.getContext('2d');
    this.size = { x: canvas.width, y: canvas.height };
    this.color = this.COLORS.PURPLE;
    
    this.bodies = [];
    this.ship = new Ship(this);
    this.addBody(this.ship);

    this.lives = 3;
    this.lastEarnedLife = 0;

    this.score = 0;
    this.level = 1;
    this.numberOfEnemies = 0;
    this.startLevel();

    var self = this;
    // Infinite game loop.
    function tick() {
      // Update game state.
      self.update();

      // Draw game bodies.
      self.draw(screen);

      // Add next tick to browser queue.
      requestAnimationFrame(tick);
    }

    // Call the first game tick.
    tick();
  }

  Game.prototype = {
    FULL_ROTATION: 2 * Math.PI,
    POINTS_TO_NEXT_LIFE: 10000,

    COLORS: {
      PURPLE: '#504b6a',
      TEAL:   '#659893',
      GREEN:  '#acd268',
      YELLOW: '#fdd284'
    },

    /**
     * Updates the state of the game.
     */
    update: function() {
      var self = this;

      // Check for collisions between any two bodies.
      self.bodies.forEach(function(b1) {
        self.bodies.forEach(function(b2) {
          if (self.colliding(b1, b2)) {
            b1.die();
            b2.die();
          }
        });

        // Update each body.
        b1.update();
      });

      // Start the next level if the current level has been completed.
      if (this.levelCompleted()) {
        this.level++;
        this.startLevel();
      }

      // Game over if there are no lives left.
      if (this.lives <= 0) {
        this.over();
      }
    },

    /**
     * Draws the game to the screen.
     */
    draw: function(screen) {
      screen.fillStyle = this.color;
      screen.fillRect(0, 0, this.size.x, this.size.y);

      // Draw each body.
      this.bodies.forEach(function(body) {
        body.draw(screen);
      });

      // Draw the ship lives.
      for (var l = 0; l < this.lives; l++) {
        var points = [
          { x: 22.5       + 20 * l, y: 20 +   5 },
          { x: 22.5 - 5   + 20 * l, y: 20 + 7.5 },
          { x: 22.5       + 20 * l, y: 20 - 7.5 },
          { x: 22.5 + 5.5 + 20 * l, y: 20 + 7.5 }
        ];

        screen.lineWidth = 1;
        screen.strokeStyle = this.COLORS.GREEN;
        screen.beginPath();
        screen.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
          screen.lineTo(points[i].x, points[i].y);
        }
        screen.closePath();
        screen.stroke();
      }

      // Draw the score and level.
      screen.font = '16px Helvetica';
      screen.fillStyle = this.COLORS.YELLOW;
      screen.fillText('score: ' + this.score, 15, 50);
      screen.fillText('level: ' + this.level, 15, 70);
    },

    /**
     * Adds a body to the list of game bodies.
     */
    addBody: function(body) {
      this.bodies.push(body);
    },

    /**
     * Removes a body from the list of game bodies.
     */
    removeBody: function(body) {
      var i = this.bodies.indexOf(body);
      delete this.bodies[i];
      // this.bodies.splice(i, i);
    },

    /**
     * Returns true if the body center is off-screen.
     */
    offScreen: function(body) {
      return body.center.x < 0 || body.center.x > this.size.x ||
             body.center.y < 0 || body.center.y > this.size.y;
    },

    /**
     * Wraps bodies around the screen while preserving the body's angle.
     */
    wrapScreen: function(body) {
      if (this.offScreen(body)) {
        // Wrap horizontally.
        if (body.center.x < 0) {
          body.center.x = this.size.x;
        } else if (body.center.x > this.size.x) {
          body.center.x = 0;
        }

        // Wrap vertically.
        if (body.center.y < 0) {
          body.center.y = this.size.y;
        } else if (body.center.y > this.size.y) {
          body.center.y = 0;
        }

        // Reset points and lines about the new center.
        body.resetPoints();
        body.resetLineSegments();

        // Maintain the body's angle.
        this.trig.rotatePoints(body.points, body.center,
                               -body.angle + Math.PI / 2);
      }
    },

    /**
     * Checks if two bodies are colliding.
     */
    colliding: function(b1, b2) {
      function friend(b) {
        return b instanceof Ship ||
               b instanceof Bullet && b.creator instanceof Ship;
      }

      function enemy(b) {
        return b instanceof Asteroid ||
               b instanceof Alien    ||
               b instanceof Bullet && b.creator instanceof Alien;
      }

      var shouldCollide = friend(b1) && enemy(b2) ||
                          friend(b2) && enemy(b1);

      if (shouldCollide) {
        var lines1 = b1.lineSegments;
        var lines2 = b2.lineSegments;
        for (var i = 0; i < lines1.length; i++) {
          for (var j = 0; j < lines2.length; j++) {
            var intersection = this.trig.lineIntersection(lines1[i], lines2[j]);
            if (intersection) {
              return true;
            }
          }
        }
      }
      return false;
    },

    /**
     * Starts the current level.
     */
    startLevel: function() {
      // Add asteroids to the list of game bodies.
      for (var i = 0; i < this.level; i++) {
        this.addBody(new Asteroid(this, this.randomPoint(), 3));
      }

      // Add aliens to the list of game bodies.
      if (this.level > 1) {
        this.addBody(new Alien(this, 2));
        this.addBody(new Alien(this, 1));
      }
    },

    /**
     * Returns true if the level has been completed.
     */
    levelCompleted: function() {
      return this.numberOfEnemies === 0;
    },

    /**
     * Adds points to the game score.
     */
    addToScore: function(points) {
      this.score += points;

      // Add a life if it has been earned.
      if (this.earnedLife()) {
        this.addLife();
        this.lastLife = Math.round(this.score / this.POINTS_TO_NEXT_LIFE) *
                        this.POINTS_TO_NEXT_LIFE;
      }
    },

    /**
     * Returns true if player earned a life.
     * One life is added for every POINTS_TO_NEXT_LIFE points.
     */
    earnedLife: function() {
      return this.score - this.lastLife >= this.POINTS_TO_NEXT_LIFE;
    },

    /**
     * Increments the number of game lives.
     */
    addLife: function() {
      this.lives++;
    },

    /**
     * Handles events occurring when the game is over.
     */
    over: function() {
      // Stop updating the game.
      this.update = function() {};

      // Draw the game over screen.
      this.draw = function(screen) {
        screen.fillStyle = this.COLORS.TEAL;
        screen.fillRect(0, 0, this.size.x, this.size.y);

        screen.font = '20px Helvetica';
        screen.fillStyle = 'white';
        screen.fillText('game over', 250, 300);

        // Draw the score and level.
        screen.font = '16px Helvetica';
        screen.fillStyle = this.COLORS.YELLOW;
        screen.fillText('score: ' + this.score, 250, 320);
      };
    },

    /**
     * Returns a random point on the game screen.
     */
    randomPoint: function() {
      var randX = Math.random() * this.size.x;
      var randY = Math.random() * this.size.y;
      return { x: randX, y: randY };
    },

    /**
     * Returns a random speed between 0 and 1.
     */
    randomSpeed: function() {
      return Math.random();
    },

    /**
     * Returns a random angle between 0 and 2 PI.
     */
    randomAngle: function() {
      return Math.random() * this.FULL_ROTATION;
    },

    /**
     * Returns a random angle, avoiding sharp horizontal or vertical axes.
     */
    validAngle: function() {
      /**
       * Returns true if the given angle is in a 'bad' range.
       */
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

      // Ensure that the angle returned is not in a 'bad' range.
      var angle = 0;
      do {
        angle = this.randomAngle();
      } while (inBadRange(angle))
      return angle;
    },

    // Set of trig utility functions.
    trig: {
      /**
       * Rotates a point about the center by the given angle.
       */
      rotatePoint: function(point, center, angle) {
        var p = { x: point.x, y: point.y };
        point.x = Math.cos(angle) * (p.x - center.x) - Math.sin(angle) * (p.y - center.y) + center.x;
        point.y = Math.sin(angle) * (p.x - center.x) + Math.cos(angle) * (p.y - center.y) + center.y;
      },

      /**
       * Performs rotatePoint on each point in points.
       */
      rotatePoints: function(points, center, angle) {
        var self = this;
        points.forEach(function(point) {
          self.rotatePoint(point, center, angle);
        });
      },

      /**
       * Moves a point with a certain speed and angle.
       */
      translatePoint: function(point, speed, angle) {
        point.x += speed * Math.cos(angle);
        point.y += speed * -Math.sin(angle);
      },

      /**
       * Performs translatePoint on each point in points.
       */
      translatePoints: function(points, speed, angle) {
        var self = this;
        points.forEach(function(point) {
          self.translatePoint(point, speed, angle);
        });
      },

      /**
       * Returns true if point p is on infinite line l.
       */
      pointOnLine: function(p, l) {
        var A = l.p2.y - l.p1.y;
        var B = l.p1.x - l.p2.x;
        var C = A * l.p1.x + B * l.p1.y;

        var d = Math.abs(A * p.x + B * p.y - C);
        var e = 1;

        return this.pointInBounds(p, l) && d < e;
      },

      /**
       * Returns true if point p is in the bounds of line segment l.
       */
      pointInBounds: function(p, l) {
        var x = p.x;
        var y = p.y;

        return x >= Math.min(l.p1.x, l.p2.x) &&
               x <= Math.max(l.p1.x, l.p2.x) &&
               y >= Math.min(l.p1.y, l.p2.y) &&
               y <= Math.max(l.p1.y, l.p2.y);
      },

      /**
       * Returns true if lines l1 and l2 intersect.
       */
      lineIntersection: function(l1, l2) {
        var A1 = l1.p2.y - l1.p1.y;
        var B1 = l1.p1.x - l1.p2.x;
        var C1 = A1 * l1.p1.x + B1 * l1.p1.y;

        var A2 = l2.p2.y - l2.p1.y;
        var B2 = l2.p1.x - l2.p2.x;
        var C2 = A2 * l2.p1.x + B2 * l2.p1.y;

        var det = A1 * B2 - A2 * B1;

        if (det === 0) {
          return null;
        } else {
          var x = (B2 * C1 - B1 * C2) / det;
          var y = (A1 * C2 - A2 * C1) / det;
          var intersection = { x: x, y: y };
          
          if (this.pointInBounds(intersection, l1) && 
              this.pointInBounds(intersection, l2)) {
            return intersection;
          }
        }
      },

      /**
       * Returns the coordinates of the given point relative to the given origin.
       */
      relativeCoordinates: function(origin, point) {
        return { x: point.x - origin.x, y: point.y - origin.y };
      },

      /**
       * Returns the quadrant of the given relative point.
       */
      relativeQuadrant: function(relativePoint) {
        if (relativePoint.y <= 0) {
          return relativePoint.x <= 0 ? 2 : 1;
        } else {
          return relativePoint.x <= 0 ? 3 : 4;
        }
      },

      /**
       * Returns the angle from the origin to the point in radians.
       */
      angleToPoint: function(origin, point) {
        var rel = this.relativeCoordinates(origin, point);
        var quadrant = this.relativeQuadrant(rel);
        var angle = Math.atan(-rel.y / rel.x);
        switch (quadrant) {
          case 1:
            return angle;
          case 2:
            return angle + Math.PI;
          case 3:
            return angle + Math.PI;
          case 4:
            return angle + 2 * Math.PI;
          default:
            return Game.prototype.randomAngle();
        }
      }
    }
  };

  // Start game.
  window.onload = function() {
    var canvas = document.getElementById('screen');
    new Game(canvas);
  };
})();
