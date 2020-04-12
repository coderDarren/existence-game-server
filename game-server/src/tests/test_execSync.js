const {exec_sync} = require('../util/terminal.js');

const _result = exec_sync('ls');
console.log(`exec_sync result: ${_result}`);
