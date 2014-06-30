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

    var tick = function() {
      self.update();
      self.draw(screen);
      requestAnimationFrame(tick);
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      this.bodies.map(function(body) {
        body.update();
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
      }
    }
  };

  // Start game
  window.onload = function() {
    var canvas = document.getElementById('screen');
    new Game(canvas);
  };
})();
