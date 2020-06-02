'use strict';
const {Vector3, Vec3Right} = require('../util/vector.js');
const getPath = require('./pathfinder.js');

const NETWORK_MESSAGE_MOB_ATTACK = "MOB_ATTACK";
const NETWORK_MESSAGE_HIT_PLAYER = "HIT_PLAYER";

class Mob {

    constructor(_game, _data) {
        this._game = _game;
        this._data = _data;
        this._targets = [];
        this._target = null;
        this._defaultPos = new Vector3(this._data.pos);
        this._defaultRot = new Vector3(this._data.rot);
        this._speedVariance = 2;
        this._runSpeed = this._data.runSpeed - (this._speedVariance / 2) + Math.random() * this._speedVariance;
        this._attackTimer = 0;
        this._rechargeTimer = 0;

        this.__choose_target__ = this.__choose_target__.bind(this);
        this.__follow_target__ = this.__follow_target__.bind(this);
        this.__lookAt_target__ = this.__lookAt_target__.bind(this);
        this.__attack_target__ = this.__attack_target__.bind(this);
        this.__target_is_in_range__ = this.__target_is_in_range__.bind(this);
        this.__patrol__ = this.__patrol__.bind(this);
        this.__retreat__ = this.__retreat__.bind(this);
        this.__heal_over_time__ = this.__heal_over_time__.bind(this);
    }

    update() {
        const _mobPos = new Vector3(this._data.pos);
        
        if (this._data.inCombat) {
            this.__choose_target__();
            this.__follow_target__();
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
        this._targets = this._game.scanNearbyPlayers(this._data.pos, this._data.retreatRange);
        const _mobPos = new Vector3(this._data.pos);
        if (this._targets.length == 0 || _mobPos.distanceTo(this._defaultPos) > 50) {
            this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, this._defaultPos);
            this._waypoint = this._waypoints[0];
            this.__lookAt_target__();
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

        // iterate over positions moving to each one in path
        if (_mobPos.equals(this._waypoint)) {
            this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, _targetPos);
            const _index = this._waypoints.length > 1 ? 1 : 0;
            this._waypoint = this._waypoints[_index];
            this.__lookAt_target__();
        }

        this._data.pos = _mobPos.moveToward(this._waypoint, this._runSpeed * this._game.deltaTime).obj;
    }

    __lookAt_target__() {
        const _mobPos = new Vector3(this._data.pos);
        const _dir = _mobPos.lookAt(this._waypoint);
        this._data.rot.y = _dir.angleTo(Vec3Right);
    }

    __attack_target__() {
        // if the target is in range and mob recharge is ready
        if (this.__target_is_in_range__() && this._rechargeTimer >= this._data.rechargeSpeed) {
            // build up to attack
            this._attackTimer += this._game.deltaTime;
            console.log(`attack: ${this._attackTimer}`);
            if (this._attackTimer > this._data.attackSpeed) {
                // send damage info to all nearby players
                const _nearbySockets = this._game.scanNearbyPlayerSockets(this._data.pos, 50);
                
                for (i in _nearbySockets) {
                    const _socket = _nearbySockets[i];
                    _socket.emit(NETWORK_MESSAGE_HIT_PLAYER, {
                        message: JSON.stringify({
                            mobId: this._data.id,
                            mobName: this._data.name,
                            playerName: this._target.name,
                            dmg: 5
                        })
                    });
                }

                // reset timers
                this._attackTimer = 0;
                this._rechargeTimer = 0;
            }
        } else if (this._rechargeTimer < this._data.rechargeSpeed) {
            this._attackTimer = 0;
            this._rechargeTimer += this._game.deltaTime;

            if (this._rechargeTimer >= this._data.rechargeSpeed) {
                // force attack animation
                const _nearbySockets = this._game.scanNearbyPlayerSockets(this._data.pos, 50);
                for (i in _nearbySockets) {
                    const _socket = _nearbySockets[i];
                    _socket.emit(NETWORK_MESSAGE_MOB_ATTACK, {
                        message: JSON.stringify({
                            id: this._data.id,
                        })
                    });
                }
            }
        }
    }

    __target_is_in_range__() {
        this._data.inAttackRange = false;
        if (this._target == null) {
            return false;
        }
        
        const _mobPos = new Vector3(this._data.pos);
        const _targetPos = new Vector3(this._target.pos);
        const _dist = _mobPos.distanceTo(_targetPos);
        if (_dist <= this._data.attackRange) {
            this._data.inAttackRange = true;
        }

        return this._data.inAttackRange;
    }

    __retreat__() {
        const _mobPos = new Vector3(this._data.pos);
        const _targetPos = this._defaultPos;

        // iterate over positions moving to each one in path
        if (_mobPos.equals(this._waypoint)) {
            this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, _targetPos);
            const _index = this._waypoints.length > 1 ? 1 : 0;
            this._waypoint = this._waypoints[_index];
            this.__lookAt_target__();
        }

        this._data.pos = _mobPos.moveToward(this._waypoint, this._runSpeed * this._game.deltaTime).obj;
    }

    __patrol__() {
        this._targets = this._game.scanNearbyPlayers(this._data.pos, this._data.aggroRange);
        const _mobPos = new Vector3(this._data.pos);
        this._data.rot = this._defaultRot.obj;
        if (this._targets.length > 0) {
            const _targetPos = new Vector3(this._targets[0].pos);
            this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, _targetPos);
            this._waypoint = this._waypoints[0];
            this.__lookAt_target__();
            this._data.inCombat = true;
            this._rechargeTimer = this._data.rechargeSpeed;
        }
    }

    __heal_over_time__() {
        this._data.health += this._data.healDelta;
        if (this._data.health > this._data.maxHealth) {
            this._data.health = this._data.maxHealth;
        }
    }

    get data() { 
        return {
            id: this._data.id,
            name: this._data.name,
            pos: this._data.pos,
            rot: this._data.rot,
            inCombat: this._data.inCombat,
            inAttackRange: this._data.inAttackRange
        }
    }
}

module.exports = Mob;