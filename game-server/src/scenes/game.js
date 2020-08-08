'use strict';
const {Scene} = require('./scene.js');
const Mob = require('../mobs/mob.js');
const {
    a0zix,
    toxicA0zix,
    enragedA0Zix
} = require('../mobs/data.js');

const waypointGraph = {"waypoints":[{"id":"173.2499-35.56-182.1978","pos":{"x":173.249878,"y":35.5599976,"z":182.197815,"timestamp":null},"paths":[{"from":"173.2499-35.56-182.1978","to":"173.0928-35.56-180.7945","length":1.41209877,"timestamp":null}],"timestamp":null},{"id":"173.0928-35.56-180.7945","pos":{"x":173.0928,"y":35.5599976,"z":180.794479,"timestamp":null},"paths":[{"from":"173.0928-35.56-180.7945","to":"173.2499-35.56-182.1978","length":1.41209877,"timestamp":null},{"from":"173.0928-35.56-180.7945","to":"171.9276-35.56-179.4317","length":1.79300082,"timestamp":null},{"from":"173.0928-35.56-180.7945","to":"173.9869-35.56-179.4303","length":1.6311028,"timestamp":null}],"timestamp":null},{"id":"171.9276-35.56-179.4317","pos":{"x":171.927551,"y":35.5599976,"z":179.431747,"timestamp":null},"paths":[{"from":"171.9276-35.56-179.4317","to":"173.0928-35.56-180.7945","length":1.79300082,"timestamp":null}],"timestamp":null},{"id":"173.9869-35.56-179.4303","pos":{"x":173.986908,"y":35.5599976,"z":179.430267,"timestamp":null},"paths":[{"from":"173.9869-35.56-179.4303","to":"173.0928-35.56-180.7945","length":1.6311028,"timestamp":null},{"from":"173.9869-35.56-179.4303","to":"177.1631-35.56-178.0285","length":3.47174549,"timestamp":null}],"timestamp":null},{"id":"177.1631-35.56-178.0285","pos":{"x":177.1631,"y":35.5599976,"z":178.028549,"timestamp":null},"paths":[{"from":"177.1631-35.56-178.0285","to":"173.9869-35.56-179.4303","length":3.47174549,"timestamp":null},{"from":"177.1631-35.56-178.0285","to":"179.3083-35.56-180.322","length":3.14035654,"timestamp":null},{"from":"177.1631-35.56-178.0285","to":"180.4933-35.56-176.0469","length":3.87518048,"timestamp":null},{"from":"177.1631-35.56-178.0285","to":"182.0488-35.56-178.0286","length":4.885681,"timestamp":null}],"timestamp":null},{"id":"179.3083-35.56-180.322","pos":{"x":179.3083,"y":35.5599976,"z":180.322,"timestamp":null},"paths":[{"from":"179.3083-35.56-180.322","to":"177.1631-35.56-178.0285","length":3.14035654,"timestamp":null},{"from":"179.3083-35.56-180.322","to":"182.0488-35.56-178.0286","length":3.57352734,"timestamp":null},{"from":"179.3083-35.56-180.322","to":"182.0493-35.56-181.4472","length":2.96298671,"timestamp":null},{"from":"179.3083-35.56-180.322","to":"179.7055-35.56-184.055","length":3.754069,"timestamp":null}],"timestamp":null},{"id":"182.0488-35.56-178.0286","pos":{"x":182.048782,"y":35.5599976,"z":178.028564,"timestamp":null},"paths":[{"from":"182.0488-35.56-178.0286","to":"179.3083-35.56-180.322","length":3.57352734,"timestamp":null},{"from":"182.0488-35.56-178.0286","to":"182.0493-35.56-181.4472","length":3.41867065,"timestamp":null},{"from":"182.0488-35.56-178.0286","to":"183.9089-35.56-180.5774","length":3.155396,"timestamp":null},{"from":"182.0488-35.56-178.0286","to":"180.4933-35.56-176.0469","length":2.5192008,"timestamp":null},{"from":"182.0488-35.56-178.0286","to":"177.1631-35.56-178.0285","length":4.885681,"timestamp":null}],"timestamp":null},{"id":"182.0493-35.56-181.4472","pos":{"x":182.049316,"y":35.5599976,"z":181.447235,"timestamp":null},"paths":[{"from":"182.0493-35.56-181.4472","to":"182.0488-35.56-178.0286","length":3.41867065,"timestamp":null},{"from":"182.0493-35.56-181.4472","to":"183.9089-35.56-180.5774","length":2.05295873,"timestamp":null},{"from":"182.0493-35.56-181.4472","to":"179.7055-35.56-184.055","length":3.50630069,"timestamp":null},{"from":"182.0493-35.56-181.4472","to":"183.0958-35.56-185.5327","length":4.217354,"timestamp":null},{"from":"182.0493-35.56-181.4472","to":"179.3083-35.56-180.322","length":2.96298671,"timestamp":null}],"timestamp":null},{"id":"183.9089-35.56-180.5774","pos":{"x":183.90889,"y":35.5599976,"z":180.5774,"timestamp":null},"paths":[{"from":"183.9089-35.56-180.5774","to":"182.0493-35.56-181.4472","length":2.05295873,"timestamp":null},{"from":"183.9089-35.56-180.5774","to":"183.0958-35.56-185.5327","length":5.02157736,"timestamp":null},{"from":"183.9089-35.56-180.5774","to":"185.1139-35.56-183.2399","length":2.92247319,"timestamp":null},{"from":"183.9089-35.56-180.5774","to":"182.0488-35.56-178.0286","length":3.155396,"timestamp":null}],"timestamp":null},{"id":"183.0958-35.56-185.5327","pos":{"x":183.095764,"y":35.5599976,"z":185.5327,"timestamp":null},"paths":[{"from":"183.0958-35.56-185.5327","to":"183.9089-35.56-180.5774","length":5.02157736,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"183.832-35.56-187.4354","length":2.04021454,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"181.5558-35.56-187.0068","length":2.13178754,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"185.1139-35.56-183.2399","length":3.05446935,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"179.7055-35.56-184.055","length":3.69834256,"timestamp":null},{"from":"183.0958-35.56-185.5327","to":"182.0493-35.56-181.4472","length":4.217354,"timestamp":null}],"timestamp":null},{"id":"183.832-35.56-187.4354","pos":{"x":183.832047,"y":35.5599976,"z":187.435425,"timestamp":null},"paths":[{"from":"183.832-35.56-187.4354","to":"183.0958-35.56-185.5327","length":2.04021454,"timestamp":null},{"from":"183.832-35.56-187.4354","to":"186.477-35.56-187.6288","length":2.652033,"timestamp":null},{"from":"183.832-35.56-187.4354","to":"181.749-35.56-189.7545","length":3.11720371,"timestamp":null},{"from":"183.832-35.56-187.4354","to":"181.5558-35.56-187.0068","length":2.31624556,"timestamp":null}],"timestamp":null},{"id":"186.477-35.56-187.6288","pos":{"x":186.47702,"y":35.5599976,"z":187.6288,"timestamp":null},"paths":[{"from":"186.477-35.56-187.6288","to":"183.832-35.56-187.4354","length":2.652033,"timestamp":null},{"from":"186.477-35.56-187.6288","to":"181.749-35.56-189.7545","length":5.18386269,"timestamp":null}],"timestamp":null},{"id":"181.749-35.56-189.7545","pos":{"x":181.749023,"y":35.5599976,"z":189.754471,"timestamp":null},"paths":[{"from":"181.749-35.56-189.7545","to":"186.477-35.56-187.6288","length":5.18386269,"timestamp":null},{"from":"181.749-35.56-189.7545","to":"175.8179-35.56-189.7562","length":5.93113756,"timestamp":null},{"from":"181.749-35.56-189.7545","to":"176.1035-35.56-191.2909","length":5.85083151,"timestamp":null},{"from":"181.749-35.56-189.7545","to":"183.832-35.56-187.4354","length":3.11720371,"timestamp":null},{"from":"181.749-35.56-189.7545","to":"181.5558-35.56-187.0068","length":2.75443578,"timestamp":null}],"timestamp":null},{"id":"175.8179-35.56-189.7562","pos":{"x":175.817886,"y":35.5599976,"z":189.756165,"timestamp":null},"paths":[{"from":"175.8179-35.56-189.7562","to":"181.749-35.56-189.7545","length":5.93113756,"timestamp":null},{"from":"175.8179-35.56-189.7562","to":"169.6663-35.56-191.0009","length":6.276256,"timestamp":null},{"from":"175.8179-35.56-189.7562","to":"176.1035-35.56-191.2909","length":1.56109989,"timestamp":null},{"from":"175.8179-35.56-189.7562","to":"179.7055-35.56-184.055","length":6.90046453,"timestamp":null},{"from":"175.8179-35.56-189.7562","to":"174.6873-35.56-187.1176","length":2.870629,"timestamp":null}],"timestamp":null},{"id":"169.6663-35.56-191.0009","pos":{"x":169.6663,"y":35.5599976,"z":191.000931,"timestamp":null},"paths":[{"from":"169.6663-35.56-191.0009","to":"175.8179-35.56-189.7562","length":6.276256,"timestamp":null},{"from":"169.6663-35.56-191.0009","to":"167.0508-35.56-185.8345","length":5.790777,"timestamp":null},{"from":"169.6663-35.56-191.0009","to":"176.1035-35.56-191.2909","length":6.44375324,"timestamp":null},{"from":"169.6663-35.56-191.0009","to":"174.6873-35.56-187.1176","length":6.347475,"timestamp":null}],"timestamp":null},{"id":"167.0508-35.56-185.8345","pos":{"x":167.050751,"y":35.5599976,"z":185.8345,"timestamp":null},"paths":[{"from":"167.0508-35.56-185.8345","to":"169.6663-35.56-191.0009","length":5.790777,"timestamp":null},{"from":"167.0508-35.56-185.8345","to":"164.2002-35.56-182.5426","length":4.354593,"timestamp":null},{"from":"167.0508-35.56-185.8345","to":"166.8381-35.56-180.1288","length":5.709679,"timestamp":null}],"timestamp":null},{"id":"164.2002-35.56-182.5426","pos":{"x":164.2002,"y":35.5599976,"z":182.542572,"timestamp":null},"paths":[{"from":"164.2002-35.56-182.5426","to":"167.0508-35.56-185.8345","length":4.354593,"timestamp":null},{"from":"164.2002-35.56-182.5426","to":"160.5564-35.56-185.1362","length":4.47259045,"timestamp":null},{"from":"164.2002-35.56-182.5426","to":"166.8381-35.56-180.1288","length":3.57562542,"timestamp":null}],"timestamp":null},{"id":"160.5564-35.56-185.1362","pos":{"x":160.556412,"y":35.5599976,"z":185.1362,"timestamp":null},"paths":[{"from":"160.5564-35.56-185.1362","to":"164.2002-35.56-182.5426","length":4.47259045,"timestamp":null},{"from":"160.5564-35.56-185.1362","to":"163.0435-35.56-191.2928","length":6.64001,"timestamp":null}],"timestamp":null},{"id":"163.0435-35.56-191.2928","pos":{"x":163.0435,"y":35.5599976,"z":191.292831,"timestamp":null},"paths":[{"from":"163.0435-35.56-191.2928","to":"160.5564-35.56-185.1362","length":6.64001,"timestamp":null},{"from":"163.0435-35.56-191.2928","to":"166.1599-35.56-199.0072","length":8.320003,"timestamp":null}],"timestamp":null},{"id":"166.1599-35.56-199.0072","pos":{"x":166.159851,"y":35.5599976,"z":199.007156,"timestamp":null},"paths":[{"from":"166.1599-35.56-199.0072","to":"163.0435-35.56-191.2928","length":8.320003,"timestamp":null},{"from":"166.1599-35.56-199.0072","to":"171.4078-35.56-196.8871","length":5.66000938,"timestamp":null}],"timestamp":null},{"id":"171.4078-35.56-196.8871","pos":{"x":171.407822,"y":35.5599976,"z":196.887131,"timestamp":null},"paths":[{"from":"171.4078-35.56-196.8871","to":"166.1599-35.56-199.0072","length":5.66000938,"timestamp":null},{"from":"171.4078-35.56-196.8871","to":"175.2557-35.56-195.3327","length":4.149996,"timestamp":null}],"timestamp":null},{"id":"175.2557-35.56-195.3327","pos":{"x":175.2557,"y":35.5599976,"z":195.3327,"timestamp":null},"paths":[{"from":"175.2557-35.56-195.3327","to":"171.4078-35.56-196.8871","length":4.149996,"timestamp":null},{"from":"175.2557-35.56-195.3327","to":"181.1434-35.56-192.9542","length":6.35000658,"timestamp":null}],"timestamp":null},{"id":"181.1434-35.56-192.9542","pos":{"x":181.143448,"y":35.5599976,"z":192.954239,"timestamp":null},"paths":[{"from":"181.1434-35.56-192.9542","to":"175.2557-35.56-195.3327","length":6.35000658,"timestamp":null},{"from":"181.1434-35.56-192.9542","to":"186.1967-35.56-190.9129","length":5.450004,"timestamp":null}],"timestamp":null},{"id":"186.1967-35.56-190.9129","pos":{"x":186.1967,"y":35.5599976,"z":190.912872,"timestamp":null},"paths":[{"from":"186.1967-35.56-190.9129","to":"181.1434-35.56-192.9542","length":5.450004,"timestamp":null},{"from":"186.1967-35.56-190.9129","to":"191.1387-35.56-188.9165","length":5.33001375,"timestamp":null}],"timestamp":null},{"id":"191.1387-35.56-188.9165","pos":{"x":191.1387,"y":35.5599976,"z":188.916458,"timestamp":null},"paths":[{"from":"191.1387-35.56-188.9165","to":"186.1967-35.56-190.9129","length":5.33001375,"timestamp":null},{"from":"191.1387-35.56-188.9165","to":"189.6966-35.56-185.3467","length":3.85000467,"timestamp":null}],"timestamp":null},{"id":"189.6966-35.56-185.3467","pos":{"x":189.69664,"y":35.5599976,"z":185.346725,"timestamp":null},"paths":[{"from":"189.6966-35.56-185.3467","to":"191.1387-35.56-188.9165","length":3.85000467,"timestamp":null},{"from":"189.6966-35.56-185.3467","to":"187.4642-35.56-179.8206","length":5.96000051,"timestamp":null}],"timestamp":null},{"id":"187.4642-35.56-179.8206","pos":{"x":187.464249,"y":35.5599976,"z":179.8206,"timestamp":null},"paths":[{"from":"187.4642-35.56-179.8206","to":"189.6966-35.56-185.3467","length":5.96000051,"timestamp":null},{"from":"187.4642-35.56-179.8206","to":"185.7862-35.56-175.6667","length":4.48000574,"timestamp":null}],"timestamp":null},{"id":"185.7862-35.56-175.6667","pos":{"x":185.786209,"y":35.5599976,"z":175.666733,"timestamp":null},"paths":[{"from":"185.7862-35.56-175.6667","to":"187.4642-35.56-179.8206","length":4.48000574,"timestamp":null},{"from":"185.7862-35.56-175.6667","to":"183.9059-35.56-171.0122","length":5.02000046,"timestamp":null}],"timestamp":null},{"id":"183.9059-35.56-171.0122","pos":{"x":183.905914,"y":35.5599976,"z":171.012177,"timestamp":null},"paths":[{"from":"183.9059-35.56-171.0122","to":"185.7862-35.56-175.6667","length":5.02000046,"timestamp":null},{"from":"183.9059-35.56-171.0122","to":"180.2898-35.56-172.473","length":3.90000463,"timestamp":null}],"timestamp":null},{"id":"180.2898-35.56-172.473","pos":{"x":180.289825,"y":35.5599976,"z":172.472977,"timestamp":null},"paths":[{"from":"180.2898-35.56-172.473","to":"183.9059-35.56-171.0122","length":3.90000463,"timestamp":null},{"from":"180.2898-35.56-172.473","to":"175.6075-35.56-174.3645","length":5.04999876,"timestamp":null}],"timestamp":null},{"id":"175.6075-35.56-174.3645","pos":{"x":175.607452,"y":35.5599976,"z":174.3645,"timestamp":null},"paths":[{"from":"175.6075-35.56-174.3645","to":"180.2898-35.56-172.473","length":5.04999876,"timestamp":null},{"from":"175.6075-35.56-174.3645","to":"170.9343-35.56-176.2523","length":5.04001045,"timestamp":null}],"timestamp":null},{"id":"170.9343-35.56-176.2523","pos":{"x":170.934341,"y":35.5599976,"z":176.252289,"timestamp":null},"paths":[{"from":"170.9343-35.56-176.2523","to":"175.6075-35.56-174.3645","length":5.04001045,"timestamp":null},{"from":"170.9343-35.56-176.2523","to":"168.9263-35.56-177.689","length":2.46909761,"timestamp":null}],"timestamp":null},{"id":"168.9263-35.56-177.689","pos":{"x":168.9263,"y":35.5599976,"z":177.689026,"timestamp":null},"paths":[{"from":"168.9263-35.56-177.689","to":"170.9343-35.56-176.2523","length":2.46909761,"timestamp":null},{"from":"168.9263-35.56-177.689","to":"166.8381-35.56-180.1288","length":3.21136332,"timestamp":null}],"timestamp":null},{"id":"166.8381-35.56-180.1288","pos":{"x":166.838135,"y":35.5599976,"z":180.128784,"timestamp":null},"paths":[{"from":"166.8381-35.56-180.1288","to":"167.0508-35.56-185.8345","length":5.709679,"timestamp":null},{"from":"166.8381-35.56-180.1288","to":"164.2002-35.56-182.5426","length":3.57562542,"timestamp":null},{"from":"166.8381-35.56-180.1288","to":"168.9263-35.56-177.689","length":3.21136332,"timestamp":null}],"timestamp":null},{"id":"176.1035-35.56-191.2909","pos":{"x":176.103531,"y":35.5599976,"z":191.290909,"timestamp":null},"paths":[{"from":"176.1035-35.56-191.2909","to":"181.749-35.56-189.7545","length":5.85083151,"timestamp":null},{"from":"176.1035-35.56-191.2909","to":"175.8179-35.56-189.7562","length":1.56109989,"timestamp":null},{"from":"176.1035-35.56-191.2909","to":"169.6663-35.56-191.0009","length":6.44375324,"timestamp":null}],"timestamp":null},{"id":"181.5558-35.56-187.0068","pos":{"x":181.5558,"y":35.5599976,"z":187.006821,"timestamp":null},"paths":[{"from":"181.5558-35.56-187.0068","to":"183.0958-35.56-185.5327","length":2.13178754,"timestamp":null},{"from":"181.5558-35.56-187.0068","to":"183.832-35.56-187.4354","length":2.31624556,"timestamp":null},{"from":"181.5558-35.56-187.0068","to":"181.749-35.56-189.7545","length":2.75443578,"timestamp":null},{"from":"181.5558-35.56-187.0068","to":"179.7055-35.56-184.055","length":3.48381448,"timestamp":null}],"timestamp":null},{"id":"185.1139-35.56-183.2399","pos":{"x":185.113876,"y":35.5599976,"z":183.239883,"timestamp":null},"paths":[{"from":"185.1139-35.56-183.2399","to":"183.9089-35.56-180.5774","length":2.92247319,"timestamp":null},{"from":"185.1139-35.56-183.2399","to":"183.0958-35.56-185.5327","length":3.05446935,"timestamp":null}],"timestamp":null},{"id":"179.7055-35.56-184.055","pos":{"x":179.70546,"y":35.5599976,"z":184.055008,"timestamp":null},"paths":[{"from":"179.7055-35.56-184.055","to":"182.0493-35.56-181.4472","length":3.50630069,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"183.0958-35.56-185.5327","length":3.69834256,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"181.5558-35.56-187.0068","length":3.48381448,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"175.8179-35.56-189.7562","length":6.90046453,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"174.6873-35.56-187.1176","length":5.878916,"timestamp":null},{"from":"179.7055-35.56-184.055","to":"179.3083-35.56-180.322","length":3.754069,"timestamp":null}],"timestamp":null},{"id":"174.6873-35.56-187.1176","pos":{"x":174.687256,"y":35.5599976,"z":187.117569,"timestamp":null},"paths":[{"from":"174.6873-35.56-187.1176","to":"179.7055-35.56-184.055","length":5.878916,"timestamp":null},{"from":"174.6873-35.56-187.1176","to":"175.8179-35.56-189.7562","length":2.870629,"timestamp":null},{"from":"174.6873-35.56-187.1176","to":"169.6663-35.56-191.0009","length":6.347475,"timestamp":null}],"timestamp":null},{"id":"180.4933-35.56-176.0469","pos":{"x":180.4933,"y":35.5599976,"z":176.046936,"timestamp":null},"paths":[{"from":"180.4933-35.56-176.0469","to":"177.1631-35.56-178.0285","length":3.87518048,"timestamp":null},{"from":"180.4933-35.56-176.0469","to":"182.0488-35.56-178.0286","length":2.5192008,"timestamp":null}],"timestamp":null}],"timestamp":null}

