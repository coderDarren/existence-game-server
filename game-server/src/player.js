
class Player
{
    constructor(_socket, _username)
    {
        this._table = null;
        this._socket = _socket;
        this._username = _username;

        this.__disconnect__ = this.__disconnect__.bind(this);
        this.__message__ = this.__message__.bind(this);

        this._socket.on('disconnect', this.__disconnect__);
        this._socket.on('message', this.__message__);
    }

    __disconnect__()
    {
        this._table.disconnect(this);
    }

    __message__(_data)
    {
        this._table.message(this, _data);
    }
    
    set table(_val) { this._table = _val; }
    get socket() { return this._socket; }
    get username() { return this._username; }
}

module.exports = Player;