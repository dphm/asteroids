;(function() {
  var Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    this.size = { x: canvas.width, y: canvas.height };

    var screen = canvas.getContext('2d');

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
    this.angle = 0;
    this.angularSpeed = Math.PI / 180;
    this.maxLinearSpeed = 4;
    this.keyboarder = new Keyboarder();
  };

  Ship.prototype = {
    update: function() {
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.angle -= this.angularSpeed;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.angle += this.angularSpeed;
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.center.x += this.maxLinearSpeed * Math.sin(this.angle);
        this.center.y -= this.maxLinearSpeed * Math.cos(this.angle);
      }
    },

    draw: function(screen) {
      screen.save();
      screen.translate(this.center.x, this.center.y);
      screen.rotate(this.angle);

      screen.strokeStyle = '#eee';
      screen.beginPath();
      screen.moveTo(0, 10);
      screen.lineTo(-10, 15);
      screen.lineTo(0, -15);
      screen.lineTo(11, 15);
      screen.closePath();
      screen.stroke();

      screen.restore();
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


  // Start game
  window.onload = function() {
    new Game('screen');
  };
})();