module.exports = (_game) => {
    return new Scene(
        //mobs
        [
            // ######################
            // #### STARTER ZONE ####
            // ######################
            new Mob(_game, a0zix(2, {x:640,y:40,z:13.38}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(1, {x:605.7,y:40,z:9.5}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:612,y:40,z:49}, {x:0,y:0,z:0})),

            new Mob(_game, a0zix(3, {x:584,y:40,z:68}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:591,y:40,z:51}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(1, {x:581,y:40,z:58}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:578,y:40,z:63}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(3, {x:589,y:40,z:60.6}, {x:0,y:0,z:0})),
            
            new Mob(_game, a0zix(2, {x:540,y:40,z:50}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:565,y:40,z:53}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(1, {x:561,y:40,z:62}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:548,y:40,z:69}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(3, {x:550,y:40,z:58}, {x:0,y:0,z:0})),

            new Mob(_game, a0zix(3, {x:572,y:40,z:34}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:565,y:40,z:35}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:552,y:40,z:41}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(1, {x:552,y:40,z:50}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:561,y:40,z:41}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(3, {x:559,y:40,z:32}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:563,y:40,z:33.5}, {x:0,y:0,z:0})),

            new Mob(_game, a0zix(2, {x:535,y:40,z:35}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(1, {x:542,y:40,z:36}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:545,y:40,z:39}, {x:0,y:0,z:0})),

            new Mob(_game, a0zix(3, {x:510,y:40,z:43}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:513,y:40,z:42}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(1, {x:507,y:40,z:47.6}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:521,y:40,z:48.6}, {x:0,y:0,z:0})),

            new Mob(_game, a0zix(3, {x:488,y:39.06,z:65.14}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:482,y:38,z:68.2}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(1, {x:476.5,y:38.26,z:60.38}, {x:0,y:0,z:0})),
            new Mob(_game, a0zix(2, {x:487.66,y:39.1,z:57.19}, {x:0,y:0,z:0})),

            new Mob(_game, enragedA0Zix(5, {x:643.66,y:40.29,z:41.04}, {x:0,y:0,z:0})),

            // ###########################
            // #### INTERMEDIATE ZONE ####
            // ###########################
            new Mob(_game, toxicA0zix(8, {x:487,y:40,z:-221}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(10, {x:492,y:40,z:-220}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:493,y:40,z:-219}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:499,y:40,z:-218}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:503,y:40,z:-217}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:551,y:40,z:-216}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:532,y:40,z:-219}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(10, {x:591,y:40,z:-220}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:491,y:40,z:-218}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:488,y:40,z:-221}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:521,y:40,z:-219}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:555,y:40,z:-216}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:567,y:40,z:-220}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:589,y:40,z:-219}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:575,y:40,z:-219}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:571,y:40,z:-218}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(10, {x:561,y:40,z:-217}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:599,y:40,z:-220}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:512,y:40,z:-219}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:519,y:40,z:-216}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:529,y:40,z:-220}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(10, {x:531,y:40,z:-221}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:548,y:40,z:-220}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:559,y:40,z:-219}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(8, {x:543,y:40,z:-218}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(10, {x:537,y:40,z:-217}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:578,y:40,z:-220}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(10, {x:584,y:40,z:-216}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:568,y:40,z:-217}, {x:0,y:0,z:0})),
            new Mob(_game, toxicA0zix(9, {x:600,y:40,z:-215}, {x:0,y:0,z:0})),

            new Mob(_game, enragedA0Zix(15, {x:569.34,y:40,z:-243.62}, {x:0,y:0,z:0})),
        ],
        waypointGraph
    );
};