'use strict';
const {Scene} = require('./scene.js');
const Mob = require('../mobs/mob.js');
const {
    dummy,
} = require('../mobs/data.js');

const waypointGraph = {"waypoints":[{"id":"173.2499-35.56-182.1978","pos":{"x":173.249878,"y":35.5599976,"z":182.197815,"timestamp":null},"paths":[{"from":"173.2499-35.56-182.1978","to":"173.0928-35.56-180.7945","length":1.41209877,"timestamp":null}],"timestamp":null},{"id":"173.0928-35.56-180.7945","pos":{"x":173.0928,"y":35.5599976,"z":180.794479,"timestamp":null},"paths":[{"from":"173.0928-35.56-180.7945","to":"173.2499-35.56-182.1978","length":1.41209877,"timestamp":null},{"from":"173.0928-35.56-180.7945","to":"171.9276-35.56-179.4317","length":1.79300082,"timestamp":null},{"from":"173.0928-35.56-180.7945","to":"173.9869-35.56-179.4303","length":1.6311028,"timestamp":null}],"timestamp":null},{"id":"171.9276-35.56-179.4317","pos":{"x":171.927551,"y":35.5599976,"z":179.431747,"timestamp":null},"paths":[{"from":"171.9276-35.56-179.4317","to":"173.0928-35.56-180.7945","length":1.79300082,"timestamp":null}],"timestamp":null},{"id":"173.9869-35.56-179.4303","pos":{"x":173.986908,"y":35.5599976,"z":179.430267,"timestamp":null},"paths":[{"from":"173.9869-35.56-179.4303","to":"173.0928-35.56-180.7945","length":1.6311028,"timestamp":null},{"from":"173.9869-35.56-179.4303","to":"177.1631-35.56-178.0285","length":3.47174549,"timestamp":null}],"timestamp":null},{"id":"177.1631-35.56-178.0285","pos":{"x":177.1631,"y":35.5599976,"z":178.028549,"timestamp":null},"paths":[{"from":"177.1631-35.56-178.0285","to":"173.9869-35.56-179.4303","length":3.47174549,"timestamp":null},{"from":"177.1631-35.56-178.0285","to":"179.3083-35.56-180.322","length":3.14035654,"timestamp":null},{"from":"177.1631-35.56-178.0285","to":"180.4933-35.56-176.0469","length":3.87518048,"timestamp":null},{"from":"177.1631-35.56-178.0285","to":"182.0488-35.56-178.0286","length":4.885681,"timestamp":null}],"timestamp":null},{"id":"179.3083-35.56-180.322","pos":{"x":179.3083,"y":35.5599976,"z":180.322,"timestamp":null},"paths":[{"from":"179.3083-35.56-180.322","to":"177.1631-35.56-178.0285","length":3.14035654,"timestamp":null},{"from":"179.3083-35.56-180.322","to":"182.0488-35.56-178.0286","length":3.57352734,"timestamp":null},{"from":"179.3083-35.56-180.322","to":"182.0493-35.56-181.4472","length":2.96298671,"timestamp":null},{"from":"179.3083-35.56-180.322","to":"179.7055-35.56-184.055","length":3.754069,"timestamp":null}],"timestamp":null},{"id":"182.0488-35.56-178.0286","pos":{"x":182.048782,"y":35.5599976,"z":178.028564,"timestamp":null},"paths":[{"from":"182.0488-35.56-178.0286","to":"179.3083-35.56-180.322","length":3.57352734,"timestamp":null},{"from":"182.0488-35.56-178.0286","to":"182.0493-35.56-181.4472","length":3.41867065,"timestamp":null},{"from":"182.0488-35.56-178.0286","to":"183.9089-35.56-180.5774","length":3.155396,"timestamp":null},{"from":"182.0488-35.56-178.0286","to":"180.4933-35.56-176.0469","length":2.5192008,"timestamp":null},{"from":"182.0488-35.56-178.0286","to":"177.1631-35.56-178.0285","length":4.885681,"timestamp":null}],"timestamp":null},{"id":"182.0493-35.56-181.4472","pos":{"x":182.049316,"y":35.5599976,"z":181.447235,"timestamp":null},"paths":[{"from":"182.0493-35.56-181.4472","to":"182.0488-35.56-178.0286","length":3.41867065,"timestamp":null},{"from":"182.0493-35.56-181.4472","to":"183.9089-35.56-180.5774","length":2.05295873,"timestamp":null},{"from":"182.0493-35.56-181.4472","to":"179.7055-35.56-184.055","length":3.50630069,"timestamp":null},{"from":"182.0493-35.56-181.4472","to":"183.0958-35.56-185.5327","length":4.217354,"timestamp":null},{"from":"182.0493-35.56-181.4472","to":"179.3083-35.56-180.322","length":2.96298671,"timestamp":null}],"timestamp":null},{"id":"183.9089-35.56-180.5774","pos":{"x":183.90889,"y":35.5599976,"z":180.5774,"timestamp":null},"paths":[{"from":"183.9089-35.56-180.5774","to":"182.0493-35.56-181.4472","length":2.05295873,"timestamp":null},{"from":"183.9089-35.56-180.5774","to":"183.0958-35.56-185.5327","length":5.02157736,"timestamp":null},{"from":"183.9089-35.56-180.5774","to":"185.1139-35.56-183.2399","length":2.92247319,"timestamp":null},{"from":"183.9089-35.56-180.5774","to":"182.0488-35.56-178.0286","length":3.155396,"timestamp":null}],"timestamp":null},{"id":"183.0958-35.56-185.5327","pos":{"x":183.095764,"y":35.5599976,"z":185.5327,"timestamp":null},"paths":[{"from":"183.0958-35.56-185.5327","to":"183.9089-35.56-180.5774","length":5.02157736,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"183.832-35.56-187.4354","length":2.04021454,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"181.5558-35.56-187.0068","length":2.13178754,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"185.1139-35.56-183.2399","length":3.05446935,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"179.7055-35.56-184.055","length":3.69834256,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"182.0493-35.56-181.4472","length":4.217354,"timestamp":null}],"timestamp":null},{"id":"183.832-35.56-187.4354","pos":{"x":183.832047,"y":35.5599976,"z":187.435425,"timestamp":null},"paths":[{"from":"183.832-35.56-187.4354","to":"183.0958-35.56-185.5327","length":2.04021454,"timestamp":null},{"from":"183.832-35.56-187.4354","to":"186.477-35.56-187.6288","length":2.652033,"timestamp":null},{"from":"183.832-35.56-187.4354","to":"181.749-35.56-189.7545","length":3.11720371,"timestamp":null},{"from":"183.832-35.56-187.4354","to":"181.5558-35.56-187.0068","length":2.31624556,"timestamp":null}],"timestamp":null},{"id":"186.477-35.56-187.6288","pos":{"x":186.47702,"y":35.5599976,"z":187.6288,"timestamp":null},"paths":[{"from":"186.477-35.56-187.6288","to":"183.832-35.56-187.4354","length":2.652033,"timestamp":null},{"from":"186.477-35.56-187.6288","to":"181.749-35.56-189.7545","length":5.18386269,"timestamp":null}],"timestamp":null},{"id":"181.749-35.56-189.7545","pos":{"x":181.749023,"y":35.5599976,"z":189.754471,"timestamp":null},"paths":[{"from":"181.749-35.56-189.7545","to":"186.477-35.56-187.6288","length":5.18386269,"timestamp":null},{"from":"181.749-35.56-189.7545","to":"175.8179-35.56-189.7562","length":5.93113756,"timestamp":null},{"from":"181.749-35.56-189.7545","to":"176.1035-35.56-191.2909","length":5.85083151,"timestamp":null},{"from":"181.749-35.56-189.7545","to":"183.832-35.56-187.4354","length":3.11720371,"timestamp":null},{"from":"181.749-35.56-189.7545","to":"181.5558-35.56-187.0068","length":2.75443578,"timestamp":null}],"timestamp":null},{"id":"175.8179-35.56-189.7562","pos":{"x":175.817886,"y":35.5599976,"z":189.756165,"timestamp":null},"paths":[{"from":"175.8179-35.56-189.7562","to":"181.749-35.56-189.7545","length":5.93113756,"timestamp":null},{"from":"175.8179-35.56-189.7562","to":"169.6663-35.56-191.0009","length":6.276256,"timestamp":null},{"from":"175.8179-35.56-189.7562","to":"176.1035-35.56-191.2909","length":1.56109989,"timestamp":null},{"from":"175.8179-35.56-189.7562","to":"179.7055-35.56-184.055","length":6.90046453,"timestamp":null},{"from":"175.8179-35.56-189.7562","to":"174.6873-35.56-187.1176","length":2.870629,"timestamp":null}],"timestamp":null},{"id":"169.6663-35.56-191.0009","pos":{"x":169.6663,"y":35.5599976,"z":191.000931,"timestamp":null},"paths":[{"from":"169.6663-35.56-191.0009","to":"175.8179-35.56-189.7562","length":6.276256,"timestamp":null},{"from":"169.6663-35.56-191.0009","to":"167.0508-35.56-185.8345","length":5.790777,"timestamp":null},{"from":"169.6663-35.56-191.0009","to":"176.1035-35.56-191.2909","length":6.44375324,"timestamp":null},{"from":"169.6663-35.56-191.0009","to":"174.6873-35.56-187.1176","length":6.347475,"timestamp":null}],"timestamp":null},{"id":"167.0508-35.56-185.8345","pos":{"x":167.050751,"y":35.5599976,"z":185.8345,"timestamp":null},"paths":[{"from":"167.0508-35.56-185.8345","to":"169.6663-35.56-191.0009","length":5.790777,"timestamp":null}],"timestamp":null},{"id":"176.1035-35.56-191.2909","pos":{"x":176.103531,"y":35.5599976,"z":191.290909,"timestamp":null},"paths":[{"from":"176.1035-35.56-191.2909","to":"181.749-35.56-189.7545","length":5.85083151,"timestamp":null},{"from":"176.1035-35.56-191.2909","to":"175.8179-35.56-189.7562","length":1.56109989,"timestamp":null},{"from":"176.1035-35.56-191.2909","to":"169.6663-35.56-191.0009","length":6.44375324,"timestamp":null}],"timestamp":null},{"id":"181.5558-35.56-187.0068","pos":{"x":181.5558,"y":35.5599976,"z":187.006821,"timestamp":null},"paths":[{"from":"181.5558-35.56-187.0068","to":"183.0958-35.56-185.5327","length":2.13178754,"timestamp":null},{"from":"181.5558-35.56-187.0068","to":"183.832-35.56-187.4354","length":2.31624556,"timestamp":null},{"from":"181.5558-35.56-187.0068","to":"181.749-35.56-189.7545","length":2.75443578,"timestamp":null},{"from":"181.5558-35.56-187.0068","to":"179.7055-35.56-184.055","length":3.48381448,"timestamp":null}],"timestamp":null},{"id":"185.1139-35.56-183.2399","pos":{"x":185.113876,"y":35.5599976,"z":183.239883,"timestamp":null},"paths":[{"from":"185.1139-35.56-183.2399","to":"183.9089-35.56-180.5774","length":2.92247319,"timestamp":null},{"from":"185.1139-35.56-183.2399","to":"183.0958-35.56-185.5327","length":3.05446935,"timestamp":null}],"timestamp":null},{"id":"179.7055-35.56-184.055","pos":{"x":179.70546,"y":35.5599976,"z":184.055008,"timestamp":null},"paths":[{"from":"179.7055-35.56-184.055","to":"182.0493-35.56-181.4472","length":3.50630069,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"183.0958-35.56-185.5327","length":3.69834256,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"181.5558-35.56-187.0068","length":3.48381448,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"175.8179-35.56-189.7562","length":6.90046453,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"174.6873-35.56-187.1176","length":5.878916,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"179.3083-35.56-180.322","length":3.754069,"timestamp":null}],"timestamp":null},{"id":"174.6873-35.56-187.1176","pos":{"x":174.687256,"y":35.5599976,"z":187.117569,"timestamp":null},"paths":[{"from":"174.6873-35.56-187.1176","to":"179.7055-35.56-184.055","length":5.878916,"timestamp":null},{"from":"174.6873-35.56-187.1176","to":"175.8179-35.56-189.7562","length":2.870629,"timestamp":null},{"from":"174.6873-35.56-187.1176","to":"169.6663-35.56-191.0009","length":6.347475,"timestamp":null}],"timestamp":null},{"id":"180.4933-35.56-176.0469","pos":{"x":180.4933,"y":35.5599976,"z":176.046936,"timestamp":null},"paths":[{"from":"180.4933-35.56-176.0469","to":"177.1631-35.56-178.0285","length":3.87518048,"timestamp":null},{"from":"180.4933-35.56-176.0469","to":"182.0488-35.56-178.0286","length":2.5192008,"timestamp":null}],"timestamp":null}],"timestamp":null}

module.exports = (_game) => {
    return new Scene(
        //mobs
        [
            new Mob(_game, dummy(10, {x:184.5,y:35.4,z:179.36}, {x:0,y:0,z:0})),
            new Mob(_game, dummy(10, {x:178.8,y:35.4,z:176}, {x:0,y:0,z:0}))
        ],
        waypointGraph
    );
};