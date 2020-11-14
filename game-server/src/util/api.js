const RestClient = require('./rest.js');

class API {
    constructor() {
        this._rest = RestClient;
        this._apiUrl = 'https://15paucwkia.execute-api.us-east-1.amazonaws.com/dev/api/';
    }

    savePlayerSessionPos(_data) {
        this._rest.postDataWithCallbacks(`${this._apiUrl}updateSessionData`, _data);
    }

    updateInventoryItemSlot(_data, _onSuccess, _onFail) {
        this._rest.postDataWithCallbacks(`${this._apiUrl}updateInventory`, _data, _onSuccess, _onFail);
    }

    addInventoryItem(_data, _onSuccess, _onFail) {
        this._rest.postDataWithCallbacks(`${this._apiUrl}addInventory`, _data, _onSuccess, _onFail);
    }

    async getMobLoot(_data) {
        const _loot = await this._rest.get(`${this._apiUrl}getMobLoot?mobName=${_data.mobName}&lvl=${_data.lvl}`);
        if (_loot.statusCode != 200) {
            return [];
        }
        return JSON.parse(_loot.message);
    }

    async equip(_data) {
        const _res = await this._rest.postData(`${this._apiUrl}equip`, _data);
        return _res;
    }

    async unequip(_data) {
        const _res = await this._rest.postData(`${this._apiUrl}unequip`, _data);
        return _res;
    }

    async getShopItems(_itemType) {
        const _res = await this._rest.get(`${this._apiUrl}getItems?shopBuyable=true&itemType=${_itemType}`);
        return _res;
    }

    async shopTerminalTrade(_data) {
        const _res = await this._rest.postData(`${this._apiUrl}shopTerminalTrade`, _data);
        return _res;
    }

    async removeInventory(_data) {
        const _params = {
            ..._data.auth,
            table: 'inventorySlots',
            method: 'd',
            elementKey: _data.elementKey,
            element:{}
        }
        const _res = await this._rest.postData(`${this._apiUrl}modifyElement`, _params);
        return _res;
    }

    async updatePlayer(_data) {
        const _params = {
            ..._data.auth,
            table: 'players',
            method: 'u',
            ..._data
        }
        const _res = await this._rest.postData(`${this._apiUrl}modifyElement`, _params);
        return _res;
    }

    async getPlayerMissions(_data) {
        try {
            const _missions = await this._rest.get(`${this._apiUrl}getPlayerMissions?player=${_data.player}`);
            if (_missions.statusCode != 200) {
                return [];
            }
            return JSON.parse(_missions.message);
        } catch (_err) {
            console.log(_err);
            return [];
        }
    }
}

module.exports = new API();