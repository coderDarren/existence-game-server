const {Vector3, Vec3Zero} = require('../util/vector.js');
const {find, filter} = require('lodash');

const __waypoint_pos__ = function(_waypoint) {
    return new Vector3({x:_waypoint.pos.x, y:_waypoint.pos.y, z:_waypoint.pos.z});
}

const __get_closest_waypoint__ = function(_waypoints, _target) {
    var _closestWaypoint = null;
    var _dist = Number.MAX_SAFE_INTEGER;
    for (i in _waypoints) {
        const _waypoint = _waypoints[i];
        const _distCheck = __waypoint_pos__(_waypoint).distanceTo(_target);
        if (_distCheck < _dist) {
            _closestWaypoint = _waypoint;
            _dist = _distCheck;
        }
    }
    return _closestWaypoint;
}

const __get_best_scoring_waypoint__ = function(_waypoints) {
    var _score = Number.MAX_SAFE_INTEGER;
    var _best = null;
    for (i in _waypoints) {
        const _waypoint = _waypoints[i];
        if (_waypoint.f < _score) {
            _score = _waypoint.f;
            _best = _waypoint;
        }
    }
    return _best;
}

const __get_waypoint__ = function(_waypoints, _id) {
    return find(_waypoints, _waypoint => { return _waypoint.id == _id; });
}

const getPath = function(_waypointGraph, _from, _to) {
    let _graph = JSON.parse(JSON.stringify(_waypointGraph));
    var _waypoints = _graph.waypoints.slice();
    
    var _opened = [];
    var _path = [_to];

    // get the closest point to '_to' in the _waypointGraph
    var _goal = __get_closest_waypoint__(_waypoints, _to);
    if (_goal == null) {
        //console.log('Unable to find closest point to target position');
        return _path;
    }
    _to = __waypoint_pos__(_goal);

    // get the closest point to '_from' in the _waypointGraph
    var _start = __get_closest_waypoint__(_waypoints, _from);
    if (_start == null) {
        //console.log('Unable to find closest point to starting position');
        return _path;
    }

    //console.log(`start: ${_start.id}, goal: ${_goal.id}`);

    // find path from _start
    // calculate G + H for _start, where G = distance to starting point and H = distance to target, and F = total score
    _start.g = 0;
    _start.h = __waypoint_pos__(_start).distanceTo(_to);
    _start.f = _start.g + _start.h;
    // add starting waypoint to opened list
    _opened.push(_start);

    // continue while there are still waypoints to be looked at
    var _curr = null;
    while (_opened.length > 0) {
        // get the lowest scoring waypoint in _opened
        _curr = __get_best_scoring_waypoint__(_opened);
        
        if (_curr.id == _goal.id) {
            // we found a path to the target
            //console.log(`found goal... current: ${_curr.id}, goal: ${_goal.id}`);
            _curr = _goal;
            break;
        }
        
        // remove current from opened list
        _opened = filter(_opened, _waypoint => { return _waypoint.id != _curr.id });

        // search neighbors
        for (i in _curr.paths) {
            var _neighbor = __get_waypoint__(_waypoints, _curr.paths[i].to);
            var _weight = _curr.paths[i].length;
            var _g = _curr.g + _weight;
        
            // this path is cheaper than any other found.. save..
            if (_neighbor.g == null || _g < _neighbor.g) {
                _neighbor.parent = _curr.id;
                _neighbor.g = _g;
                _neighbor.h = __waypoint_pos__(_neighbor).distanceTo(_to);
                _neighbor.f = _neighbor.g + _neighbor.h;
                
                // add neighbor to open set if it hasnt been added yet
                if (__get_waypoint__(_opened, _neighbor.id) == null) {
                    //console.log('adding neighbor: '+_neighbor.id);
                    _opened.push(_neighbor);
                }
            }
        }
    }

    if (_curr == null || _curr.id != _goal.id) {
        //console.log('Path could not be found: '+JSON.stringify(_curr));
        //return _path;
    } else {
        //console.log('Path was found!');
    }

    while (_curr != null) {
        _path.push(new Vector3(_curr.pos));
        //console.log(`pushing ${_curr.id} to path`);
        _curr = __get_waypoint__(_waypoints, _curr.parent);
    }

    return _path.reverse();
}

module.exports = getPath;