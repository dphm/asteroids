;(function() {
  /* Constant: Number of points needed to earn a life. */
  POINTS_TO_NEXT_LIFE = 10000;

  /* Constructor for a game that takes in a canvas element and draws a game on the screen. The game keeps 
  track of all living bodies. The initial game bodies are the ship and three asteroids. */
  function Game(canvas) {
    var self = this;
    var screen = canvas.getContext('2d');
    this.size = { x: canvas.width, y: canvas.height };
    this.color = '#504b6a';
    this.bodies = [];
    this.addBody(new Ship(this));
    this.numberOfEnemies = 0;
    this.lives = 3;
    this.score = 0;
    this.lastLife = 0;
    this.level = 1;
    this.startLevel();

    /* Main game tick function - an infinite game loop. */
    function tick() {
      /* Update game state. */ 
      self.update();

      /* Draw game bodies. */
      self.draw(screen);

      /* Add next tick to browser queue. */
      requestAnimationFrame(tick);
    }

    /* Call the first game tick. */
    tick();
  }

  /* Prototype object - contains all game methods. */
  Game.prototype = {
    FULL_ROTATION: 2 * Math.PI,

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

      /* Starts the next level if the current level has been completed. */
      if (this.levelCompleted()) {
        this.level++;
        this.startLevel();
      }

      /* Ends the game if there are no lives left. */
      if (this.lives <= 0) {
        this.over();
      }
    },

    /* Draws the game. */
    draw: function(screen) {
      screen.fillStyle = this.color;
      screen.fillRect(0, 0, this.size.x, this.size.y);
      this.bodies.map(function(body) {
        body.draw(screen);
      });

      /* Draws the ship lives. */
      for (var l = 0; l < this.lives; l++) {
        var points = [
          { x: 22.5       + 20 * l, y: 20 +   5 },
          { x: 22.5 - 5   + 20 * l, y: 20 + 7.5 },
          { x: 22.5       + 20 * l, y: 20 - 7.5 },
          { x: 22.5 + 5.5 + 20 * l, y: 20 + 7.5 }
        ];

        screen.lineWidth = 1;
        screen.strokeStyle = '#acd268';
        screen.beginPath();
        screen.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
          screen.lineTo(points[i].x, points[i].y);
        }
        screen.closePath();
        screen.stroke();
      }

      /* Draws the score and level. */
      screen.font = '16px Helvetica';
      screen.fillStyle = '#fdd284';
      screen.fillText('score: ' + this.score, 15, 50);
      screen.fillText('level: ' + this.level, 15, 70);
    },

    /* Adds a body to the list of game bodies. */
    addBody: function(body) {
      this.bodies.push(body);
    },

    /* Removes a body from the list of game bodies. */
    removeBody: function(body) {
      var i = this.bodies.indexOf(body);
      delete this.bodies[i];
      // this.bodies.splice(i, i);
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
      var shouldCollide = b1 instanceof Ship     && b2 instanceof Asteroid ||
                          b1 instanceof Asteroid && b2 instanceof Ship     ||
                          b1 instanceof Ship     && b2 instanceof Alien    ||
                          b1 instanceof Alien    && b2 instanceof Ship     ||
                          b1 instanceof Bullet   && b1.creator instanceof Ship  && !(b2 instanceof Ship) ||
                          b2 instanceof Bullet   && b2.creator instanceof Ship  && !(b1 instanceof Ship) ||
                          b1 instanceof Bullet   && b1.creator instanceof Alien &&   b2 instanceof Ship  ||
                          b2 instanceof Bullet   && b2.creator instanceof Alien &&   b1 instanceof Ship  ;

      if (shouldCollide) {
        var lines1 = b1.lineSegments;
        var lines2 = b2.lineSegments;
        for (var i = 0; i < lines1.length; i++) {
          for (var j = 0; j < lines2.length; j++) {
            var intersection = this.trig.lineIntersection(lines1[i], lines2[j]);
            if (intersection) {
              console.log(intersection);
              return true;
            }
          }
        }
      }
      return false;
    },

    /* Starts a new level. */
    startLevel: function() {
      /* Adds asteroids to the game list of bodies proportional to the level number. */
      for (var i = 0; i < this.level; i++) {
        this.addBody(
          new Asteroid(this, this.randomPoint(), 3)
        );
      }
      this.addBody(new Alien(this, 2));
      this.addBody(new Alien(this, 1));
    },

    /* Checks if the level has been completed. */
    levelCompleted: function() {
      return this.numberOfEnemies === 0;
    },

    /* Adds points to the game score. */
    addToScore: function(points) {
      this.score += points;

      /* Adds a life if it has been earned. */
      if (this.earnedLife()) {
        this.addLife();
        this.lastLife = Math.round(this.score / POINTS_TO_NEXT_LIFE) * POINTS_TO_NEXT_LIFE;
      }
    },

    /* Checks if player earned a life. One life is added for every 10,000 points. */
    earnedLife: function() {
      return this.score - this.lastLife >= POINTS_TO_NEXT_LIFE;
    },

    /* Increments the number of game lives. */
    addLife: function() {
      this.lives++;
    },

    /* Draws the game over screen. */
    over: function() {
      /* Stops updating the game. */
      this.update = function() {};
      this.draw = function(screen) {
        screen.fillStyle = '#659893';
        screen.fillRect(0, 0, this.size.x, this.size.y);

        screen.font = '20px Helvetica';
        screen.fillStyle = 'white';
        screen.fillText('game over', 250, 300);

        for (var i = 0; i < this.bodies.length; i++) {
          if (this.bodies[i] instanceof Ship) {
            this.bodies[i].draw(screen);
          }
        }

        /* Draws the score and level. */
        screen.font = '16px Helvetica';
        screen.fillStyle = '#fdd284';
        screen.fillText('score: ' + this.score, 250, 320);
      };
    },

    /* Returns a random point on the game screen. */
    randomPoint: function() {
      var randX = Math.random() * this.size.x;
      var randY = Math.random() * this.size.y;
      return { x: randX, y: randY };
    },

    /* Returns a random speed between 0 and 1. */
    randomSpeed: function() {
      return Math.random();
    },

    /* Returns a random speed between 0 and 1. Bodies with speed less than 0.5 travel right to left. */
    randomAngle: function() {
      return Math.random() * this.FULL_ROTATION;
    },

    /* Returns a random angle, avoiding ranges that may cause an asteroid to loop forever on a horizontal or vertical axis. */
    validAngle: function() {
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
        angle = this.randomAngle();
      } while (inBadRange(angle))
      return angle;
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
    }
  };

  /* Start game */
  window.onload = function() {
    var canvas = document.getElementById('screen');
    new Game(canvas);
  };
})();
