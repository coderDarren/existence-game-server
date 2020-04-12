const execSync = require('child_process').execSync;

const exec_sync = function(_cmd) {
    var _ret = "";
    try {
        _ret = execSync(_cmd, { encoding: 'utf-8' });
    } catch (_err) {
        console.log(`Failed to run ${_cmd}`);
        _ret = -1;
    }
    return _ret;
}

module.exports = {
    exec_sync
};