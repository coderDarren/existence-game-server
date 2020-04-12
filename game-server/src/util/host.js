const {exec_sync} = require('./terminal');
const HOST_NAME_LOC = '/home/ubuntu/hostname.txt';

const savePublicHostName = function() {
    //exec_sync(`rm ${HOST_NAME_LOC}`);
    //exec_sync(`echo $(ec2metadata --public-hostname) >> ${HOST_NAME_LOC}`);
}

const getPublicHostName = function() {
    //var _result = exec_sync('ec2metadata --public-hostname');
    //_result = _result.replace(/\n/g, '');
    return "localhost";
}

const getOldHostName = function() {
    return "localhost"
    var _result = exec_sync(`cat ${HOST_NAME_LOC}`);
    if (_result == -1) {
        savePublicHostName();
        return exec_sync(`cat ${HOST_NAME_LOC}`);
    }
    _result = _result.replace(/\n/g, '');
    return _result;
}

module.exports = {
    getPublicHostName,
    getOldHostName,
    savePublicHostName
}