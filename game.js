;(function() {
  /* Constructor for a game that takes in a canvas element and draws a game on the screen. The game keeps 
  track of all living bodies. The initial game bodies are the ship and three asteroids. */
  var Game = function(canvas) {
    var self = this;
    var screen = canvas.getContext('2d');
    this.size = { x: canvas.width, y: canvas.height };

    this.lives = 3;

    this.bodies = [];
    this.addBody(new Ship(this));
    for (var i = 0; i < 1; i++) {
      this.addBody(
        new Asteroid(this, { x: Math.random() * self.size.x,
                             y: Math.random() * self.size.y }, 3)
      );
    }

    /* Main game tick function - an infinite game loop. */
    var tick = function() {
      /* Update game state. */ 
      self.update();
      /* Draw game bodies. */
      self.draw(screen);
      /* Add next tick to browser queue. */
      requestAnimationFrame(tick);
    };
    /* Call up the first game tick. */
    tick();
  };

  /* Prototype object - contains all game methods. */
  Game.prototype = {
    /* Updates the state of the game. */
    update: function() {
      var self = this;
      /* Checks for collisions between any two existant bodies. */
      self.bodies.forEach(function(b1) {
        self.bodies.forEach(function(b2) {
          if (self.colliding(b1, b2)) {
            if (b1 instanceof Ship && b2 instanceof Asteroid) {
              /* Kills the ship. */
              b1.die();
            } else if (b1 instanceof Asteroid && b2 instanceof Ship) {
              /* Kills the ship. */
              b2.die();
            } else {
              /* Kills the colliding bodies. */
              b1.die();
              b2.die();
            }
          }
        });
        /* Updates all the bodies. */
        b1.update();
      });

      if (this.lives <= 0) {
        this.over();
      }
    },

    /* Draws the game. */
    draw: function(screen) {
      screen.fillStyle = 'black';
      screen.fillRect(0, 0, this.size.x, this.size.y);
      this.bodies.map(function(body) {
        body.draw(screen);
      });

      screen.font = '16px Helvetica';
      screen.fillStyle = 'gray';
      screen.fillText('lives: ' + this.lives, 15, 25);
    },

    /* Adds a body to the list of game bodies. */
    addBody: function(body) {
      this.bodies.push(body);
    },

    /* Wraps bodies around the screen by moving the center of an offscreen body
    to the other side of the screen while preserving the body's angle and speed. */
    wrapScreen: function(body) {
      var self = this;
      function wrapPoints() {
        body.resetPoints();
        body.resetLineSegments();
        self.trig.rotatePoints(body.points, body.center, -body.angle + Math.PI / 2);
      }

      if (body.center.x < 0) {
        body.center.x = this.size.x;
        wrapPoints();
      } else if (body.center.x > this.size.x) {
        body.center.x = 1;
        wrapPoints();
      }

      if (body.center.y < 0) {
        body.center.y = this.size.y;
        wrapPoints();
      } else if (body.center.y > this.size.y) {
        body.center.y = 1;
        wrapPoints();
      }
    },

    /* Checks if two bodies are colliding. */
    colliding: function(b1, b2) {
      var self = this;
      if (b1 instanceof Ship && b2 instanceof Asteroid ||
          b1 instanceof Asteroid && b2 instanceof Ship ||
          b1 instanceof Bullet && !(b2 instanceof Ship) ||
          !(b1 instanceof Ship) && b2 instanceof Bullet) {
        var lines1 = b1.lineSegments;
        var lines2 = b2.lineSegments;
        for (var i = 0; i < lines1.length; i++) {
          for (var j = 0; j < lines2.length; j++) {
            var intersection = self.trig.lineIntersection(lines1[i], lines2[j]);
            if (intersection) {
              console.log(intersection);
              return true;
            }
          }
        }
      }
      return false;
    },

    /* Set of trig utility functions. */
    trig: {
      /* Rotates a point about the center point by some angle. */
      rotatePoint: function(point, center, angle) {
        var p = { x: point.x, y: point.y };
        point.x = Math.cos(angle) * (p.x - center.x) - Math.sin(angle) * (p.y - center.y) + center.x;
        point.y = Math.sin(angle) * (p.x - center.x) + Math.cos(angle) * (p.y - center.y) + center.y;
      },

      /* Maps rotatePoint on a set of points. */
      rotatePoints: function(points, center, angle) {
        var self = this;
        points.forEach(function(point) {
          self.rotatePoint(point, center, angle);
        });
      },

      /* Moves a point with a certain speed and angle. */
      translatePoint: function(point, speed, angle) {
        point.x += speed * Math.cos(angle);
        point.y += speed * -Math.sin(angle);
      },

      /* Maps translatePoint on a set of points. */
      translatePoints: function(points, speed, angle) {
        var self = this;
        points.forEach(function(point) {
          self.translatePoint(point, speed, angle);
        });
      },

      /* Checks if point p is on infinite line l. */
      pointOnLine: function(p, l) {
        var A = l.p2.y - l.p1.y;
        var B = l.p1.x - l.p2.x;
        var C = A * l.p1.x + B * l.p1.y;

        var d = Math.abs(A * p.x + B * p.y - C);
        var e = 1;

        return this.pointInBounds(p, l) && d < e;
      },

      /* Checks if point p is in line segment l. */
      pointInBounds: function(p, l) {
        var x = p.x;
        var y = p.y;

        return x >= Math.min(l.p1.x, l.p2.x) &&
               x <= Math.max(l.p1.x, l.p2.x) &&
               y >= Math.min(l.p1.y, l.p2.y) &&
               y <= Math.max(l.p1.y, l.p2.y);
      },

      /* Checks if lines l1 and l2 intersect. */
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
          
          if (this.pointInBounds(intersection, l1) && this.pointInBounds(intersection, l2)) {
            return intersection;
          }
        }
      }
    },

    /* Draws the game over screen. */
    over: function() {
      var self = this;
      /* Stops updating the game. */
      this.update = function() {};
      this.draw = function(screen) {
        screen.fillStyle = 'gray';
        screen.fillRect(0, 0, this.size.x, this.size.y);

        screen.font = '20px Helvetica';
        screen.fillStyle = 'white';
        screen.fillText('game over', 250, 300);

        for (var i = 0; i < this.bodies.length; i++) {
          if (this.bodies[i] instanceof Ship) {
            this.bodies[i].draw(screen);
          }
        }
      };
    }
  };

  /* Start game */
  window.onload = function() {
    var canvas = document.getElementById('screen');
    new Game(canvas);
  };
})();
