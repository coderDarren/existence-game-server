'use strict';

class Mission
{
    /*
     * Missions are instantiated for players when they log in, or when they start a new mission while playing.
     *
     * When organizing mission data, we consider missions as a collection of nodes.
     * Each node holds information about the next objective, as well as potential reward modifiers at the end.
     */
    constructor(_data) {
        /*
         * Save the mission type.
         * Mission types are used to determine operations against the current objective
         */
        this._type = _data.type;

    }

    /*
     * This should be called when the player completes the current objective
     */
    loadNextNodes() {

    }
}

module.exports = Mission;