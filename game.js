;(function() {
  var FULL_ROTATION = 2 * Math.PI;

  var Game = function(canvas) {
    var screen = canvas.getContext('2d');
    this.size = { x: canvas.width, y: canvas.height };

    this.bodies = [];
    this.addBody(new Ship(this));

    var self = this;
    var tick = function() {
      self.update();
      self.draw(screen);
      requestAnimationFrame(tick);
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      var self = this;
      function wrapScreen(body) {
        if (body.center.x < 0) {
          body.center.x = self.size.x;
        } else if (body.center.x > self.size.x) {
          body.center.x = 0;
        }

        if (body.center.y < 0) {
          body.center.y = self.size.y;
        } else if (body.center.y > self.size.y) {
          body.center.y = 0;
        }        
      }

      this.bodies.map(function(body) {
        body.update();
        wrapScreen(body);
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
    }
  };


  var Ship = function(game) {
    this.game = game;

    this.center = { x: game.size.x / 2, y: game.size.y / 2 };
    this.vertices = [
      { x:      this.center.x, y: this.center.y + 10 },
      { x: this.center.x - 10, y: this.center.y + 15 },
      { x:      this.center.x, y: this.center.y - 15 },
      { x: this.center.x + 11, y: this.center.y + 15 }
    ];

    this.angle = Math.PI / 2;
    this.deltaAngle = 5 * Math.PI / 180;
    this.maxLinearSpeed = 4;

    this.keyboarder = new Keyboarder();
  };

  Ship.prototype = {
    update: function() {
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.updateAngle(-this.deltaAngle);
        rotatePoints(this.vertices, this.center, -this.deltaAngle);
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.updateAngle(this.deltaAngle);
        rotatePoints(this.vertices, this.center, this.deltaAngle);
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        translatePoint(this.center, this.maxLinearSpeed, this.angle);
        translatePoints(this.vertices, this.maxLinearSpeed, this.angle);
      }
    },

    draw: function(screen) {
      screen.strokeStyle = '#eee';
      screen.beginPath();
      screen.moveTo(this.vertices[0].x, this.vertices[0].y);
      screen.lineTo(this.vertices[1].x, this.vertices[1].y);
      screen.lineTo(this.vertices[2].x, this.vertices[2].y);
      screen.lineTo(this.vertices[3].x, this.vertices[3].y);
      screen.closePath();
      screen.stroke();
    },

    updateAngle: function(deltaAngle) {
      this.angle = (this.angle - deltaAngle) % FULL_ROTATION;
    }
  };


  var Keyboarder = function() {
    this.KEYS = {
      SPACE: 32,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    }

    var keyState = {};

    window.onkeydown = function(e) {
      keyState[e.keyCode] = true;
    };

    window.onkeyup = function(e) {
      keyState[e.keyCode] = false;
    };

    this.isDown = function(keyCode) {
      return keyState[keyCode];
    };
  };


  function rotatePoint(point, center, angle) {
    var p = { x: point.x, y: point.y };
    point.x = Math.cos(angle) * (p.x - center.x) - Math.sin(angle) * (p.y - center.y) + center.x;
    point.y = Math.sin(angle) * (p.x - center.x) + Math.cos(angle) * (p.y - center.y) + center.y;
  };

  function rotatePoints(points, center, angle) {
    points.forEach(function(point) {
      rotatePoint(point, center, angle);
    });
  };

  function translatePoint(point, speed, angle) {
    point.x += speed * Math.cos(angle);
    point.y += speed * -Math.sin(angle);
  };

  function translatePoints(points, speed, angle) {
    points.forEach(function(point) {
      translatePoint(point, speed, angle);
    });
  };


  // Start game
  window.onload = function() {
    var canvas = document.getElementById('screen');
    new Game(canvas);
  };
})();
