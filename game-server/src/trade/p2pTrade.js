const { filter } = require("lodash");

const NETMSG_START_P2P_TRADE = 'START_P2P_TRADE';
const NETMSG_REJECT_P2P_TRADE = 'REJECT_P2P_TRADE';
const NETMSG_P2P_TRADE_ADD_ITEM = 'P2P_TRADE_ADD_ITEM';
const NETMSG_P2P_TRADE_RM_ITEM = 'P2P_TRADE_RM_ITEM';
const NETMSG_P2P_TRADE_CHNG_TIX = "NETMSG_P2P_TRADE_CHNG_TIX";
const NETMSG_ACCEPT_P2P_TRADE = 'ACCEPT_P2P_TRADE';
const NETMSG_CANCEL_P2P_TRADE = 'CANCEL_P2P_TRADE';

const P2PTradeState = {
    PENDING:0,
    ACCEPT:1,
    CANCEL:2
}

class P2PTradeSocket {
    constructor(_p) {
        this._player = _p;
        this._state = P2PTradeState.PENDING;
        this._items = [];
        this._tix = 0;
    }

    accept() {
        if (this._state != P2PTradeState.PENDING) return;
        this._state = P2PTradeState.ACCEPT;
    }

    decline() {
        if (this._state != P2PTradeState.PENDING) return;
        this._state = P2PTradeState.DECLINE;
    }

    addItem(_i) {
        this._player.rmInventory(_i);
        this._items.push(_i);
    }

    rmItem(_i) {
        this._player.addInventory(_i);
        this._items = filter(this._items, _item => {
            return _item.def.id != _i.def.id && _item.def.slotLoc != _i.def.slotLoc
        });
    }

    /*
     * Give items to player '_p'
     */
    giveItems(_p) {
        for (var i in this._items) {
            _p.addInventory(this._items[i]);
        }
        this._items = [];
    }

    /*
     * Return items in trade to this player
     */
    takeItemsBack() {
        for (var i in this._items) {
            this._player.addInventory(this._items[i]);
        }
        this._items = [];
    }

    /*
     * Give tix to player '_p'
     */
    giveTix(_p) {
        _p.addTix(this._tix);
        this._player.addTix(-this._tix);
        this._tix = 0;
    }

    get state() { return this._state; }
    get socket() { return this._player.socket; }
    get data() { return this._player.data; }
    get player() { return this._player; }
    get items() { return this._items; }
    get itemsJson() {
        var _ret = [];
        for (var i in this._items) {
            _ret.push(JSON.stringify(this._items[i]));
        }
        return _ret;
    }
    get tix() { return this._tix; }
    set tix(_val) { this._tix = _val; }
}

/*
 * Faciliate trade between two players
 */
class P2PTrade {
    /*
     * Create a new P2PTrade object between two player sockets; '_p1' and '_p2'
     */
    constructor(_p1, _p2) {
        this._p1 = new P2PTradeSocket(_p1);
        this._p2 = new P2PTradeSocket(_p2);

        this.__netEvt__ = this.__netEvt__.bind(this);
        this.__hook__ = this.__hook__.bind(this);
        this.__on_trade_add_item__ = this.__on_trade_add_item__.bind(this);
        this.__on_trade_rm_item__ = this.__on_trade_rm_item__.bind(this);
        this.__on_trade_change_tix__ = this.__on_trade_change_tix__.bind(this);
        this.__on_trade_accept__ = this.__on_trade_accept__.bind(this);
        this.__on_trade_decline__ = this.__on_trade_decline__.bind(this);
        this.__dispose__ = this.__dispose__.bind(this);

        this.__hook__(this._p1, this._p2);
        this.__hook__(this._p2, this._p1);
    }

    /*
     * Helps save a little space, while standardizing, when emitting events
     */
    __netEvt__(_evt) {
        return {
            message: JSON.stringify(_evt)
        };
    }

    /*
     * Create hooks for player '_p' trading with the other player '_o'
     */
    __hook__(_p, _o) {
        console.log(`Hooking ${_p.data.name} to trade events with ${_o.data.name}`);

        // Request replies
        _p.socket.on(NETMSG_START_P2P_TRADE, _data => {this.__on_trade_start__(_p, _o, _data)});
        _p.socket.on(NETMSG_REJECT_P2P_TRADE, _data => {this.__on_trade_reject__(_p, _o, _data)});

        // Add & rm items from trade
        _p.socket.on(NETMSG_P2P_TRADE_ADD_ITEM, _data => {this.__on_trade_add_item__(_p, _o, _data)});
        _p.socket.on(NETMSG_P2P_TRADE_RM_ITEM, _data => {this.__on_trade_rm_item__(_p, _o, _data)});
        _p.socket.on(NETMSG_P2P_TRADE_CHNG_TIX, _data => {this.__on_trade_change_tix__(_p, _o, _data)});

        // Finalize trade
        _p.socket.on(NETMSG_ACCEPT_P2P_TRADE, _data => {this.__on_trade_accept__(_p, _o, _data)});
        _p.socket.on(NETMSG_CANCEL_P2P_TRADE, _data => {this.__on_trade_decline__(_p, _o, _data)});
    }
    
    __on_trade_add_item__(_p, _o, _data) {
        console.log(`${_p.data.name} added trade item.`);
        _p.addItem(JSON.parse(_data.itemJson));
        _p.socket.emit(NETMSG_P2P_TRADE_ADD_ITEM, this.__netEvt__({playerName: _data.playerName, itemJson: _data.itemJson}));
        _o.socket.emit(NETMSG_P2P_TRADE_ADD_ITEM, this.__netEvt__({playerName: _data.playerName, itemJson: _data.itemJson}));
    }

