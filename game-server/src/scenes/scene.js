'use strict';

class Scene {

    constructor(_mobs) {
        this._mobs = _mobs;
    }

    get mobs() {
        return this._mobs;
    }
}

module.exports = {
    Scene
};