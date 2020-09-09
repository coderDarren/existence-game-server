'use strict';

class Scene {

    constructor(_mobs, _waypointGraph, _shops=null) {
        this._mobs = _mobs;
        this._shops = _shops;
        this._waypointGraph = _waypointGraph;
    }

    get mobs() {
        return this._mobs;
    }

    get shops() {
        return this._shops;
    }
    
    get waypointGraph() {
        return this._waypointGraph;
    }
}

module.exports = {
    Scene
};