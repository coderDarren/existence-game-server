'use strict';
const {Vector3, Vec3Right, LowPrecisionSimpleVector3} = require('../util/vector.js');
const getPath = require('./pathfinder.js');

const NETMSG_MOB_ATTACK_START = "MOB_ATTACK_START";
const NETMSG_MOB_ATTACK = "MOB_ATTACK";
const NETMSG_MOB_HIT_PLAYER = "MOB_HIT_PLAYER";
const NETMSG_MOB_COMBAT_STATE_CHANGE = "MOB_COMBAT_STATE_CHANGE";
const NETMSG_MOB_ATTACK_RANGE_CHANGE = "MOB_ATTACK_RANGE_STATE_CHANGE";
const NETMSG_MOB_HEALTH_CHANGE = "MOB_HEALTH_CHANGE";

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

        // create a table for the mob to keep track of who is doing the most damage
        this._damageTable = {};
        this._aggroSwitchTime = 1;
        this._aggroSwitchTimer = 0;

        // these values help us determine if the mob is stationary or not
        this._lastFramePos = this._data.pos;
        this._lastFrameRot = this._data.rot;
        this._posChange = 0;
        this._rotChange = 0;

        this.__detect_stationary__ = this.__detect_stationary__.bind(this);
        this.__choose_target__ = this.__choose_target__.bind(this);
        this.__follow_target__ = this.__follow_target__.bind(this);
        this.__lookAt_target__ = this.__lookAt_target__.bind(this);
        this.__attack_target__ = this.__attack_target__.bind(this);
        this.__target_is_in_range__ = this.__target_is_in_range__.bind(this);
        this.__patrol__ = this.__patrol__.bind(this);
        this.__retreat__ = this.__retreat__.bind(this);
        this.__heal_over_time__ = this.__heal_over_time__.bind(this);
        this.__send_message_to_nearby_players__ = this.__send_message_to_nearby_players__.bind(this);
        this.__on_attack_range_state_change__ = this.__on_attack_range_state_change__.bind(this);
        this.__on_combat_state_change__ = this.__on_combat_state_change__.bind(this);
        this.__on_health_change__ = this.__on_health_change__.bind(this);
    }

    update() {
        this.__detect_stationary__();
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

    __detect_stationary__() {
        this._posChange = new Vector3(this._data.pos).distanceTo(new Vector3(this._lastFramePos));
        this._rotChange = new Vector3(this._data.rot).distanceTo(new Vector3(this._lastFrameRot));
        this._lastFramePos = this._data.pos;
        this._lastFrameRot = this._data.rot;
    }

    hit(_mobHitInfo) {
        if (this._damageTable[_mobHitInfo.playerName] == undefined) {
            this._damageTable[_mobHitInfo.playerName] = 0;
        }
        this._damageTable[_mobHitInfo.playerName] += _mobHitInfo.dmg;

        this._data.health -= _mobHitInfo.dmg;
        if (this._data.health <= 0) {
            this._data.health = 0;
        }
        this.__on_health_change__();
    }

    __choose_target__() {
        const _mobPos = new Vector3(this._data.pos);
        this._targets = this._game.scanNearbyPlayers(this._data.pos, this._data.retreatRange);

        var _max = 0;
        var _maxIndex = 0;
        for (i in this._targets) {
            const _target = this._targets[i];
            if (this._damageTable[_target.name] == undefined) {
                this._damageTable[_target.name] = 0;
            }

            console.log(`damage table: ${JSON.stringify(this._damageTable)}`)
            if (this._damageTable[_target.name] > _max) {
                _max = this._damageTable[_target.name];
                _maxIndex = i;
            }
        }

        if (this._targets.length == 0 || _mobPos.distanceTo(this._defaultPos) > 50) {
            this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, this._defaultPos);
            this._waypoint = this._waypoints[0];
            this.__lookAt_target__();
            this._data.inCombat = false;
            this.__on_combat_state_change__();
            return;
        }

        this._target = this._targets[_maxIndex];
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
            if (this._attackTimer > this._data.attackSpeed) {
                // send damage info to all nearby players
                this.__on_hit_player__(this._target.name, Math.floor((Math.random()+1)*10));

                // reset timers
                this._attackTimer = 0;
                this._rechargeTimer = 0;
            }
        } else if (this._rechargeTimer < this._data.rechargeSpeed) {
            this._attackTimer = 0;
            this._rechargeTimer += this._game.deltaTime;

            if (this._rechargeTimer >= this._data.rechargeSpeed) {
                // force attack animation
                this.__on_attack__();
            }
        }
    }

    __target_is_in_range__() {
        if (this._target == null) {
            return false;
        }
        
        const _mobPos = new Vector3(this._data.pos);
        const _targetPos = new Vector3(this._target.pos);
        const _dist = _mobPos.distanceTo(_targetPos);
        if (_dist <= this._data.attackRange && !this._data.inAttackRange) {
            this._data.inAttackRange = true;
            this.__on_attack_range_state_change__();
        } else if (_dist > this._data.attackRange && this._data.inAttackRange) {
            this._data.inAttackRange = false;
            this.__on_attack_range_state_change__();
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
            this._rechargeTimer = this._data.rechargeSpeed;
            this._damageTable = {};
            this._data.inCombat = true;
            this.__on_combat_state_change__();
            this.__on_attack_start__(this._targets[0].name);
        }
    }

    __heal_over_time__() {
        this._data.health += this._data.healDelta;
        if (this._data.health > this._data.maxHealth) {
            this._data.health = this._data.maxHealth;
        } else {
            this.__on_health_change__();
        }
    }

    __on_attack__() {
        this.__send_message_to_nearby_players__(NETMSG_MOB_ATTACK, {
            id: this._data.id,
        });
    }

    __on_attack_start__(_player) {
        this.__send_message_to_nearby_players__(NETMSG_MOB_ATTACK_START, {
            mobName: this._data.name,
            playerName: _player,
        });
    }

    __on_hit_player__(_player, _dmg) {
        this.__send_message_to_nearby_players__(NETMSG_MOB_HIT_PLAYER, {
            mobId: this._data.id,
            mobName: this._data.name,
            playerName: _player,
            dmg: _dmg
        });
    }

    __on_attack_range_state_change__() {
        this.__send_message_to_nearby_players__(NETMSG_MOB_ATTACK_RANGE_CHANGE, {
            id: this._data.id,
            inAttackRange: this._data.inAttackRange
        });
    }

    __on_combat_state_change__() {
        this.__send_message_to_nearby_players__(NETMSG_MOB_COMBAT_STATE_CHANGE, {
            id: this._data.id,
            inCombat: this._data.inCombat
        });
    }

    __on_health_change__() {
        this.__send_message_to_nearby_players__(NETMSG_MOB_HEALTH_CHANGE, {
            id: this._data.id,
            health: this._data.health
        });
    }

    __send_message_to_nearby_players__(_evt, _msg) {
        const _nearbySockets = this._game.scanNearbyPlayerSockets(this._data.pos, 50);
        for (i in _nearbySockets) {
            const _socket = _nearbySockets[i];
            _socket.emit(_evt, {
                message: JSON.stringify(_msg)
            });
        }
    }

    get spawnData() { 
        return {
            id: this._data.id,
            name: this._data.name,
            level: this._data.level,
            maxHealth: this._data.maxHealth,
            health: this._data.health,
            maxEnergy: this._data.maxEnergy,
            energy: this._data.energy,
            pos: LowPrecisionSimpleVector3(this._data.pos),
            rot: LowPrecisionSimpleVector3(this._data.rot),
            inCombat: this._data.inCombat,
            inAttackRange: this._data.inAttackRange
        }
    }

    get data() {
        return {
            id: this._data.id,
            pos: LowPrecisionSimpleVector3(this._data.pos),
            rot: LowPrecisionSimpleVector3(this._data.rot),
        }
    }

    get isStationary() {
        return this._posChange == 0 && this._rotChange == 0;
    }
}

module.exports = Mob;