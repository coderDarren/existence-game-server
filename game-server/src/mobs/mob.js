'use strict';
const API = require('../util/api.js');
const {map, find, filter} = require('lodash');
const {Vector3, Vec3Right, LowPrecisionSimpleVector3} = require('../util/vector.js');
const getPath = require('./pathfinder.js');

const NETMSG_MOB_ATTACK_START = "MOB_ATTACK_START";
const NETMSG_MOB_ATTACK = "MOB_ATTACK";
const NETMSG_MOB_HIT_PLAYER = "MOB_HIT_PLAYER";
const NETMSG_MOB_COMBAT_STATE_CHANGE = "MOB_COMBAT_STATE_CHANGE";
const NETMSG_MOB_ATTACK_RANGE_CHANGE = "MOB_ATTACK_RANGE_STATE_CHANGE";
const NETMSG_MOB_HEALTH_CHANGE = "MOB_HEALTH_CHANGE";
const NETMSG_MOB_DEATH = "MOB_DEATH";

class Mob {

    constructor(_game, _data) {
        this._game = _game;
        this._data = _data;
        // track initial data for respawn
        this._initialData = JSON.parse(JSON.stringify(this._data));
        this._targets = [];
        this._defaultPos = new Vector3(this._data.pos);
        this._defaultRot = new Vector3(this._data.rot);
        this._speedVariance = 2;

        this.__detect_stationary__ = this.__detect_stationary__.bind(this);
        this.__choose_target__ = this.__choose_target__.bind(this);
        this.__follow_target__ = this.__follow_target__.bind(this);
        this.__lookAt_target__ = this.__lookAt_target__.bind(this);
        this.__attack_target__ = this.__attack_target__.bind(this);
        this.__target_is_in_range__ = this.__target_is_in_range__.bind(this);
        this.__patrol__ = this.__patrol__.bind(this);
        this.__retreat__ = this.__retreat__.bind(this);
        this.__heal_over_time__ = this.__heal_over_time__.bind(this);
        this.__kill__ = this.__kill__.bind(this);
        this.__reset__ = this.__reset__.bind(this);
        this.__handle_loot__ = this.__handle_loot__.bind(this);
        this.__send_message_to_nearby_players__ = this.__send_message_to_nearby_players__.bind(this);
        this.__on_attack_range_state_change__ = this.__on_attack_range_state_change__.bind(this);
        this.__on_combat_state_change__ = this.__on_combat_state_change__.bind(this);
        this.__on_health_change__ = this.__on_health_change__.bind(this)
        this.__on_death__ = this.__on_death__.bind(this);

        this.__reset__();
    }

    update() {
        this.__detect_stationary__();
        const _mobPos = new Vector3(this._data.pos);
        
        if (this._dead) {
            this.__handle_loot__();
        } else if (this._data.inCombat) {
            this.__choose_target__();
            this.__follow_target__();
            this.__attack_target__();
        } else if (!_mobPos.equals(this._defaultPos)) {
            this.__retreat__();
            this.__heal_over_time__();
        } else if (!this._dead) { // alive
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
            this.__kill__();
        }
        this.__on_health_change__();
    }

    /*
     * Called by player when trying to loot an item
     * return false if loot is locked, or unavailable to player
     * return true if loot is available
     */
    tryLoot(_id) {
        if (!this._dead) return -1;
        if (this._lootPreview == null) return -1;
        var _loot = find(this._lootPreview, _l => {return _l.id == _id});
        if (!_loot) return -1;
        if (_loot.locked) return -2;
        _loot.locked = true;
        this._lootPreview = filter(this._lootPreview, _l => {return _l.id != _id;});
        return JSON.parse(find(this._loot, _loot => {
            const _l = JSON.parse(_loot);
            return _l.def.id == _id
        }));
    }

    /*
     * Called by player if looting fails due to server error
     */
    restoreLoot(_loot) {
        var _loot = find(this._lootPreview, _l => {return _l.id == _id});
        if (!_loot) return;
        _loot.locked = false;
    }

    __choose_target__() {
        const _mobPos = new Vector3(this._data.pos);
        
        // find nearby potential targets
        this._targets = this._game.scanNearbyPlayers(this._data.pos, this._data.retreatRange);

        // start with the closest target
        if (this._target == null) {
            this._target = this._targets[0];
            this.__on_attack_start__(this._target.name);
            return;
        }

        // choose the target that does the most damage
        var _max = 0;
        var _maxIndex = 0;
        for (var i in this._targets) {
            const _target = this._targets[i];
            if (this._damageTable[_target.name] == undefined) {
                this._damageTable[_target.name] = 0;
            }

            if (this._damageTable[_target.name] > _max) {
                _max = this._damageTable[_target.name];
                _maxIndex = i;
            }
        }

        // take the mob out of combat if there are no more targets or if the mob is 50 units away from their spawn pos
        if (this._targets.length == 0 || _mobPos.distanceTo(this._defaultPos) > this._data.retreatRange) {
            //this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, this._defaultPos);
            //this._waypoint = this._waypoints[0];
            this._waypoint = this._defaultPos;
            this.__lookAt_target__();
            this._data.inCombat = false;
            this._target = null;
            this.__on_combat_state_change__();
            return;
        }

        // assign the target if it is new
        if (this._targets[_maxIndex].name != this._target.name) {
            // this is a new target
            this.__on_attack_start__(this._targets[_maxIndex].name);
        }

        this._target = this._targets[_maxIndex];
    }

