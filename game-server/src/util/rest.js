const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

class RestClient 
{
    async get(_url)
    {
        return new Promise((_resolve, _reject) => {
            var _xhr = new XMLHttpRequest();
            _xhr.open('GET', _url);
            _xhr.setRequestHeader('Content-Type', 'application/json');
            _xhr.onload = () => {
                if (_xhr.readyState == 4 && _xhr.status == 200)
                {
                    _resolve(JSON.parse(_xhr.responseText));
                }
                else if (_xhr.status > 300)
                {
                    _reject({
                        status: _xhr.status,
                        statusText: _xhr.statusText
                    });
                }
            }
            _xhr.onerror = () => {
                _reject({
                    status: _xhr.status,
                    statusText: _xhr.statusText
                });
            }
            _xhr.send();
        });
    }

    async postForm(_url, _data)
    {
        return new Promise((_resolve, _reject) => {
            var _xhr = new XMLHttpRequest();
            _xhr.open('POST', _url);
            _xhr.onload = () => {
                if (_xhr.readyState == 4 && _xhr.status == 200)
                {
                    _resolve(_xhr.responseText);
                }
                else if (_xhr.status > 300)
                {
                    _reject({
                        status: _xhr.status,
                        statusText: _xhr.statusText
                    });
                }
            }
            _xhr.onerror = () => {
                _reject({
                    status: _xhr.status,
                    statusText: _xhr.statusText
                });
            }
            _xhr.send(_data);
        });
    }

    async postData(_url, _data)
    {
        return new Promise((_resolve, _reject) => {
            var _xhr = new XMLHttpRequest();
            _xhr.open('POST', _url);
            _xhr.setRequestHeader('Content-Type', 'application/json');
            _xhr.onload = () => {
                var _res = JSON.parse(_xhr.responseText);
                if (_xhr.readyState == 4 && _xhr.status == 200)
                {
                    _resolve(_res);
                }
                else if (_xhr.status > 300)
                {
                    _reject(_res);
                }
            }
            _xhr.onerror = () => {
                _reject({
                    status: _xhr.status,
                    statusText: _xhr.statusText
                });
            }
            const _send = JSON.stringify(_data);
            //console.log(_send);
            _xhr.send(_send);
        });
    }

    postDataWithCallbacks(_url, _data, _onSuccess=null, _onFailure=null)
    {
        var _xhr = new XMLHttpRequest();
        _xhr.open('POST', _url);
        _xhr.setRequestHeader('Content-Type', 'application/json');
        _xhr.onload = () => {
            var _res = JSON.parse(_xhr.responseText);
            if (_xhr.readyState == 4 && _xhr.status == 200)
            {
                if (_onSuccess) _onSuccess(_res);
            }
            else if (_xhr.status > 300)
            {
                if (_onFailure) _onFailure(_res);
            }
        }
        _xhr.onerror = () => {
            if (_onFailure) _onFailure(_xhr.statusText);
        }
        const _send = JSON.stringify(_data);
        //console.log(_send);
        _xhr.send(_send);
    }
}

module.exports = new RestClient();