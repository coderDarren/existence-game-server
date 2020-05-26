'use strict';

class Scene {

    constructor(_mobs, _waypointGraph) {
        this._mobs = _mobs;
        this._waypointGraph = _waypointGraph;
    }

    get mobs() {
        return this._mobs;
    }
    
    get waypointGraph() {
        return this._waypointGraph;
    }
}

module.exports = {
    Scene
};