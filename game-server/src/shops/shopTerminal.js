const {ItemType} = require('../definitions/enum.js');
const API = require('../util/api.js');
const {map} = require('lodash');

class ShopTerminal {
    constructor(_game, _props) {
        this._game = _game;
        this._id = _props.id;
        this._pos = _props.pos;
        this._refreshRate = _props.refreshRate;
        this._shopType = _props.shopType;
        this._lvlRange = _props.lvlRange;
        this._refreshTimer = 0;
        this._items = [];
        this._population = [];

        this.__init__ = this.__init__.bind(this);
        this.__populate__ = this.__populate__.bind(this);
        this.__calculate_item_stats__ = this.__calculate_item_stats__.bind(this);
        this.__init__();
    }

    update() {
        this._refreshTimer += this._game.deltaTime;
        if (this._refreshTimer >= this._refreshRate) {
            this.__populate__();
        }
    }

    async __init__() {
        const _resp = await API.getShopItems(this._shopType);
        if (_resp.error) {
            console.log(_resp);
            return;
        }
        this._items = JSON.parse(_resp.message);
        this.__populate__();
    }

    __populate__() {
        this._population = [];
        for (var i in this._items) {
            // 5 of each item, random qls
            for (var x = 0; x <= 4; x++) {
                let _item = JSON.parse(JSON.stringify(this._items[i]));

                _item.def.level = this._lvlRange.min + Math.floor(Math.random()*(this._lvlRange.max - this._lvlRange.min)+1);
                this.__calculate_item_stats__(_item.def.requirements, _item.def.level);
                this.__calculate_item_stats__(_item.def.effects, _item.def.level);
                if (_item.damageMin) {
                    _item.damageMin *= _item.def.level;
                }
                if (_item.damageMax) {
                    _item.damageMax *= _item.def.level;
                    _item.def.description = `Damage: ${_item.damageMin} - ${_item.damageMax}`;
                }
                _item.def.price = 100;
                this._population.push(JSON.stringify(_item));
            }
        }
    }

    __calculate_item_stats__(_stat, _lvl) {
        Object.keys(_stat).forEach(_val => {
            _stat[_val] *= _lvl;
        });
    }

    get population() {
        return this._population;
    }

    get pos() {
        return this._pos;
    }
    
    get id() {
        return this._id;
    }
}

module.exports = ShopTerminal;