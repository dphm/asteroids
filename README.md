Asteroids
=========

An Atari Asteroids clone written in JavaScript

![Asteroids](http://i.imgur.com/ytuPsUR.png)

Controls
========
    UP    : accelerate the ship
    LEFT  : rotate the ship left
    RIGHT : rotate the ship right
    DOWN  : jump into hyperspace
    SPACE : shoot

Limits
------
* Ships can shoot up to 3 times per second.
* Ships can jump into hyperspace (move to a random location on the screen) up to 1 time per 3 seconds.

Gameplay
========
* The game begins with three lives.
* Lives are lost when the ship collides with enemy bodies or bullets.
* The ship reappears in the center of the screen when a life is lost.
* Levels are completed when all enemies are destroyed.
* Asteroids, aliens, and ships wrap around the screen.
* Large asteroids break up into three medium asteroids.
* Medium asteroids break up into three small asteroids.
* Smaller asteroids move more quickly.
* Two aliens appear after the first level.
* The large alien shoots randomly.
* The small alien shoots toward the ship, with increasing accuracy at each level.

Points
------
    Large asteroid      20
    Medium asteroid     50
    Small asteroid      100
    Large alien         200
    Small alien         1000

Bonus
-----
One life is earned every 10,000 points.

Notes
=====
* The aliens have developed special bullets that do not harm other aliens or asteroids.
* Aliens have a 50% chance of firing every 3 seconds.
* Ship bullets and alien bullets destroy each other.
* Aliens can die by kamikaze attacks.
