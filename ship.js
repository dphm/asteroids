;(function(exports) {
  var FULL_ROTATION = 2 * Math.PI;

  var Ship = function(game) {
    this.game = game;
    this.keyboarder = new Keyboarder();

    this.center = { x: game.size.x / 2, y: game.size.y / 2 };
    this.resetPoints();
    this.resetLineSegments();

    this.angle = Math.PI / 2;
    this.deltaAngle = 5 * Math.PI / 180;
    this.maxLinearSpeed = 4;
  };

  Ship.prototype = {
    update: function() {
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
        var bullet = new Bullet(this.points[2], this.angle, this);
        this.game.addBody(bullet);
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.updateAngle(-this.deltaAngle);
        this.game.trig.rotatePoints(this.points, this.center, -this.deltaAngle);
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.updateAngle(this.deltaAngle);
        this.game.trig.rotatePoints(this.points, this.center, this.deltaAngle);
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.game.trig.translatePoint(this.center, this.maxLinearSpeed, this.angle);
        this.game.trig.translatePoints(this.points, this.maxLinearSpeed, this.angle);
      }

      this.game.wrapScreen(this);
    },

    draw: function(screen) {
      screen.lineWidth = 1;
      screen.strokeStyle = '#eee';
      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      for (var i = 1; i < this.points.length; i++) {
        screen.lineTo(this.points[i].x, this.points[i].y);
      }
      screen.closePath();
      screen.stroke();
    },

    die: function() {
      this.game.over();
    },

    updateAngle: function(deltaAngle) {
      this.angle = (this.angle - deltaAngle) % FULL_ROTATION;
    },

    resetPoints: function() {
      this.points = [
        { x: this.center.x     , y: this.center.y + 10 },
        { x: this.center.x - 10, y: this.center.y + 15 },
        { x: this.center.x     , y: this.center.y - 15 },
        { x: this.center.x + 11, y: this.center.y + 15 }
      ];
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
    }
  };

  exports.Ship = Ship;
})(this);
