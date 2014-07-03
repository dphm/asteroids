;(function(exports) {
  var FULL_ROTATION = 2 * Math.PI;

  var Bullet = function(center, angle, creator) {
    this.center = { x: center.x, y: center.y };
    this.radius = 1;
    this.angle = angle;
    this.speed = 5;
    this.creator = creator;
  };

  Bullet.prototype = {
    update: function() {
      if (this.offScreen()) this.die();
      this.creator.game.trig.translatePoint(this.center, this.speed, this.angle);
    },

    draw: function(screen) {
      screen.strokeStyle = 'white';
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, FULL_ROTATION);
      screen.stroke();
    },

    die: function() {
      var i = this.creator.game.bodies.indexOf(this);
      delete this.creator.game.bodies[i];
    },

    offScreen: function() {
      return this.center.x < 0 || this.center.x > this.creator.game.size.x ||
             this.center.y < 0 || this.center.y > this.creator.game.size.y;
    }
  };

  exports.Bullet = Bullet;
})(this);