    __follow_target__() {
        if (!this._target) return;
        const _mobPos = new Vector3(this._data.pos);
        const _targetPos = new Vector3(this._target.pos);
        if (_mobPos.distanceTo(_targetPos) < 1) {
            return;
        }

        // iterate over positions moving to each one in path
        if (_mobPos.equals(this._waypoint)) {
            //this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, _targetPos);
            //const _index = this._waypoints.length > 1 ? 1 : 0;
            //this._waypoint = this._waypoints[_index];
            this._waypoint = _targetPos;
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
                this.__on_hit_player__(this._target, Math.floor(this._data.minDamage + Math.random() * this._data.maxDamage));

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
            //this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, _targetPos);
            //const _index = this._waypoints.length > 1 ? 1 : 0;
            //this._waypoint = this._waypoints[_index];
            this._waypoint = _targetPos;
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
            //this._waypoints = getPath(this._game.scene.waypointGraph, _mobPos, _targetPos);
            //this._waypoint = this._waypoints[0];
            this._waypoint = _targetPos;
            this.__lookAt_target__();
            this._rechargeTimer = this._data.rechargeSpeed;
            this._damageTable = {};
            this._data.inCombat = true;
            this.__on_combat_state_change__();
        }
    }

    __heal_over_time__() {
        this._data.health += this._data.healDelta;
        if (this._data.health > this._data.maxHealth) {
            this._data.health = this._data.maxHealth;
            this.__on_health_change__();
        } else {
            this.__on_health_change__();
        }
    }

    __kill__() {
        if (this._dead) return;
        this._dead = true;
        this._data.inCombat = false;
        this._target = null;
        this._data.inAttackRange = false;
        this.__on_death__();
    }

    __handle_loot__() {
        this._lootTimer += this._game.deltaTime;
        if (this._lootTimer > this._data.lootTime) {
            this._game.killMob(this._data.id);
        }
    }

    __reset__() {
        this._target = null;
        this._data.health = this._data.maxHealth;
        this._data.energy = this._data.maxEnergy;
        this._runSpeed = this._data.runSpeed - (this._speedVariance / 2) + Math.random() * this._speedVariance;
        this._attackTimer = 0;
        this._rechargeTimer = 0;
        this._lootTimer = 0;

        // create a table for the mob to keep track of who is doing the most damage
        this._damageTable = {};
        this._aggroSwitchTime = 1;
        this._aggroSwitchTimer = 0;

        // these values help us determine if the mob is stationary or not
        this._lastFramePos = this._data.pos;
        this._lastFrameRot = this._data.rot;
        this._posChange = 0;
        this._rotChange = 0;
        this._dead = false;
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
        _player.health -= _dmg;
        if (_player.health < 0) {
            _player.health = 0;
        }

        this.__send_message_to_nearby_players__(NETMSG_MOB_HIT_PLAYER, {
            mobId: this._data.id,
            mobName: this._data.name,
            playerName: _player.name,
            dmg: _dmg,
            health: _player.health
        });

        if (_player.health == 0) {
            // notify nearby players..
        }
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

    async __on_death__() {
        // get loot
        this._loot = await API.getMobLoot({
            mobName: this._data.name,
            lvl: this._data.level
        });

        this._lootPreview = map(this._loot, _loot => { 
            const _l = JSON.parse(_loot);
            return {
                id: _l.def.id,
                name: _l.def.name,
                level: _l.def.level,
                icon: _l.def.icon,
                locked: false
            } 
        });

        // calculate xp reward
        const _xp = this._data.xpReward + (Math.random()*this._data.xpRewardVariance);
        var _xpAllottment = [];

        // decide who gets xp for this kill
        Object.keys(this._damageTable).forEach((_key, _index) => {
            _xpAllottment.push({
                playerName: _key,
                xp: Math.floor(_xp)
            });
        });

        // send xp and loot
        this.__send_message_to_nearby_players__(NETMSG_MOB_DEATH, {
            id: this._data.id,
            name: this._data.name,
            xpAllottment: _xpAllottment,
            lootPreview: this._lootPreview,
            // loot rights (array of players that can loot)
            // xp distribution (array of players and xp allotment)
        });

        this._damageTable = {};

        this._game.respawnMob(this._initialData, this._data.respawnTime*1000);
    }

    __send_message_to_nearby_players__(_evt, _msg) {
        const _nearbySockets = this._game.scanNearbyPlayerSockets(this._data.pos, 50);
        for (var i in _nearbySockets) {
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
            inAttackRange: this._data.inAttackRange,
            dead: this._dead,
            lootPreview: this._lootPreview
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

    get dead() {
        return this._dead;
    }

}

module.exports = Mob;