const {
    getOldHostName,
    getPublicHostName,
    savePublicHostName
} = require('./host.js');
const Rest = require('./rest.js');

const GAME_ID = 'gameID';
const CAPACITY = 100;
const TABLE_LIMIT = 4;

class Builder
{
    constructor()
    {
        this._tableNames = [];

        this.__delete_metadata__ = this.__delete_metadata__.bind(this);
        //this.__create_metadata__ = this.__create_metadata__.bind(this);
        this.__get_table_names__ = this.__get_table_names__.bind(this);
    }

    __get_table_names__()
    {
        return ['table1']
        var _ret = [];
        const _tableCount = Math.floor(CAPACITY / TABLE_LIMIT);
        for (var i = 0; i < _tableCount; i++) {
            _ret.push(`${this._hostName}_${i}`);
        }
        return _ret;
    }

    async __delete_metadata__() 
    {
        /*if (this._oldHostName == -1) return 0;
        console.log(`deleting ${this._oldHostName}`);

        try {
            const _url = MM_ENDPOINT+SERVICE_SERVER_DEL;
            return await Rest.postData(_url, {
                'instanceId': this._oldHostName
            });
        } catch (_err) {
            console.log(_err);
            return -1;
        }*/
    }

    async __create_metadata__()
    {
        /*if (this._hostName == -1) return 0;
        console.log(`creating ${this._hostName}`);

        try {
            const _url = MM_ENDPOINT+SERVICE_SERVER_INIT;
            return await Rest.postData(_url, {
                'instanceId': this._hostName,
                'gameId': GAME_ID,
                'capacity': CAPACITY,
                'tableLimit': TABLE_LIMIT
            });
        } catch (_err) {
            console.log(_err);
            return -1;
        }*/
    }

    async initializeServer()
    {
        this._oldHostName = getOldHostName();
        this._hostName = getPublicHostName(); 

        /* If old host used to live here, and is different from the active host */
        if (this._oldHostName != this._hostName) {
            //var _res = await this.__delete_metadata__();
            //_res = await this.__create_metadata__()

            console.log(_res);
            if (_res != -1 && _res.statusCode == 200) {
                savePublicHostName();
            }
        }
        
        this._tableNames = this.__get_table_names__();
    }

    get tableNames() { return this._tableNames; }
}

module.exports = new Builder();