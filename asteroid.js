;(function(exports) {
  var Asteroid = function(game, center) {
    this.game = game;
    this.center = center;
    this.velocity = { x: Math.random(), y: Math.random()};
    
    if (this.velocity.x < 0.5) {
      this.velocity.x = -this.velocity.x;
    }

    if (this.velocity.y < 0.5) {
      this.velocity.y = -this.velocity.y;
    }

    this.resetPoints();
  };

  Asteroid.prototype = {
    update: function() {
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;
      this.resetPoints();
      this.game.wrapScreen(this);
    },

    draw: function(screen) {
      screen.strokeStyle = '#aaa';
      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      for (var i = 1; i < this.points.length; i++) {
        screen.lineTo(this.points[i].x, this.points[i].y);
      }
      screen.closePath();
      screen.stroke();
    },

    resetPoints: function() {
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
        { x: this.center.x +  8, y: this.center.y - 14 },
      ];
    }
  };

  exports.Asteroid = Asteroid;
})(this);