;(function(exports) {
  var FULL_ROTATION = 2 * Math.PI;

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

  exports.Ship = Ship;
})(this);
