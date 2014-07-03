;(function() {
  var Game = function(canvas) {
    var self = this;
    var screen = canvas.getContext('2d');
    this.size = { x: canvas.width, y: canvas.height };

    this.bodies = [];
    this.addBody(new Ship(this));
    for (var i = 0; i < 5; i++) {
      this.addBody(
        new Asteroid(this, { x: Math.random() * self.size.x,
                             y: Math.random() * self.size.y })
      );
    }

    this.frame = 0;
    var tick = function() {
      self.frame = (self.frame + 1) % 3600;

      self.update();
      self.draw(screen);
      requestAnimationFrame(tick);
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      var self = this;

      self.bodies.forEach(function(b1) {
        self.bodies.forEach(function(b2) {
          if (self.colliding(b1, b2)) {
            b1.die();
            b2.die();
          }
        });

        b1.update();
      });
    },

    draw: function(screen) {
      screen.fillStyle = 'black';
      screen.fillRect(0, 0, this.size.x, this.size.y);

      this.bodies.map(function(body) {
        body.draw(screen);
      });
    },

    addBody: function(body) {
      this.bodies.push(body);
    },

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
        body.center.x = 0;
        wrapPoints();
      }

      if (body.center.y < 0) {
        body.center.y = this.size.y;
        wrapPoints();
      } else if (body.center.y > this.size.y) {
        body.center.y = 0;
        wrapPoints();
      }
    },

    colliding: function(b1, b2) {
      var self = this;

      if (b1 instanceof Ship && b2 instanceof Asteroid ||
          b1 instanceof Asteroid && b2 instanceof Ship) {
        var lines1 = b1.lineSegments;
        var lines2 = b2.lineSegments;
        for (var i = 0; i < lines1.length; i++) {
          for (var j = 0; j < lines2.length; j++) {
            var intersection = self.trig.intersection(lines1[i], lines2[j]);
            if (intersection) return true;
          }
        }
      }

      return false;
    },

    trig: {
      rotatePoint: function(point, center, angle) {
        var p = { x: point.x, y: point.y };
        point.x = Math.cos(angle) * (p.x - center.x) - Math.sin(angle) * (p.y - center.y) + center.x;
        point.y = Math.sin(angle) * (p.x - center.x) + Math.cos(angle) * (p.y - center.y) + center.y;
      },

      rotatePoints: function(points, center, angle) {
        var self = this;
        points.forEach(function(point) {
          self.rotatePoint(point, center, angle);
        });
      },

      translatePoint: function(point, speed, angle) {
        point.x += speed * Math.cos(angle);
        point.y += speed * -Math.sin(angle);
      },

      translatePoints: function(points, speed, angle) {
        var self = this;
        points.forEach(function(point) {
          self.translatePoint(point, speed, angle);
        });
      },

      pointOnLine: function(p, l) {
        var x = p.x;
        var y = p.y;

        return x >= Math.min(l.p1.x, l.p2.x) &&
               x <= Math.max(l.p1.x, l.p2.x) &&
               y >= Math.min(l.p1.y, l.p2.y) &&
               y <= Math.max(l.p1.y, l.p2.y);
      },

      intersection: function(l1, l2) {
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
          var x = Math.floor((B2 * C1 - B1 * C2) / det);
          var y = Math.floor((A1 * C2 - A2 * C1) / det);
          var intersection = { x: x, y: y };
          
          if (this.pointOnLine(intersection, l1) && this.pointOnLine(intersection, l2)) {
            return intersection;
          }
        }
      }
    },

    over: function() {
      var self = this;
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

  // Start game
  window.onload = function() {
    var canvas = document.getElementById('screen');
    new Game(canvas);
  };
})();
