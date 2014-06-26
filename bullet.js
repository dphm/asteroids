;(function(exports) {
  var FULL_ROTATION = 2 * Math.PI;

  var Bullet = function(center, angle, creator) {
    this.center = { x: center.x, y: center.y };
    this.radius = 1;
    this.angle = angle;
    this.creator = creator;
  };

  Bullet.prototype = {
    update: function() {
      this.creator.game.trig.translatePoint(this.center, 6, this.angle);
    },

    draw: function(screen) {
      screen.strokeStyle = 'white';
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, FULL_ROTATION);
      screen.stroke();
    }
  };

  exports.Bullet = Bullet;
})(this);
