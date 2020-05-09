'use strict';

class Mob {

    constructor(_game, _data) {
        this._game = _game;
        this._data = _data;
        this._targets = [];
        this._target = null;

        this.__choose_target__ = this.__choose_target__.bind(this);
        this.__follow_target__ = this.__follow_target__.bind(this);
        this.__attack_target__ = this.__attack_target__.bind(this);
        this.__patrol__ = this.__patrol__.bind(this);
    }

    update() {
        this._targets = this._game.scanNearbyPlayers();
        
        if (this._data.inCombat) {
            this.__choose_target__();
            this.__follow_target__();
            this.__attack_target__();
        } else {
            this.__patrol__();
        }
    }

    hit(_mobHitInfo) {
        this._data.health -= _mobHitInfo.dmg;
        if (this._data.health <= 0) {
            this._data.health = 0;
        }
    }

    __choose_target__() {

    }

    __follow_target__() {

    }

    __attack_target__() {

    }

    __patrol__() {
        //this._data.rot.y += 10;
        this._data.health += this._data.healDelta;
        if (this._data.health > this._data.maxHealth) {
            this._data.health = this._data.maxHealth;
        }
    }

    get data() { return this._data; }
    set data(_val) { this._data = _val; }
}

module.exports = Mob;