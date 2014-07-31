;(function(exports) {
  var FULL_ROTATION = 2 * Math.PI;

  var Bullet = function(center, angle, creator) {
    this.center = { x: center.x, y: center.y };
    this.radius = 1;
    this.angle = angle;
    this.speed = 5;
    this.creator = creator;
    this.resetPoints();
    this.resetLineSegments();
  };

  Bullet.prototype = {
    update: function() {
      this.creator.game.trig.translatePoint(this.center, this.speed, this.angle);
      this.resetPoints();
      this.resetLineSegments();
      if (this.offScreen()) {
        this.die();
        this.creator.die();
      }
    },

    draw: function(screen) {
      screen.lineWidth = 2;
      screen.strokeStyle = '#fff';
      screen.beginPath();
      screen.moveTo(this.points[0].x, this.points[0].y);
      for (var i = 1; i < this.points.length; i++) {
        screen.lineTo(this.points[i].x, this.points[i].y);
      }
      screen.closePath();
      screen.stroke();

      /*
      screen.strokeStyle = 'white';
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, FULL_ROTATION);
      screen.stroke();
      */
    },

    die: function() {
      var i = this.creator.game.bodies.indexOf(this);
      delete this.creator.game.bodies[i];
    },

    offScreen: function() {
      return this.center.x < 0 || this.center.x > this.creator.game.size.x ||
             this.center.y < 0 || this.center.y > this.creator.game.size.y;
    },

    resetPoints: function() {
      this.points = [
        { x: this.center.x, y: this.center.y },
        { x: this.center.x + (this.speed) *  Math.cos(this.angle),
          y: this.center.y + (this.speed) * -Math.sin(this.angle) }
      ];
    },

    resetLineSegments: function() {
      this.lineSegments = [{ p1: this.points[0], p2: this.points[1] }];
    }
  };

  exports.Bullet = Bullet;
})(this);
