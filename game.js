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
      function wrapPoints() {
        body.resetPoints();
        rotatePoints(body.points, body.center, -body.angle + Math.PI / 2);
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
    }
  };


  var Ship = function(game) {
    this.game = game;
    this.keyboarder = new Keyboarder();

    this.center = { x: game.size.x / 2, y: game.size.y / 2 };
    this.resetPoints();

    this.angle = Math.PI / 2;
    this.deltaAngle = 5 * Math.PI / 180;
    this.maxLinearSpeed = 4;
  };

  Ship.prototype = {
    update: function() {
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.updateAngle(-this.deltaAngle);
        rotatePoints(this.points, this.center, -this.deltaAngle);
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.updateAngle(this.deltaAngle);
        rotatePoints(this.points, this.center, this.deltaAngle);
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        translatePoint(this.center, this.maxLinearSpeed, this.angle);
        translatePoints(this.points, this.maxLinearSpeed, this.angle);
      }

      this.game.wrapScreen(this);
    },

    draw: function(screen) {
      screen.strokeStyle = '#eee';
      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      screen.lineTo(this.points[1].x, this.points[1].y);
      screen.lineTo(this.points[2].x, this.points[2].y);
      screen.lineTo(this.points[3].x, this.points[3].y);
      screen.closePath();
      screen.stroke();
    },

    updateAngle: function(deltaAngle) {
      this.angle = (this.angle - deltaAngle) % FULL_ROTATION;
    },

    resetPoints: function() {
      this.points = [
        { x:      this.center.x, y: this.center.y + 10 },
        { x: this.center.x - 10, y: this.center.y + 15 },
        { x:      this.center.x, y: this.center.y - 15 },
        { x: this.center.x + 11, y: this.center.y + 15 }
      ];
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

  function teleportPoint(from, to) {
    from.x = to.x;
    from.y = to.y;
  };

  // Start game
  window.onload = function() {
    var canvas = document.getElementById('screen');
    new Game(canvas);
  };
})();
