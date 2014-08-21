;(function(exports) {
  function Alien(game, size) {
    this.game = game;
    this.color = game.COLORS.YELLOW;
    this.angle = game.validAngle();
    this.speed = 3 - size;
    this.center = game.randomPoint();
    this.size = size;
    this.resetPoints();
    this.resetLineSegments();
    this.game.numberOfEnemies++;

    this.lastFired = 0;
  }

  Alien.prototype = {
    update: function() {
      this.game.trig.translatePoint(this.center, this.speed, this.angle);
      this.resetPoints();
      this.resetLineSegments();

      /* Off-screen aliens wrap around the screen, back into the canvas. */
      this.game.wrapScreen(this);

      this.shoot();
    },

    draw: function(screen) {
      var domeControl = { x: this.center.x, y: this.center.y - 25 };

      screen.lineWidth = 2;
      screen.strokeStyle = this.color;
      screen.fillStyle = this.game.color;

      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      for (var i = 1; i < this.points.length; i++) {
        screen.lineTo(this.points[i].x, this.points[i].y);
      }
      screen.closePath();
      screen.stroke();
      screen.fill();

      screen.lineWidth = 1;
      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      screen.lineTo(this.points[3].x, this.points[3].y);
      screen.closePath();
      screen.stroke();

      screen.lineWidth = 1;
      screen.beginPath();
      screen.moveTo(this.points[4].x, this.points[4].y);
      screen.lineTo(this.points[7].x, this.points[7].y);
      screen.closePath();
      screen.stroke();
    },

    die: function() {
      switch(this.size) {
        case 2:
          this.game.addToScore(200);
          break;
        case 1:
          this.game.addToScore(1000);
          break;
      }

      this.game.numberOfEnemies--;
      this.game.removeBody(this);
    },

    resetPoints: function() {
      switch(this.size) {
        case 2:
          this.points = [
            { x: this.center.x -  22.5, y: this.center.y       },
            { x: this.center.x - 11.25, y: this.center.y + 7.5 },
            { x: this.center.x + 11.25, y: this.center.y + 7.5},
            { x: this.center.x +  22.5, y: this.center.y       },
            { x: this.center.x + 11.25, y: this.center.y - 7.5 },
            { x: this.center.x +   7.5, y: this.center.y -  15 },
            { x: this.center.x -   7.5, y: this.center.y -  15 },
            { x: this.center.x - 11.25, y: this.center.y - 7.5 }
          ];
          break;
        case 1:
          this.points = [
            { x: this.center.x - 18, y: this.center.y      },
            { x: this.center.x -  9, y: this.center.y +  6 },
            { x: this.center.x +  9, y: this.center.y +  6 },
            { x: this.center.x + 18, y: this.center.y      },
            { x: this.center.x +  9, y: this.center.y -  6 },
            { x: this.center.x +  6, y: this.center.y - 12 },
            { x: this.center.x -  6, y: this.center.y - 12 },
            { x: this.center.x -  9, y: this.center.y -  6 }
          ];
          break;
      }
    },

    resetLineSegments: function() {
      this.lineSegments = [];
      var self = this;
      this.points.forEach(function(point, i, points) {
        if (i !== points.length - 1) {
          self.lineSegments.push({ p1: points[i], p2: points[i + 1] });
        } else {
          self.lineSegments.push({ p1: points[i], p2: points[0] });
        }
      });
    },

    shoot: function() {
      var firingRate = this.size * 1000;
      var firingThreshold = 0.5;
      var now = Date.now();
      if (now - this.lastFired >= firingRate && Math.random() >= firingThreshold) {
        var bullet = new Bullet({ x: this.center.x, y: this.center.y }, this.game.randomAngle(), this);
        this.game.addBody(bullet);
        this.lastFired = now;
      }
    }
  };

  exports.Alien = Alien;
})(this);