;(function() {
  var Game = function(canvasId) {
    var canvas = document.getElementById(canvasId);
    this.size = { x: canvas.width, y: canvas.height };

    var screen = canvas.getContext('2d');

    this.bodies = [];
    this.bodies.push(new Ship(this));

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
      function wrapScreen(body) {
        if (body.center.x < 0) {
          body.center.x = body.game.size.x;
        } else if (body.center.x > body.game.size.x) {
          body.center.x = 0;
        }

        if (body.center.y < 0) {
          body.center.y = body.game.size.y;
        } else if (body.center.y > body.game.size.y) {
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
    }
  };


  var Ship = function(game) {
    this.game = game;
    this.center = { x: game.size.x / 2, y: game.size.y / 2 };
    this.angle = 0;
    this.keyboarder = new Keyboarder();
  };

  Ship.prototype = {
    update: function() {
      var SPEED = {
        ANGULAR: Math.PI / 180,
        LINEAR: 3
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
        console.log("SPACE");
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.angle -= SPEED.ANGULAR;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.angle += SPEED.ANGULAR;
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.center.x += SPEED.LINEAR * Math.sin(this.angle);
        this.center.y -= SPEED.LINEAR * Math.cos(this.angle);
        console.log(this.center);
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