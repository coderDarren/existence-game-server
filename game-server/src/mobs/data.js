'use strict';
/*
 * This file contains data for all mobs
 * Each mob can be initialized using the _level paramter..
 * ..to help scale skills/attributes of the mob
 */

const dummy = function(_level) {
    return {
        name: 'Dummy',
        level: _level,
        hp: 100*_level,
        energy: 100*_level,
        attackSpeed: 1.5,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

module.exports = {
    dummy
}