    __on_trade_rm_item__(_p, _o, _data) {
        console.log(`${_p.data.name} removed trade item.`);
        _p.rmItem(JSON.parse(_data.itemJson));
        _p.socket.emit(NETMSG_P2P_TRADE_RM_ITEM, this.__netEvt__({playerName: _data.playerName, itemJson: _data.itemJson}));
        _o.socket.emit(NETMSG_P2P_TRADE_RM_ITEM, this.__netEvt__({playerName: _data.playerName, itemJson: _data.itemJson}));
    }

    __on_trade_change_tix__(_p, _o, _data) {
        console.log(`${_p.data.name} has ${_p.data.tix} tix to trade with.`);
        console.log(`${_p.data.name} is trading ${_data.tix} tix to ${_o.data.name}`);
        var _tix = parseInt(_data.tix);
        if (_tix == NaN) return;
        _p.tix = _tix < 0 ? 0 : _tix > _p.data.tix ? _p.data.tix : _tix;
        _p.socket.emit(NETMSG_P2P_TRADE_CHNG_TIX, this.__netEvt__({playerName: _data.playerName, tix: _p.tix}));
        _o.socket.emit(NETMSG_P2P_TRADE_CHNG_TIX, this.__netEvt__({playerName: _data.playerName, tix: _p.tix}));
    }

    __on_trade_start__(_p, _o, _data) {
        console.log(`${_p.data.name} started trade with ${_o.data.name}.`);
        _p.socket.emit(NETMSG_START_P2P_TRADE, {message: _o.data.name});
        _o.socket.emit(NETMSG_START_P2P_TRADE, {message: _p.data.name});
    }

    __on_trade_reject__(_p, _o, _data) {
        console.log(`${_p.data.name} rejected trade request with ${_o.data.name}.`);
        _o.socket.emit(NETMSG_REJECT_P2P_TRADE, this.__netEvt__({}));
        this.__dispose__(_p);
        this.__dispose__(_o);
    }

    __on_trade_accept__(_p, _o, _data) {
        _p.accept();
        const _allAccept = _p.state == P2PTradeState.ACCEPT && _o.state == P2PTradeState.ACCEPT;
        console.log(`${_p.data.name} accepted the trade with ${_o.data.name}${`: Player Items: ${_p.itemsJson} | Other Player Items: ${_o.itemsJson}`}`);
        var _playersAccepted = _p.data.name;
        if (_o.state == P2PTradeState.ACCEPT) {
            _playersAccepted += `,${_o.data.name}`;
        }

        if (_allAccept) {
            // distribute trade items
            _p.giveItems(_o.player);
            _o.giveItems(_p.player);

            if (_p.tix > _o.tix) {
                _o.tix = 0;
                _p.tix -= _o.tix;
            } else if (_o.tix > _p.tix) {
                _o.tix -= _p.tix;
                _p.tix = 0;
            } else if (_o.tix == _p.tix) {
                _o.tix = 0;
                _p.tix = 0;
            }
            _p.giveTix(_o.player);
            _o.giveTix(_p.player);
        }

        _p.socket.emit(NETMSG_ACCEPT_P2P_TRADE, this.__netEvt__({playersAccepted: _playersAccepted}));
        _o.socket.emit(NETMSG_ACCEPT_P2P_TRADE, this.__netEvt__({playersAccepted: _playersAccepted}));

        if (_allAccept) {
            this.__dispose__();
        }
    }

    __on_trade_decline__(_p, _o, _data) {
        console.log(`${_p.data.name} cancels trade with ${_o.data.name}.`);
        _p.decline();

        // return trade items
        _p.takeItemsBack();
        _o.takeItemsBack();

        _p.socket.emit(NETMSG_CANCEL_P2P_TRADE, this.__netEvt__({}));
        _o.socket.emit(NETMSG_CANCEL_P2P_TRADE, this.__netEvt__({}));
        this.__dispose__();
    }

    __dispose__() {
        console.log(`Disposing trade events`);

        this._p1.socket.removeAllListeners(NETMSG_START_P2P_TRADE);
        this._p1.socket.removeAllListeners(NETMSG_REJECT_P2P_TRADE);
        this._p1.socket.removeAllListeners(NETMSG_P2P_TRADE_ADD_ITEM);
        this._p1.socket.removeAllListeners(NETMSG_P2P_TRADE_RM_ITEM);
        this._p1.socket.removeAllListeners(NETMSG_P2P_TRADE_CHNG_TIX);
        this._p1.socket.removeAllListeners(NETMSG_ACCEPT_P2P_TRADE);
        this._p1.socket.removeAllListeners(NETMSG_CANCEL_P2P_TRADE);

        this._p2.socket.removeAllListeners(NETMSG_START_P2P_TRADE);
        this._p2.socket.removeAllListeners(NETMSG_REJECT_P2P_TRADE);
        this._p2.socket.removeAllListeners(NETMSG_P2P_TRADE_ADD_ITEM);
        this._p2.socket.removeAllListeners(NETMSG_P2P_TRADE_RM_ITEM);
        this._p2.socket.removeAllListeners(NETMSG_P2P_TRADE_CHNG_TIX);
        this._p2.socket.removeAllListeners(NETMSG_ACCEPT_P2P_TRADE);
        this._p2.socket.removeAllListeners(NETMSG_CANCEL_P2P_TRADE);
    }
}

module.exports = P2PTrade;