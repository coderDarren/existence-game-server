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
        this._population = map(this._items, i => {return JSON.stringify(i);});
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