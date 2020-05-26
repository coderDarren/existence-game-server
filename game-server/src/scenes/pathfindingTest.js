'use strict';
const {Scene} = require('./scene.js');
const Mob = require('../mobs/mob.js');
const {
    dummy,
} = require('../mobs/data.js');

var waypointGraph = {"waypoints":[{"id":"177.0046-32.45-201.75","pos":{"x":177.0046,"y":32.45,"z":201.75,"timestamp":null},"paths":[{"from":"177.0046-32.45-201.75","to":"177.0046-32.45-195.8","length":5.949997,"timestamp":null},{"from":"177.0046-32.45-201.75","to":"185.0046-32.45-200.84","length":8.05159,"timestamp":null},{"from":"177.0046-32.45-201.75","to":"169.0046-32.45-200.84","length":8.05159,"timestamp":null}],"timestamp":null},{"id":"177.0046-32.45-195.8","pos":{"x":177.0046,"y":32.45,"z":195.8,"timestamp":null},"paths":[{"from":"177.0046-32.45-195.8","to":"177.0046-32.45-201.75","length":5.949997,"timestamp":null},{"from":"177.0046-32.45-195.8","to":"172.8246-32.45-192.2","length":5.51655531,"timestamp":null},{"from":"177.0046-32.45-195.8","to":"181.1846-32.45-192.2","length":5.51655531,"timestamp":null}],"timestamp":null},{"id":"172.8246-32.45-192.2","pos":{"x":172.8246,"y":32.45,"z":192.2,"timestamp":null},"paths":[{"from":"172.8246-32.45-192.2","to":"177.0046-32.45-195.8","length":5.51655531,"timestamp":null},{"from":"172.8246-32.45-192.2","to":"169.0046-32.45-189.32","length":4.784024,"timestamp":null},{"from":"172.8246-32.45-192.2","to":"177.0046-32.45-188.7","length":5.45182,"timestamp":null},{"from":"172.8246-32.45-192.2","to":"169.0046-32.45-196.62","length":5.84198952,"timestamp":null}],"timestamp":null},{"id":"169.0046-32.45-189.32","pos":{"x":169.0046,"y":32.45,"z":189.319992,"timestamp":null},"paths":[{"from":"169.0046-32.45-189.32","to":"172.8246-32.45-192.2","length":4.784024,"timestamp":null},{"from":"169.0046-32.45-189.32","to":"169.0046-32.45-184.84","length":4.47999573,"timestamp":null},{"from":"169.0046-32.45-189.32","to":"166.6846-32.45-192.91","length":4.274406,"timestamp":null}],"timestamp":null},{"id":"169.0046-32.45-184.84","pos":{"x":169.0046,"y":32.45,"z":184.84,"timestamp":null},"paths":[{"from":"169.0046-32.45-184.84","to":"169.0046-32.45-189.32","length":4.47999573,"timestamp":null},{"from":"169.0046-32.45-184.84","to":"177.0046-32.45-183.76","length":8.072571,"timestamp":null}],"timestamp":null},{"id":"177.0046-32.45-188.7","pos":{"x":177.0046,"y":32.45,"z":188.7,"timestamp":null},"paths":[{"from":"177.0046-32.45-188.7","to":"172.8246-32.45-192.2","length":5.45182,"timestamp":null},{"from":"177.0046-32.45-188.7","to":"177.0046-32.45-183.76","length":4.94000244,"timestamp":null},{"from":"177.0046-32.45-188.7","to":"181.1846-32.45-192.2","length":5.45182,"timestamp":null}],"timestamp":null},{"id":"177.0046-32.45-183.76","pos":{"x":177.0046,"y":32.45,"z":183.76,"timestamp":null},"paths":[{"from":"177.0046-32.45-183.76","to":"177.0046-32.45-188.7","length":4.94000244,"timestamp":null},{"from":"177.0046-32.45-183.76","to":"185.0046-32.45-184.84","length":8.072571,"timestamp":null},{"from":"177.0046-32.45-183.76","to":"169.0046-32.45-184.84","length":8.072571,"timestamp":null}],"timestamp":null},{"id":"185.0046-32.45-184.84","pos":{"x":185.0046,"y":32.45,"z":184.84,"timestamp":null},"paths":[{"from":"185.0046-32.45-184.84","to":"177.0046-32.45-183.76","length":8.072571,"timestamp":null},{"from":"185.0046-32.45-184.84","to":"185.0046-32.45-189.32","length":4.47999573,"timestamp":null}],"timestamp":null},{"id":"181.1846-32.45-192.2","pos":{"x":181.184586,"y":32.45,"z":192.2,"timestamp":null},"paths":[{"from":"181.1846-32.45-192.2","to":"177.0046-32.45-195.8","length":5.51655531,"timestamp":null},{"from":"181.1846-32.45-192.2","to":"177.0046-32.45-188.7","length":5.45182,"timestamp":null},{"from":"181.1846-32.45-192.2","to":"185.0046-32.45-189.32","length":4.784024,"timestamp":null},{"from":"181.1846-32.45-192.2","to":"185.0046-32.45-196.62","length":5.84198952,"timestamp":null}],"timestamp":null},{"id":"185.0046-32.45-189.32","pos":{"x":185.0046,"y":32.45,"z":189.319992,"timestamp":null},"paths":[{"from":"185.0046-32.45-189.32","to":"181.1846-32.45-192.2","length":4.784024,"timestamp":null},{"from":"185.0046-32.45-189.32","to":"185.0046-32.45-184.84","length":4.47999573,"timestamp":null},{"from":"185.0046-32.45-189.32","to":"187.3246-32.45-192.91","length":4.274406,"timestamp":null}],"timestamp":null},{"id":"185.0046-32.45-200.84","pos":{"x":185.0046,"y":32.45,"z":200.84,"timestamp":null},"paths":[{"from":"185.0046-32.45-200.84","to":"177.0046-32.45-201.75","length":8.05159,"timestamp":null},{"from":"185.0046-32.45-200.84","to":"185.0046-32.45-196.62","length":4.220001,"timestamp":null}],"timestamp":null},{"id":"185.0046-32.45-196.62","pos":{"x":185.0046,"y":32.45,"z":196.62,"timestamp":null},"paths":[{"from":"185.0046-32.45-196.62","to":"185.0046-32.45-200.84","length":4.220001,"timestamp":null},{"from":"185.0046-32.45-196.62","to":"181.1846-32.45-192.2","length":5.84198952,"timestamp":null},{"from":"185.0046-32.45-196.62","to":"187.3246-32.45-192.91","length":4.37566,"timestamp":null}],"timestamp":null},{"id":"187.3246-32.45-192.91","pos":{"x":187.324585,"y":32.45,"z":192.91,"timestamp":null},"paths":[{"from":"187.3246-32.45-192.91","to":"185.0046-32.45-196.62","length":4.37566,"timestamp":null},{"from":"187.3246-32.45-192.91","to":"185.0046-32.45-189.32","length":4.274406,"timestamp":null}],"timestamp":null},{"id":"169.0046-32.45-200.84","pos":{"x":169.0046,"y":32.45,"z":200.84,"timestamp":null},"paths":[{"from":"169.0046-32.45-200.84","to":"177.0046-32.45-201.75","length":8.05159,"timestamp":null},{"from":"169.0046-32.45-200.84","to":"169.0046-32.45-196.62","length":4.220001,"timestamp":null}],"timestamp":null},{"id":"169.0046-32.45-196.62","pos":{"x":169.0046,"y":32.45,"z":196.62,"timestamp":null},"paths":[{"from":"169.0046-32.45-196.62","to":"169.0046-32.45-200.84","length":4.220001,"timestamp":null},{"from":"169.0046-32.45-196.62","to":"172.8246-32.45-192.2","length":5.84198952,"timestamp":null},{"from":"169.0046-32.45-196.62","to":"166.6846-32.45-192.91","length":4.37566,"timestamp":null}],"timestamp":null},{"id":"166.6846-32.45-192.91","pos":{"x":166.6846,"y":32.45,"z":192.91,"timestamp":null},"paths":[{"from":"166.6846-32.45-192.91","to":"169.0046-32.45-196.62","length":4.37566,"timestamp":null},{"from":"166.6846-32.45-192.91","to":"169.0046-32.45-189.32","length":4.274406,"timestamp":null}],"timestamp":null}],"timestamp":null}

module.exports = (_game) => {
    return new Scene(
        //mobs
        [
            new Mob(_game, dummy(10, {x:179.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:178.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:177.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:176.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:175.2,y:32.31,z:184.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:169.2,y:32.31,z:189.7}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:174.6,y:32.31,z:191.9}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:177.0,y:32.31,z:190.4}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:179.3,y:32.31,z:192.0}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:184.8,y:32.31,z:190.8}, {x:0,y:0,z:0})),
        ],
        waypointGraph
    );
};