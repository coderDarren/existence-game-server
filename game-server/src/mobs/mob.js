'use strict';
const {Vector3, Vec3Right} = require('../util/vector.js');
const getPath = require('./pathfinder.js');

class Mob {

    constructor(_game, _data) {
        this._game = _game;
        this._data = _data;
        this._targets = [];
        this._target = null;
        this._defaultPos = new Vector3(this._data.pos);
        this._defaultRot = new Vector3(this._data.rot);

        this.__choose_target__ = this.__choose_target__.bind(this);
        this.__follow_target__ = this.__follow_target__.bind(this);
        this.__lookAt_target__ = this.__lookAt_target__.bind(this);
        this.__attack_target__ = this.__attack_target__.bind(this);
        this.__patrol__ = this.__patrol__.bind(this);
        this.__retreat__ = this.__retreat__.bind(this);
        this.__heal_over_time__ = this.__heal_over_time__.bind(this);
    }

    update() {
        this._targets = this._game.scanNearbyPlayers(this._data.pos, this._data.aggroRange);
        const _mobPos = new Vector3(this._data.pos);
        
        if (this._data.inCombat) {
            this.__choose_target__();
            this.__follow_target__();
            this.__lookAt_target__();
            this.__attack_target__();
        } else if (!_mobPos.equals(this._defaultPos)) {
            this.__retreat__();
            this.__heal_over_time__();
        } else {
            this.__patrol__();
            this.__heal_over_time__();
        }
    }

    hit(_mobHitInfo) {
        this._data.health -= _mobHitInfo.dmg;
        if (this._data.health <= 0) {
            this._data.health = 0;
        }
    }

    __choose_target__() {
        const _mobPos = new Vector3(this._data.pos);
        if (this._targets.length == 0 || _mobPos.distanceTo(this._defaultPos) > 50) {
            this._data.inCombat = false;
            return;
        }

        this._target = this._targets[0];
    }

    __follow_target__() {
        const _mobPos = new Vector3(this._data.pos);
        const _targetPos = new Vector3(this._target.pos);
        if (_mobPos.distanceTo(_targetPos) < 1) {
            return;
        }

        // construct path to target
        const _waypoints = getPath(_mobPos, _targetPos);
        // iterate over positions moving to each one in path

        this._data.pos = _mobPos.moveToward(_targetPos, 3 * this._game.deltaTime).obj;
    }

    __lookAt_target__() {
        const _mobPos = new Vector3(this._data.pos);
        const _targetPos = new Vector3(this._target.pos);
        const _dir = _mobPos.lookAt(_targetPos);
        this._data.rot.y = _dir.angleTo(Vec3Right);
    }

    __attack_target__() {

    }

    __retreat__() {
        const _mobPos = new Vector3(this._data.pos);
        const _targetPos = this._defaultPos;
        const _dir = _mobPos.lookAt(_targetPos);
        this._data.rot.y = _dir.angleTo(Vec3Right);
        this._data.pos = _mobPos.moveToward(this._defaultPos, 3 * this._game.deltaTime).obj;
    }

    __patrol__() {
        this._data.rot = this._defaultRot.obj;
        if (this._targets.length > 0) {
            this._data.inCombat = true;
        }
    }

    __heal_over_time__() {
        this._data.health += this._data.healDelta;
        if (this._data.health > this._data.maxHealth) {
            this._data.health = this._data.maxHealth;
        }
    }

    get data() { return this._data; }
    set data(_val) { this._data = _val; }
}

module.exports = Mob;