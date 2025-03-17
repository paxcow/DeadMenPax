var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// @ts-ignore
GameGui = /** @class */ (function () {
    function GameGui() { }
    return GameGui;
})();
/** Class that extends default bga core game class with more functionality
 */
var GameBasics = /** @class */ (function (_super) {
    __extends(GameBasics, _super);
    function GameBasics() {
        var _this = _super.call(this) || this;
        console.log("game constructor");
        _this.curstate = null;
        _this.pendingUpdate = false;
        _this.currentPlayerWasActive = false;
        return _this;
    }
    // state hooks
    GameBasics.prototype.setup = function (gamedatas) {
        console.log("Starting game setup", gameui);
        this.gamedatas = gamedatas;
    };
    GameBasics.prototype.onEnteringState = function (stateName, args) {
        console.log("onEnteringState: " + stateName, args, this.debugStateInfo());
        this.curstate = stateName;
        // Call appropriate method
        args = args ? args.args : null; // this method has extra wrapper for args for some reason
        var methodName = "onEnteringState_" + stateName;
        this.callfn(methodName, args);
        if (this.pendingUpdate) {
            this.onUpdateActionButtons(stateName, args);
            this.pendingUpdate = false;
        }
    };
    GameBasics.prototype.onLeavingState = function (stateName) {
        console.log("onLeavingState: " + stateName, this.debugStateInfo());
        this.currentPlayerWasActive = false;
    };
    GameBasics.prototype.onUpdateActionButtons = function (stateName, args) {
        if (this.curstate != stateName) {
            // delay firing this until onEnteringState is called so they always called in same order
            this.pendingUpdate = true;
            //console.log('   DELAYED onUpdateActionButtons');
            return;
        }
        this.pendingUpdate = false;
        if (gameui.isCurrentPlayerActive() && this.currentPlayerWasActive == false) {
            console.log("onUpdateActionButtons: " + stateName, args, this.debugStateInfo());
            this.currentPlayerWasActive = true;
            // Call appropriate method
            this.callfn("onUpdateActionButtons_" + stateName, args);
        }
        else {
            this.currentPlayerWasActive = false;
        }
    };
    // utils
    GameBasics.prototype.debugStateInfo = function () {
        var iscurac = gameui.isCurrentPlayerActive();
        var replayMode = false;
        if (typeof g_replayFrom != "undefined") {
            replayMode = true;
        }
        var instantaneousMode = gameui.instantaneousMode ? true : false;
        var res = {
            isCurrentPlayerActive: iscurac,
            instantaneousMode: instantaneousMode,
            replayMode: replayMode,
        };
        return res;
    };
    GameBasics.prototype.ajaxcallwrapper = function (action, args, handler) {
        if (!args) {
            args = {};
        }
        args.lock = true;
        if (gameui.checkAction(action)) {
            gameui.ajaxcall("/" + gameui.game_name + "/" + gameui.game_name + "/" + action + ".html", args, //
            gameui, function (result) { }, handler);
        }
    };
    GameBasics.prototype.createHtml = function (divstr, location) {
        var tempHolder = document.createElement("div");
        tempHolder.innerHTML = divstr;
        var div = tempHolder.firstElementChild;
        var parentNode = document.getElementById(location);
        if (parentNode)
            parentNode.appendChild(div);
        return div;
    };
    GameBasics.prototype.createDiv = function (id, classes, location) {
        var _a;
        var div = document.createElement("div");
        if (id)
            div.id = id;
        if (classes)
            (_a = div.classList).add.apply(_a, classes.split(" "));
        var parentNode = document.getElementById(location);
        if (parentNode)
            parentNode.appendChild(div);
        return div;
    };
    /**
     *
     * @param {string} methodName
     * @param {object} args
     * @returns
     */
    GameBasics.prototype.callfn = function (methodName, args) {
        if (this[methodName] !== undefined) {
            console.log("Calling " + methodName, args);
            return this[methodName](args);
        }
        return undefined;
    };
    /** @Override onScriptError from gameui */
    GameBasics.prototype.onScriptError = function (msg, url, linenumber) {
        if (gameui.page_is_unloading) {
            // Don't report errors during page unloading
            return;
        }
        // In anycase, report these errors in the console
        console.error(msg);
        // cannot call super - dojo still have to used here
        //super.onScriptError(msg, url, linenumber);
        return this.inherited(arguments);
    };
    return GameBasics;
}(GameGui));
/**
 * Custom module
 */
var CustomModule = /** @class */ (function () {
    function CustomModule() {
    }
    CustomModule.prototype.setup = function (gamedatas) {
        this.gamedatas = gamedatas;
        console.log("hello from setup of MyFoo");
    };
    return CustomModule;
}());
;
/** Game class */
var DeadMenPax = /** @class */ (function (_super) {
    __extends(DeadMenPax, _super);
    function DeadMenPax() {
        var _this = _super.call(this) || this;
        _this.varfoo = new CustomModule(); // this example of class from custom module
        return _this;
    }
    DeadMenPax.prototype.setup = function (gamedatas) {
        _super.prototype.setup.call(this, gamedatas);
        //super.setup(gamedatas);
        this.ship = new Ship(this);
        this.createDiv(undefined, "whiteblock cow", "thething").innerHTML = _("Should we eat the cow?");
        this.varfoo.setup(gamedatas);
        this.setupNotifications();
        console.log("Ending game setup");
    };
    // on click hooks
    DeadMenPax.prototype.onButtonClick = function (event) {
        console.log("onButtonClick", event);
    };
    DeadMenPax.prototype.onUpdateActionButtons_playerTurnA = function (args) {
        var _this = this;
        this.addActionButton("b1", _("Play Card"), function () { return _this.ajaxcallwrapper("playCard"); });
        this.addActionButton("b2", _("Vote"), function () { return _this.ajaxcallwrapper("playVote"); });
        this.addActionButton("b3", _("Pass"), function () { return _this.ajaxcallwrapper("pass"); });
    };
    DeadMenPax.prototype.onUpdateActionButtons_playerTurnB = function (args) {
        var _this = this;
        this.addActionButton("b1", _("Support"), function () { return _this.ajaxcallwrapper("playSupport"); });
        this.addActionButton("b2", _("Oppose"), function () { return _this.ajaxcallwrapper("playOppose"); });
        this.addActionButton("b3", _("Wait"), function () { return _this.ajaxcallwrapper("playWait"); });
    };
    DeadMenPax.prototype.setupNotifications = function () {
        for (var m in this) {
            if (typeof this[m] == "function" && m.startsWith("notif_")) {
                dojo.subscribe(m.substring(6), this, m);
            }
        }
    };
    DeadMenPax.prototype.notif_message = function (notif) {
        console.log("notif", notif);
    };
    return DeadMenPax;
}(GameBasics));
define([
    "dojo",
    "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "./modules/js/scrollmapWithZoom",
    "./modules/js/bga-cards"
], function (dojo, declare) {
    declare("bgagame.deadmenpax", ebg.core.gamegui, new DeadMenPax());
});
var PlayerBoard = /** @class */ (function () {
    function PlayerBoard(game) {
        this.game = game;
    }
    PlayerBoard.prototype.init = function (targetDiv, player) {
        //create the board
        var board = document.createElement("div");
        board.id = "board_" + player.id;
        board.classList.add("player_board");
        targetDiv.insertAdjacentElement("beforeend", board);
        //create the fatigue dial
        var dial = document.createElement("div");
        dial.id = "fatigue_" + player.id;
        dial.classList.add("fatigue_dial");
        board.appendChild(dial);
        //create the battle marker posisitons
        for (var i = 1; i <= 5; i++) {
            var battlestrenght = document.createElement("div");
            battlestrenght.id = "battle_" + i + "_" + player.id;
            battlestrenght.classList.add("battle_" + i);
            board.appendChild(battlestrenght);
        }
    };
    return PlayerBoard;
}());
var Room = /** @class */ (function () {
    function Room(card) {
        Object.assign(this, card);
        this.element = document.createElement("div");
        this.element.id = String(this.id);
        this.updateStyle();
    }
    Room.prototype.rotate = function (direction) {
        var orientations = [0, 90, 180, 270];
        var currentIndex = orientations.indexOf(this.orientation);
        var newIndex;
        if (direction === "right") {
            newIndex = (currentIndex + 1) % orientations.length;
        }
        else {
            newIndex = (currentIndex - 1 + orientations.length) % orientations.length;
        }
        this.orientation = orientations[newIndex];
        this.updateStyle();
    };
    Room.prototype.updateStyle = function () {
        this.element.style.setProperty("--orientation", String(this.orientation));
        this.element.style.setProperty("--fire", String(this.fire_level));
    };
    return Room;
}());
var Ship = /** @class */ (function () {
    function Ship(game) {
        this.game = game;
        // Keep a Map of all cells (empty or filled)
        this.cells = new Map();
        // Track the bounding box of all cells (empty or filled)
        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
        this.maxY = 0;
        //state
        this.positioning = false;
    }
    Ship.prototype.init = function () {
        //add the wrapper for the scrollmap
        var targetDiv = document.querySelector("#game_play_area");
        var seaDiv = document.createElement("div");
        var id = "sea_wrapper";
        seaDiv.id = id;
        targetDiv.insertBefore(seaDiv, targetDiv.firstChild);
        //setup the scrollmap
        this.setupScrollMap("sea_wrapper");
        //prepare the grid in the oversurface
        var oversurface = document.querySelector(".scrollmap_onsurface");
        this.initGrid(oversurface);
    };
    Ship.prototype.setupScrollMap = function (seaWrapper) {
        this.scrollMap = new ebg.scrollmapWithZoom();
        this.scrollMap.zoom = 0.8;
        //create main scrollmap
        this.scrollMap.createCompletely($(seaWrapper));
    };
    Ship.prototype.initGrid = function (oversurface) {
        var container = document.createElement("div");
        container.id = "grid_container";
        // Just some base styling for visualization.
        container.style.position = "relative";
        container.style.display = "grid";
        container.style.border = "1px solid #333";
        //add the grid container
        this.gridContainer = container;
        oversurface.appendChild(container);
        //add the first empty element at 0,0
        this.createCell(0, 0);
        this.updateGrid();
    };
    Ship.prototype.fillCell = function (x, y, child) {
        if (y < 0) {
            console.warn("Cannot fill a cell with negative Y: (x=".concat(x, ", y=").concat(y, ")"));
            return;
        }
        var key = this.cellKey(x, y);
        var cell = this.cells.get(key);
        if (!cell) {
            console.warn("Cannot fill (x=".concat(x, ", y=").concat(y, ") because it doesn't exist. \n                     You can only fill cells that were previously empty."));
            return;
        }
        if (cell.state === "filled") {
            console.warn("Cell (x=".concat(x, ", y=").concat(y, ") is already filled."));
            return;
        }
        // Fill the cell
        cell.state = "filled";
        cell.element.innerHTML = "";
        if (child) {
            cell.element.appendChild(child);
        }
        else {
            cell.element.textContent = "(".concat(x, ", ").concat(y, ")");
        }
        // Update grid => ensures the newly filled cell has empty neighbors
        this.updateGrid();
    };
    /**
     * Internal helper to generate a stable string key for each (x, y).
     */
    Ship.prototype.cellKey = function (x, y) {
        return "".concat(x, ":").concat(y);
    };
    /**
     * Create the underlying DOM <div> for a cell.
     */
    Ship.prototype.createCell = function (x, y, state) {
        if (state === void 0) { state = "empty"; }
        var key = this.cellKey(x, y);
        var div = document.createElement("div");
        div.id = "cell_".concat(key);
        div.style.border = "1px solid black";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        // Minimal placeholders:
        div.dataset.x = x.toString();
        div.dataset.y = y.toString();
        var cell = { x: x, y: y, state: state, element: div };
        this.cells.set(key, cell);
        // Append to container so it physically exists
        this.gridContainer.appendChild(div);
        return cell;
    };
    Ship.prototype.updateGrid = function () {
        var _this = this;
        // For each filled cell, ensure neighbors exist (unless y=0 blocks below).
        this.cells.forEach(function (cell) {
            if (cell.state === "filled") {
                _this.growFromCell(cell.x, cell.y);
            }
        });
        //    Recompute bounding box from all existing cells
        //    (We do this in one pass so we only expand as needed.)
        this.recomputeBoundingBox();
        // Set up the CSS grid to cover minX..maxX, minY..maxY
        //    The # of columns/rows is (max-min+1).
        var totalCols = this.maxX - this.minX + 1;
        var totalRows = this.maxY - this.minY + 1;
        this.gridContainer.style.gridTemplateColumns = "repeat(".concat(totalCols, ", 50px)");
        this.gridContainer.style.gridTemplateRows = "repeat(".concat(totalRows, ", 50px)");
        // Position each cell
        this.cells.forEach(function (cell) {
            var colPos = cell.x - _this.minX + 1; // 1-based from the left
            // Invert Y: row 1 is maxY, row totalRows is minY
            var rowPos = _this.maxY - cell.y + 1;
            cell.element.style.gridColumn = String(colPos);
            cell.element.style.gridRow = String(rowPos);
        });
    };
    Ship.prototype.growFromCell = function (x, y) {
        // Left neighbor => (x-1, y) if not present
        this.growInDirection(x - 1, y);
        // Right neighbor => (x+1, y)
        this.growInDirection(x + 1, y);
        // Above => (x, y+1)
        this.growInDirection(x, y + 1);
        // Below => (x, y-1), but only if y-1 >= 0
        if (y - 1 >= 0) {
            this.growInDirection(x, y - 1);
        }
    };
    Ship.prototype.growInDirection = function (x, y) {
        if (y < 0)
            return; // skip any row below y=0
        var key = this.cellKey(x, y);
        if (!this.cells.has(key)) {
            this.createCell(x, y);
        }
    };
    Ship.prototype.recomputeBoundingBox = function () {
        var minX = Infinity;
        var maxX = -Infinity;
        var minY = Infinity;
        var maxY = -Infinity;
        this.cells.forEach(function (cell) {
            if (cell.x < minX)
                minX = cell.x;
            if (cell.x > maxX)
                maxX = cell.x;
            if (cell.y < minY)
                minY = cell.y;
            if (cell.y > maxY)
                maxY = cell.y;
        });
        // If we somehow have no cells, leave bounding box alone
        if (this.cells.size === 0) {
            return;
        }
        this.minX = minX;
        this.maxX = maxX;
        this.minY = Math.max(minY, 0); // clamp to 0
        this.maxY = maxY;
    };
    Ship.prototype.toggleHighlight = function (positions, state) {
        if (state === void 0) { state = null; }
        // Ensure positions is always an array
        var positionsArray = Array.isArray(positions) ? positions : [positions];
        for (var _i = 0, positionsArray_1 = positionsArray; _i < positionsArray_1.length; _i++) {
            var pos = positionsArray_1[_i];
            // Create the key to check in the Map
            var key = this.cellKey(pos.x, pos.y);
            if (this.cells.has(key)) {
                var cell = this.cells.get(key);
                if (state === true) {
                    cell.element.classList.add("highlighted");
                }
                else if (state === false) {
                    cell.element.classList.remove("highlighted");
                }
                else {
                    // Toggle class if state is null
                    cell.element.classList.toggle("highlighted");
                }
            }
        }
    };
    Ship.prototype.clearHighlight = function () {
        var _this = this;
        this.cells.forEach(function (value, key) {
            var cell = _this.cells.get(key);
            cell.element.classList.remove("highlighted");
        });
    };
    return Ship;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVhZG1lbnBheC5qcyIsInNvdXJjZVJvb3QiOiIuL3NyYy8iLCJzb3VyY2VzIjpbIkdhbWVCYXNpY3MudHMiLCJDdXN0b21Nb2R1bGUudHMiLCJkZWFkbWVucGF4LnRzIiwienpNYWluLnRzIiwidWkvcGxheWVyYm9hcmQudHMiLCJ1aS9yb29tc01hbmFnZXIudHMiLCJ1aS9zaGlwTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxhQUFhO0FBQ2IsT0FBTyxHQUFHLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZCLFNBQVMsT0FBTyxLQUFJLENBQUM7SUFDckIsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUdMO0dBQ0c7QUFFSDtJQUF5Qiw4QkFBTztJQUk5QjtRQUNFLFlBQUEsTUFBSyxXQUFFLFNBQUM7UUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFaEMsS0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsS0FBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDM0IsS0FBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQzs7SUFDdEMsQ0FBQztJQUVELGNBQWM7SUFDZCwwQkFBSyxHQUFMLFVBQU0sU0FBUztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQUVELG9DQUFlLEdBQWYsVUFBZ0IsU0FBUyxFQUFFLElBQUk7UUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1FBQzFCLDBCQUEwQjtRQUMxQixJQUFJLEdBQUcsSUFBSSxDQUFD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QUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzVDLENBQUM7cUJBQU0sSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDL0MsQ0FBQztxQkFBTSxDQUFDO29CQUNOLGdDQUFnQztvQkFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRU0sNkJBQWMsR0FBckI7UUFBQSxpQkFLQztRQUpDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLEdBQUc7WUFDNUIsSUFBSSxJQUFJLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVILFdBQUM7QUFBRCxDQUFDLEFBalBELElBaVBDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxuR2FtZUd1aSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gR2FtZUd1aSgpIHt9XG4gIHJldHVybiBHYW1lR3VpO1xufSkoKTtcblxuXG4vKiogQ2xhc3MgdGhhdCBleHRlbmRzIGRlZmF1bHQgYmdhIGNvcmUgZ2FtZSBjbGFzcyB3aXRoIG1vcmUgZnVuY3Rpb25hbGl0eVxuICovXG5cbmNsYXNzIEdhbWVCYXNpY3MgZXh0ZW5kcyBHYW1lR3VpIHtcbiAgY3Vyc3RhdGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgcGVuZGluZ1VwZGF0ZTogYm9vbGVhbjtcbiAgY3VycmVudFBsYXllcldhc0FjdGl2ZTogYm9vbGVhbjtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICBjb25zb2xlLmxvZyhcImdhbWUgY29uc3RydWN0b3JcIik7XG5cbiAgICB0aGlzLmN1cnN0YXRlID0gbnVsbDtcbiAgICB0aGlzLnBlbmRpbmdVcGRhdGUgPSBmYWxzZTtcbiAgICB0aGlzLmN1cnJlbnRQbGF5ZXJXYXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIHN0YXRlIGhvb2tzXG4gIHNldHVwKGdhbWVkYXRhcykge1xuICAgIGNvbnNvbGUubG9nKFwiU3RhcnRpbmcgZ2FtZSBzZXR1cFwiLCBnYW1ldWkpO1xuICAgIHRoaXMuZ2FtZWRhdGFzID0gZ2FtZWRhdGFzO1xuICB9XG5cbiAgb25FbnRlcmluZ1N0YXRlKHN0YXRlTmFtZSwgYXJncykge1xuICAgIGNvbnNvbGUubG9nKFwib25FbnRlcmluZ1N0YXRlOiBcIiArIHN0YXRlTmFtZSwgYXJncywgdGhpcy5kZWJ1Z1N0YXRlSW5mbygpKTtcbiAgICB0aGlzLmN1cnN0YXRlID0gc3RhdGVOYW1lO1xuICAgIC8vIENhbGwgYXBwcm9wcmlhdGUgbWV0aG9kXG4gICAgYXJncyA9IGFyZ3MgPyBhcmdzLmFyZ3MgOiBudWxsOyAvLyB0aGlzIG1ldGhvZCBoYXMgZXh0cmEgd3JhcHBlciBmb3IgYXJncyBmb3Igc29tZSByZWFzb25cbiAgICB2YXIgbWV0aG9kTmFtZSA9IFwib25FbnRlcmluZ1N0YXRlX1wiICsgc3RhdGVOYW1lO1xuICAgIHRoaXMuY2FsbGZuKG1ldGhvZE5hbWUsIGFyZ3MpO1xuXG4gICAgaWYgKHRoaXMucGVuZGluZ1VwZGF0ZSkge1xuICAgICAgdGhpcy5vblVwZGF0ZUFjdGlvbkJ1dHRvbnMoc3RhdGVOYW1lLCBhcmdzKTtcbiAgICAgIHRoaXMucGVuZGluZ1VwZGF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIG9uTGVhdmluZ1N0YXRlKHN0YXRlTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwib25MZWF2aW5nU3RhdGU6IFwiICsgc3RhdGVOYW1lLCB0aGlzLmRlYnVnU3RhdGVJbmZvKCkpO1xuICAgIHRoaXMuY3VycmVudFBsYXllcldhc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgb25VcGRhdGVBY3Rpb25CdXR0b25zKHN0YXRlTmFtZSwgYXJncykge1xuICAgIGlmICh0aGlzLmN1cnN0YXRlICE9IHN0YXRlTmFtZSkge1xuICAgICAgLy8gZGVsYXkgZmlyaW5nIHRoaXMgdW50aWwgb25FbnRlcmluZ1N0YXRlIGlzIGNhbGxlZCBzbyB0aGV5IGFsd2F5cyBjYWxsZWQgaW4gc2FtZSBvcmRlclxuICAgICAgdGhpcy5wZW5kaW5nVXBkYXRlID0gdHJ1ZTtcbiAgICAgIC8vY29uc29sZS5sb2coJyAgIERFTEFZRUQgb25VcGRhdGVBY3Rpb25CdXR0b25zJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucGVuZGluZ1VwZGF0ZSA9IGZhbHNlO1xuICAgIGlmIChnYW1ldWkuaXNDdXJyZW50UGxheWVyQWN0aXZlKCkgJiYgdGhpcy5jdXJyZW50UGxheWVyV2FzQWN0aXZlID09IGZhbHNlKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uVXBkYXRlQWN0aW9uQnV0dG9uczogXCIgKyBzdGF0ZU5hbWUsIGFyZ3MsIHRoaXMuZGVidWdTdGF0ZUluZm8oKSk7XG4gICAgICB0aGlzLmN1cnJlbnRQbGF5ZXJXYXNBY3RpdmUgPSB0cnVlO1xuICAgICAgLy8gQ2FsbCBhcHByb3ByaWF0ZSBtZXRob2RcbiAgICAgIHRoaXMuY2FsbGZuKFwib25VcGRhdGVBY3Rpb25CdXR0b25zX1wiICsgc3RhdGVOYW1lLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdXJyZW50UGxheWVyV2FzQWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gdXRpbHNcbiAgZGVidWdTdGF0ZUluZm8oKSB7XG4gICAgdmFyIGlzY3VyYWMgPSBnYW1ldWkuaXNDdXJyZW50UGxheWVyQWN0aXZlKCk7XG4gICAgdmFyIHJlcGxheU1vZGUgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGdfcmVwbGF5RnJvbSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICByZXBsYXlNb2RlID0gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGluc3RhbnRhbmVvdXNNb2RlID0gZ2FtZXVpLmluc3RhbnRhbmVvdXNNb2RlID8gdHJ1ZSA6IGZhbHNlO1xuICAgIHZhciByZXMgPSB7XG4gICAgICBpc0N1cnJlbnRQbGF5ZXJBY3RpdmU6IGlzY3VyYWMsXG4gICAgICBpbnN0YW50YW5lb3VzTW9kZTogaW5zdGFudGFuZW91c01vZGUsXG4gICAgICByZXBsYXlNb2RlOiByZXBsYXlNb2RlLFxuICAgIH07XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBhamF4Y2FsbHdyYXBwZXIoYWN0aW9uOiBzdHJpbmcsIGFyZ3M/OiBhbnksIGhhbmRsZXI/KSB7XG4gICAgaWYgKCFhcmdzKSB7XG4gICAgICBhcmdzID0ge307XG4gICAgfVxuICAgIGFyZ3MubG9jayA9IHRydWU7XG5cbiAgICBpZiAoZ2FtZXVpLmNoZWNrQWN0aW9uKGFjdGlvbikpIHtcbiAgICAgIGdhbWV1aS5hamF4Y2FsbChcbiAgICAgICAgXCIvXCIgKyBnYW1ldWkuZ2FtZV9uYW1lICsgXCIvXCIgKyBnYW1ldWkuZ2FtZV9uYW1lICsgXCIvXCIgKyBhY3Rpb24gKyBcIi5odG1sXCIsXG4gICAgICAgIGFyZ3MsIC8vXG4gICAgICAgIGdhbWV1aSxcbiAgICAgICAgKHJlc3VsdCkgPT4ge30sXG4gICAgICAgIGhhbmRsZXJcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlSHRtbChkaXZzdHI6IHN0cmluZywgbG9jYXRpb24/OiBzdHJpbmcpIHtcbiAgICBjb25zdCB0ZW1wSG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB0ZW1wSG9sZGVyLmlubmVySFRNTCA9IGRpdnN0cjtcbiAgICBjb25zdCBkaXYgPSB0ZW1wSG9sZGVyLmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGNvbnN0IHBhcmVudE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChsb2NhdGlvbik7XG4gICAgaWYgKHBhcmVudE5vZGUpIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICByZXR1cm4gZGl2O1xuICB9XG5cbiAgY3JlYXRlRGl2KGlkPzogc3RyaW5nIHwgdW5kZWZpbmVkLCBjbGFzc2VzPzogc3RyaW5nLCBsb2NhdGlvbj86IHN0cmluZykge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaWYgKGlkKSBkaXYuaWQgID0gaWQ7XG4gICAgaWYgKGNsYXNzZXMpIGRpdi5jbGFzc0xpc3QuYWRkKC4uLmNsYXNzZXMuc3BsaXQoXCIgXCIpKTtcbiAgICBjb25zdCBwYXJlbnROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobG9jYXRpb24pO1xuICAgIGlmIChwYXJlbnROb2RlKSBwYXJlbnROb2RlLmFwcGVuZENoaWxkKGRpdik7XG4gICAgcmV0dXJuIGRpdjtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZVxuICAgKiBAcGFyYW0ge29iamVjdH0gYXJnc1xuICAgKiBAcmV0dXJuc1xuICAgKi9cbiAgY2FsbGZuKG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICBpZiAodGhpc1ttZXRob2ROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIkNhbGxpbmcgXCIgKyBtZXRob2ROYW1lLCBhcmdzKTtcbiAgICAgIHJldHVybiB0aGlzW21ldGhvZE5hbWVdKGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIC8qKiBAT3ZlcnJpZGUgb25TY3JpcHRFcnJvciBmcm9tIGdhbWV1aSAqL1xuICBvblNjcmlwdEVycm9yKG1zZywgdXJsLCBsaW5lbnVtYmVyKSB7XG4gICAgaWYgKGdhbWV1aS5wYWdlX2lzX3VubG9hZGluZykge1xuICAgICAgLy8gRG9uJ3QgcmVwb3J0IGVycm9ycyBkdXJpbmcgcGFnZSB1bmxvYWRpbmdcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gSW4gYW55Y2FzZSwgcmVwb3J0IHRoZXNlIGVycm9ycyBpbiB0aGUgY29uc29sZVxuICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAvLyBjYW5ub3QgY2FsbCBzdXBlciAtIGRvam8gc3RpbGwgaGF2ZSB0byB1c2VkIGhlcmVcbiAgICAvL3N1cGVyLm9uU2NyaXB0RXJyb3IobXNnLCB1cmwsIGxpbmVudW1iZXIpO1xuICAgIHJldHVybiB0aGlzLmluaGVyaXRlZChhcmd1bWVudHMpO1xuICB9XG59XG4iLCIvKipcbiAqIEN1c3RvbSBtb2R1bGVcbiAqL1xuY2xhc3MgQ3VzdG9tTW9kdWxlIHtcbiAgZ2FtZWRhdGFzOiBhbnk7XG4gIHNldHVwKGdhbWVkYXRhczogYW55KXtcbiAgICAgdGhpcy5nYW1lZGF0YXMgPSBnYW1lZGF0YXM7XG4gICAgIGNvbnNvbGUubG9nKFwiaGVsbG8gZnJvbSBzZXR1cCBvZiBNeUZvb1wiKTtcbiAgfVxufTsiLCIvKiogR2FtZSBjbGFzcyAqL1xuY2xhc3MgRGVhZE1lblBheCBleHRlbmRzIEdhbWVCYXNpY3Mge1xuICB2YXJmb286IEN1c3RvbU1vZHVsZTtcbiAgc2hpcDogU2hpcDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmFyZm9vID0gbmV3IEN1c3RvbU1vZHVsZSgpOyAvLyB0aGlzIGV4YW1wbGUgb2YgY2xhc3MgZnJvbSBjdXN0b20gbW9kdWxlXG4gIH1cblxuICBzZXR1cChnYW1lZGF0YXMpIHtcbiAgICBzdXBlci5zZXR1cChnYW1lZGF0YXMpO1xuICAgIC8vc3VwZXIuc2V0dXAoZ2FtZWRhdGFzKTtcblxuICAgIHRoaXMuc2hpcCA9IG5ldyBTaGlwKHRoaXMpO1xuXG5cbiAgICB0aGlzLmNyZWF0ZURpdih1bmRlZmluZWQsIFwid2hpdGVibG9jayBjb3dcIiwgXCJ0aGV0aGluZ1wiKS5pbm5lckhUTUwgPSBfKFwiU2hvdWxkIHdlIGVhdCB0aGUgY293P1wiKTtcbiAgICB0aGlzLnZhcmZvby5zZXR1cChnYW1lZGF0YXMpO1xuICAgIHRoaXMuc2V0dXBOb3RpZmljYXRpb25zKCk7XG4gICAgY29uc29sZS5sb2coXCJFbmRpbmcgZ2FtZSBzZXR1cFwiKTtcbiAgfVxuXG4gIC8vIG9uIGNsaWNrIGhvb2tzXG4gIG9uQnV0dG9uQ2xpY2soZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZyhcIm9uQnV0dG9uQ2xpY2tcIiwgZXZlbnQpO1xuICB9XG5cbiAgb25VcGRhdGVBY3Rpb25CdXR0b25zX3BsYXllclR1cm5BKGFyZ3MpIHtcbiAgICB0aGlzLmFkZEFjdGlvbkJ1dHRvbihcImIxXCIsIF8oXCJQbGF5IENhcmRcIiksICgpID0+IHRoaXMuYWpheGNhbGx3cmFwcGVyKFwicGxheUNhcmRcIikpO1xuICAgIHRoaXMuYWRkQWN0aW9uQnV0dG9uKFwiYjJcIiwgXyhcIlZvdGVcIiksICgpID0+IHRoaXMuYWpheGNhbGx3cmFwcGVyKFwicGxheVZvdGVcIikpO1xuICAgIHRoaXMuYWRkQWN0aW9uQnV0dG9uKFwiYjNcIiwgXyhcIlBhc3NcIiksICgpID0+IHRoaXMuYWpheGNhbGx3cmFwcGVyKFwicGFzc1wiKSk7XG4gIH1cbiAgb25VcGRhdGVBY3Rpb25CdXR0b25zX3BsYXllclR1cm5CKGFyZ3MpIHtcbiAgICB0aGlzLmFkZEFjdGlvbkJ1dHRvbihcImIxXCIsIF8oXCJTdXBwb3J0XCIpLCAoKSA9PiB0aGlzLmFqYXhjYWxsd3JhcHBlcihcInBsYXlTdXBwb3J0XCIpKTtcbiAgICB0aGlzLmFkZEFjdGlvbkJ1dHRvbihcImIyXCIsIF8oXCJPcHBvc2VcIiksICgpID0+IHRoaXMuYWpheGNhbGx3cmFwcGVyKFwicGxheU9wcG9zZVwiKSk7XG4gICAgdGhpcy5hZGRBY3Rpb25CdXR0b24oXCJiM1wiLCBfKFwiV2FpdFwiKSwgKCkgPT4gdGhpcy5hamF4Y2FsbHdyYXBwZXIoXCJwbGF5V2FpdFwiKSk7XG4gIH1cblxuICBzZXR1cE5vdGlmaWNhdGlvbnMoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgbSBpbiB0aGlzKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbbV0gPT0gXCJmdW5jdGlvblwiICYmIG0uc3RhcnRzV2l0aChcIm5vdGlmX1wiKSkge1xuICAgICAgICBkb2pvLnN1YnNjcmliZShtLnN1YnN0cmluZyg2KSwgdGhpcywgbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbm90aWZfbWVzc2FnZShub3RpZjogYW55KTogdm9pZCB7XG4gICAgY29uc29sZS5sb2coXCJub3RpZlwiLCBub3RpZik7XG4gIH1cbn1cbiIsIlxuZGVmaW5lKFtcbiAgXCJkb2pvXCIsXG4gIFwiZG9qby9fYmFzZS9kZWNsYXJlXCIsXG4gIFwiZWJnL2NvcmUvZ2FtZWd1aVwiLFxuICBcImViZy9jb3VudGVyXCIsXG4gIFwiLi9tb2R1bGVzL2pzL3Njcm9sbG1hcFdpdGhab29tXCIsXG4gIFwiLi9tb2R1bGVzL2pzL2JnYS1jYXJkc1wiXG5dLCBmdW5jdGlvbiAoZG9qbywgZGVjbGFyZSkge1xuICBkZWNsYXJlKFwiYmdhZ2FtZS5kZWFkbWVucGF4XCIsIGViZy5jb3JlLmdhbWVndWksIG5ldyBEZWFkTWVuUGF4KCkpO1xufSk7XG4iLCJjbGFzcyBQbGF5ZXJCb2FyZCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBnYW1lOiBEZWFkTWVuUGF4KSB7fVxyXG4gIFxyXG4gICAgcHVibGljIGluaXQodGFyZ2V0RGl2OkVsZW1lbnQsIHBsYXllcjphbnkgKSB7XHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGJvYXJkXHJcbiAgICAgICAgbGV0IGJvYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBib2FyZC5pZCA9IFwiYm9hcmRfXCIrcGxheWVyLmlkO1xyXG4gICAgICAgIGJvYXJkLmNsYXNzTGlzdC5hZGQoXCJwbGF5ZXJfYm9hcmRcIik7XHJcbiAgICAgICAgdGFyZ2V0RGl2Lmluc2VydEFkamFjZW50RWxlbWVudChcImJlZm9yZWVuZFwiLGJvYXJkKTtcclxuXHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGZhdGlndWUgZGlhbFxyXG4gICAgICAgIGxldCBkaWFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBkaWFsLmlkID0gXCJmYXRpZ3VlX1wiK3BsYXllci5pZDtcclxuICAgICAgICBkaWFsLmNsYXNzTGlzdC5hZGQoXCJmYXRpZ3VlX2RpYWxcIik7XHJcbiAgICAgICAgYm9hcmQuYXBwZW5kQ2hpbGQoZGlhbCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9jcmVhdGUgdGhlIGJhdHRsZSBtYXJrZXIgcG9zaXNpdG9uc1xyXG4gICAgICAgIGZvcihsZXQgaT0xOyBpPD01OyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgYmF0dGxlc3RyZW5naHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICBiYXR0bGVzdHJlbmdodC5pZCA9IFwiYmF0dGxlX1wiK2krXCJfXCIrcGxheWVyLmlkO1xyXG4gICAgICAgICAgICBiYXR0bGVzdHJlbmdodC5jbGFzc0xpc3QuYWRkKFwiYmF0dGxlX1wiK2kpO1xyXG4gICAgICAgICAgICBib2FyZC5hcHBlbmRDaGlsZChiYXR0bGVzdHJlbmdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBcclxufSIsInR5cGUgUm90YXRpb25EaXJlY3Rpb24gPSBcImxlZnRcIiB8IFwicmlnaHRcIjtcclxudHlwZSBPcmllbnRhdGlvbiA9IDAgfCA5MCB8IDE4MCB8IDI3MDtcclxuXHJcbmludGVyZmFjZSBDYXJkIHtcclxuICBpZDogbnVtYmVyO1xyXG4gIHR5cGU6IHN0cmluZztcclxuICB0eXBlX2FyZzogbnVtYmVyO1xyXG4gIGxvY2F0aW9uOiBzdHJpbmc7XHJcbiAgbG9jYXRpb25fYXJnOiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBSb29tQ2FyZCBleHRlbmRzIENhcmQge1xyXG4gIGZpcmVfbGV2ZWw6IG51bWJlcjtcclxuICBvcmllbnRhdGlvbjogT3JpZW50YXRpb247XHJcbn1cclxuXHJcbmNsYXNzIFJvb20gaW1wbGVtZW50cyBSb29tQ2FyZCB7XHJcbiAgaWQ6IG51bWJlcjtcclxuICB0eXBlOiBzdHJpbmc7XHJcbiAgdHlwZV9hcmc6IG51bWJlcjtcclxuICBsb2NhdGlvbjogc3RyaW5nO1xyXG4gIGxvY2F0aW9uX2FyZzogbnVtYmVyO1xyXG4gIGZpcmVfbGV2ZWw6IG51bWJlcjtcclxuICBvcmllbnRhdGlvbjogT3JpZW50YXRpb247XHJcblxyXG4gIHByaXZhdGUgZWxlbWVudDogSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihjYXJkOiBSb29tQ2FyZCkge1xyXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBjYXJkKTtcclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICB0aGlzLmVsZW1lbnQuaWQgPSBTdHJpbmcodGhpcy5pZCk7XHJcbiAgICB0aGlzLnVwZGF0ZVN0eWxlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcm90YXRlKGRpcmVjdGlvbjogUm90YXRpb25EaXJlY3Rpb24pOiB2b2lkIHtcclxuICAgIGNvbnN0IG9yaWVudGF0aW9uczogT3JpZW50YXRpb25bXSA9IFswLCA5MCwgMTgwLCAyNzBdO1xyXG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gb3JpZW50YXRpb25zLmluZGV4T2YodGhpcy5vcmllbnRhdGlvbik7XHJcblxyXG4gICAgbGV0IG5ld0luZGV4O1xyXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJyaWdodFwiKSB7XHJcbiAgICAgIG5ld0luZGV4ID0gKGN1cnJlbnRJbmRleCArIDEpICUgb3JpZW50YXRpb25zLmxlbmd0aDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5ld0luZGV4ID0gKGN1cnJlbnRJbmRleCAtIDEgKyBvcmllbnRhdGlvbnMubGVuZ3RoKSAlIG9yaWVudGF0aW9ucy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uc1tuZXdJbmRleF07XHJcbiAgICB0aGlzLnVwZGF0ZVN0eWxlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlU3R5bGUoKTogdm9pZCB7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLW9yaWVudGF0aW9uXCIsIFN0cmluZyh0aGlzLm9yaWVudGF0aW9uKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLWZpcmVcIiwgU3RyaW5nKHRoaXMuZmlyZV9sZXZlbCkpO1xyXG4gIH1cclxufVxyXG4iLCJ0eXBlIENlbGxTdGF0ZSA9IFwiZW1wdHlcIiB8IFwiZmlsbGVkXCI7XHJcblxyXG5pbnRlcmZhY2UgUG9zaXRpb24ge1xyXG4gIHg6IG51bWJlcjtcclxuICB5OiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBHcmlkQ2VsbCBleHRlbmRzIFBvc2l0aW9uIHtcclxuICBzdGF0ZTogQ2VsbFN0YXRlO1xyXG4gIGVsZW1lbnQ6IEhUTUxEaXZFbGVtZW50O1xyXG59XHJcblxyXG5jbGFzcyBTaGlwIHtcclxuICAvLyBLZWVwIGEgTWFwIG9mIGFsbCBjZWxscyAoZW1wdHkgb3IgZmlsbGVkKVxyXG4gIHByaXZhdGUgY2VsbHM6IE1hcDxzdHJpbmcsIEdyaWRDZWxsPiA9IG5ldyBNYXAoKTtcclxuXHJcbiAgLy8gVHJhY2sgdGhlIGJvdW5kaW5nIGJveCBvZiBhbGwgY2VsbHMgKGVtcHR5IG9yIGZpbGxlZClcclxuICBwcml2YXRlIG1pblggPSAwO1xyXG4gIHByaXZhdGUgbWF4WCA9IDA7XHJcbiAgcHJpdmF0ZSBtaW5ZID0gMDtcclxuICBwcml2YXRlIG1heFkgPSAwO1xyXG5cclxuICAvL1VJIHBhcmFtZXRlcnNcclxuICBwcml2YXRlIGdyaWRDb250YWluZXI6IEhUTUxFbGVtZW50O1xyXG4gIHByaXZhdGUgc2Nyb2xsTWFwOiBTY3JvbGxtYXBXaXRoWm9vbU5TLlNjcm9sbG1hcFdpdGhab29tO1xyXG5cclxuICAvL3N0YXRlXHJcbiAgcHJpdmF0ZSBwb3NpdGlvbmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IERlYWRNZW5QYXgpIHt9XHJcblxyXG4gIHB1YmxpYyBpbml0KCkge1xyXG4gICAgLy9hZGQgdGhlIHdyYXBwZXIgZm9yIHRoZSBzY3JvbGxtYXBcclxuICAgIGxldCB0YXJnZXREaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWVfcGxheV9hcmVhXCIpO1xyXG4gICAgbGV0IHNlYURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBsZXQgaWQgPSBcInNlYV93cmFwcGVyXCI7XHJcbiAgICBzZWFEaXYuaWQgPSBpZDtcclxuICAgIHRhcmdldERpdi5pbnNlcnRCZWZvcmUoc2VhRGl2LCB0YXJnZXREaXYuZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgLy9zZXR1cCB0aGUgc2Nyb2xsbWFwXHJcbiAgICB0aGlzLnNldHVwU2Nyb2xsTWFwKFwic2VhX3dyYXBwZXJcIik7XHJcblxyXG4gICAgLy9wcmVwYXJlIHRoZSBncmlkIGluIHRoZSBvdmVyc3VyZmFjZVxyXG5cclxuICAgIGxldCBvdmVyc3VyZmFjZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTERpdkVsZW1lbnQ+KFxyXG4gICAgICBcIi5zY3JvbGxtYXBfb25zdXJmYWNlXCJcclxuICAgICk7XHJcbiAgICB0aGlzLmluaXRHcmlkKG92ZXJzdXJmYWNlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0dXBTY3JvbGxNYXAoc2VhV3JhcHBlcjogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnNjcm9sbE1hcCA9IG5ldyBlYmcuc2Nyb2xsbWFwV2l0aFpvb20oKTtcclxuICAgIHRoaXMuc2Nyb2xsTWFwLnpvb20gPSAwLjg7XHJcblxyXG4gICAgLy9jcmVhdGUgbWFpbiBzY3JvbGxtYXBcclxuICAgIHRoaXMuc2Nyb2xsTWFwLmNyZWF0ZUNvbXBsZXRlbHkoJChzZWFXcmFwcGVyKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRHcmlkKG92ZXJzdXJmYWNlOiBIVE1MRWxlbWVudCk6IHZvaWQge1xyXG4gICAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBjb250YWluZXIuaWQgPSBcImdyaWRfY29udGFpbmVyXCI7XHJcblxyXG4gICAgLy8gSnVzdCBzb21lIGJhc2Ugc3R5bGluZyBmb3IgdmlzdWFsaXphdGlvbi5cclxuICAgIGNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcclxuICAgIGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gXCJncmlkXCI7XHJcbiAgICBjb250YWluZXIuc3R5bGUuYm9yZGVyID0gXCIxcHggc29saWQgIzMzM1wiO1xyXG4gICAgLy9hZGQgdGhlIGdyaWQgY29udGFpbmVyXHJcbiAgICB0aGlzLmdyaWRDb250YWluZXIgPSBjb250YWluZXI7XHJcbiAgICBvdmVyc3VyZmFjZS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xyXG5cclxuICAgIC8vYWRkIHRoZSBmaXJzdCBlbXB0eSBlbGVtZW50IGF0IDAsMFxyXG4gICAgdGhpcy5jcmVhdGVDZWxsKDAsIDApO1xyXG4gICAgdGhpcy51cGRhdGVHcmlkKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZmlsbENlbGwoeDogbnVtYmVyLCB5OiBudW1iZXIsIGNoaWxkPzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgIGlmICh5IDwgMCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oYENhbm5vdCBmaWxsIGEgY2VsbCB3aXRoIG5lZ2F0aXZlIFk6ICh4PSR7eH0sIHk9JHt5fSlgKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3Qga2V5ID0gdGhpcy5jZWxsS2V5KHgsIHkpO1xyXG4gICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbHMuZ2V0KGtleSk7XHJcblxyXG4gICAgaWYgKCFjZWxsKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihgQ2Fubm90IGZpbGwgKHg9JHt4fSwgeT0ke3l9KSBiZWNhdXNlIGl0IGRvZXNuJ3QgZXhpc3QuIFxyXG4gICAgICAgICAgICAgICAgICAgICBZb3UgY2FuIG9ubHkgZmlsbCBjZWxscyB0aGF0IHdlcmUgcHJldmlvdXNseSBlbXB0eS5gKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGNlbGwuc3RhdGUgPT09IFwiZmlsbGVkXCIpIHtcclxuICAgICAgY29uc29sZS53YXJuKGBDZWxsICh4PSR7eH0sIHk9JHt5fSkgaXMgYWxyZWFkeSBmaWxsZWQuYCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGaWxsIHRoZSBjZWxsXHJcbiAgICBjZWxsLnN0YXRlID0gXCJmaWxsZWRcIjtcclxuICAgIGNlbGwuZWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgaWYgKGNoaWxkKSB7XHJcbiAgICAgIGNlbGwuZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjZWxsLmVsZW1lbnQudGV4dENvbnRlbnQgPSBgKCR7eH0sICR7eX0pYDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgZ3JpZCA9PiBlbnN1cmVzIHRoZSBuZXdseSBmaWxsZWQgY2VsbCBoYXMgZW1wdHkgbmVpZ2hib3JzXHJcbiAgICB0aGlzLnVwZGF0ZUdyaWQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsIGhlbHBlciB0byBnZW5lcmF0ZSBhIHN0YWJsZSBzdHJpbmcga2V5IGZvciBlYWNoICh4LCB5KS5cclxuICAgKi9cclxuICBwcml2YXRlIGNlbGxLZXkoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGAke3h9OiR7eX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIHRoZSB1bmRlcmx5aW5nIERPTSA8ZGl2PiBmb3IgYSBjZWxsLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY3JlYXRlQ2VsbChcclxuICAgIHg6IG51bWJlcixcclxuICAgIHk6IG51bWJlcixcclxuICAgIHN0YXRlOiBDZWxsU3RhdGUgPSBcImVtcHR5XCJcclxuICApOiBHcmlkQ2VsbCB7XHJcbiAgICBjb25zdCBrZXkgPSB0aGlzLmNlbGxLZXkoeCwgeSk7XHJcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgZGl2LmlkID0gYGNlbGxfJHtrZXl9YDtcclxuICAgIGRpdi5zdHlsZS5ib3JkZXIgPSBcIjFweCBzb2xpZCBibGFja1wiO1xyXG4gICAgZGl2LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgIGRpdi5zdHlsZS5hbGlnbkl0ZW1zID0gXCJjZW50ZXJcIjtcclxuICAgIGRpdi5zdHlsZS5qdXN0aWZ5Q29udGVudCA9IFwiY2VudGVyXCI7XHJcblxyXG4gICAgLy8gTWluaW1hbCBwbGFjZWhvbGRlcnM6XHJcbiAgICBkaXYuZGF0YXNldC54ID0geC50b1N0cmluZygpO1xyXG4gICAgZGl2LmRhdGFzZXQueSA9IHkudG9TdHJpbmcoKTtcclxuXHJcbiAgICBjb25zdCBjZWxsOiBHcmlkQ2VsbCA9IHsgeCwgeSwgc3RhdGUsIGVsZW1lbnQ6IGRpdiB9O1xyXG4gICAgdGhpcy5jZWxscy5zZXQoa2V5LCBjZWxsKTtcclxuXHJcbiAgICAvLyBBcHBlbmQgdG8gY29udGFpbmVyIHNvIGl0IHBoeXNpY2FsbHkgZXhpc3RzXHJcbiAgICB0aGlzLmdyaWRDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcclxuXHJcbiAgICByZXR1cm4gY2VsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlR3JpZCgpOiB2b2lkIHtcclxuICAgIC8vIEZvciBlYWNoIGZpbGxlZCBjZWxsLCBlbnN1cmUgbmVpZ2hib3JzIGV4aXN0ICh1bmxlc3MgeT0wIGJsb2NrcyBiZWxvdykuXHJcbiAgICB0aGlzLmNlbGxzLmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgaWYgKGNlbGwuc3RhdGUgPT09IFwiZmlsbGVkXCIpIHtcclxuICAgICAgICB0aGlzLmdyb3dGcm9tQ2VsbChjZWxsLngsIGNlbGwueSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vICAgIFJlY29tcHV0ZSBib3VuZGluZyBib3ggZnJvbSBhbGwgZXhpc3RpbmcgY2VsbHNcclxuICAgIC8vICAgIChXZSBkbyB0aGlzIGluIG9uZSBwYXNzIHNvIHdlIG9ubHkgZXhwYW5kIGFzIG5lZWRlZC4pXHJcbiAgICB0aGlzLnJlY29tcHV0ZUJvdW5kaW5nQm94KCk7XHJcblxyXG4gICAgLy8gU2V0IHVwIHRoZSBDU1MgZ3JpZCB0byBjb3ZlciBtaW5YLi5tYXhYLCBtaW5ZLi5tYXhZXHJcbiAgICAvLyAgICBUaGUgIyBvZiBjb2x1bW5zL3Jvd3MgaXMgKG1heC1taW4rMSkuXHJcbiAgICBjb25zdCB0b3RhbENvbHMgPSB0aGlzLm1heFggLSB0aGlzLm1pblggKyAxO1xyXG4gICAgY29uc3QgdG90YWxSb3dzID0gdGhpcy5tYXhZIC0gdGhpcy5taW5ZICsgMTtcclxuXHJcbiAgICB0aGlzLmdyaWRDb250YWluZXIuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IGByZXBlYXQoJHt0b3RhbENvbHN9LCA1MHB4KWA7XHJcbiAgICB0aGlzLmdyaWRDb250YWluZXIuc3R5bGUuZ3JpZFRlbXBsYXRlUm93cyA9IGByZXBlYXQoJHt0b3RhbFJvd3N9LCA1MHB4KWA7XHJcblxyXG4gICAgLy8gUG9zaXRpb24gZWFjaCBjZWxsXHJcbiAgICB0aGlzLmNlbGxzLmZvckVhY2goKGNlbGwpID0+IHtcclxuICAgICAgY29uc3QgY29sUG9zID0gY2VsbC54IC0gdGhpcy5taW5YICsgMTsgLy8gMS1iYXNlZCBmcm9tIHRoZSBsZWZ0XHJcbiAgICAgIC8vIEludmVydCBZOiByb3cgMSBpcyBtYXhZLCByb3cgdG90YWxSb3dzIGlzIG1pbllcclxuICAgICAgY29uc3Qgcm93UG9zID0gdGhpcy5tYXhZIC0gY2VsbC55ICsgMTtcclxuICAgICAgY2VsbC5lbGVtZW50LnN0eWxlLmdyaWRDb2x1bW4gPSBTdHJpbmcoY29sUG9zKTtcclxuICAgICAgY2VsbC5lbGVtZW50LnN0eWxlLmdyaWRSb3cgPSBTdHJpbmcocm93UG9zKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBwcml2YXRlIGdyb3dGcm9tQ2VsbCh4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgLy8gTGVmdCBuZWlnaGJvciA9PiAoeC0xLCB5KSBpZiBub3QgcHJlc2VudFxyXG4gICAgdGhpcy5ncm93SW5EaXJlY3Rpb24oeCAtIDEsIHkpO1xyXG5cclxuICAgIC8vIFJpZ2h0IG5laWdoYm9yID0+ICh4KzEsIHkpXHJcbiAgICB0aGlzLmdyb3dJbkRpcmVjdGlvbih4ICsgMSwgeSk7XHJcblxyXG4gICAgLy8gQWJvdmUgPT4gKHgsIHkrMSlcclxuICAgIHRoaXMuZ3Jvd0luRGlyZWN0aW9uKHgsIHkgKyAxKTtcclxuXHJcbiAgICAvLyBCZWxvdyA9PiAoeCwgeS0xKSwgYnV0IG9ubHkgaWYgeS0xID49IDBcclxuICAgIGlmICh5IC0gMSA+PSAwKSB7XHJcbiAgICAgIHRoaXMuZ3Jvd0luRGlyZWN0aW9uKHgsIHkgLSAxKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ3Jvd0luRGlyZWN0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAoeSA8IDApIHJldHVybjsgLy8gc2tpcCBhbnkgcm93IGJlbG93IHk9MFxyXG5cclxuICAgIGNvbnN0IGtleSA9IHRoaXMuY2VsbEtleSh4LCB5KTtcclxuICAgIGlmICghdGhpcy5jZWxscy5oYXMoa2V5KSkge1xyXG4gICAgICB0aGlzLmNyZWF0ZUNlbGwoeCwgeSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlY29tcHV0ZUJvdW5kaW5nQm94KCk6IHZvaWQge1xyXG4gICAgbGV0IG1pblggPSBJbmZpbml0eTtcclxuICAgIGxldCBtYXhYID0gLUluZmluaXR5O1xyXG4gICAgbGV0IG1pblkgPSBJbmZpbml0eTtcclxuICAgIGxldCBtYXhZID0gLUluZmluaXR5O1xyXG5cclxuICAgIHRoaXMuY2VsbHMuZm9yRWFjaCgoY2VsbCkgPT4ge1xyXG4gICAgICBpZiAoY2VsbC54IDwgbWluWCkgbWluWCA9IGNlbGwueDtcclxuICAgICAgaWYgKGNlbGwueCA+IG1heFgpIG1heFggPSBjZWxsLng7XHJcbiAgICAgIGlmIChjZWxsLnkgPCBtaW5ZKSBtaW5ZID0gY2VsbC55O1xyXG4gICAgICBpZiAoY2VsbC55ID4gbWF4WSkgbWF4WSA9IGNlbGwueTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIElmIHdlIHNvbWVob3cgaGF2ZSBubyBjZWxscywgbGVhdmUgYm91bmRpbmcgYm94IGFsb25lXHJcbiAgICBpZiAodGhpcy5jZWxscy5zaXplID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1pblggPSBtaW5YO1xyXG4gICAgdGhpcy5tYXhYID0gbWF4WDtcclxuICAgIHRoaXMubWluWSA9IE1hdGgubWF4KG1pblksIDApOyAvLyBjbGFtcCB0byAwXHJcbiAgICB0aGlzLm1heFkgPSBtYXhZO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvZ2dsZUhpZ2hsaWdodChcclxuICAgIHBvc2l0aW9uczogUG9zaXRpb24gfCBQb3NpdGlvbltdLFxyXG4gICAgc3RhdGU6IGJvb2xlYW4gfCBudWxsID0gbnVsbFxyXG4gICk6IHZvaWQge1xyXG4gICAgLy8gRW5zdXJlIHBvc2l0aW9ucyBpcyBhbHdheXMgYW4gYXJyYXlcclxuICAgIGNvbnN0IHBvc2l0aW9uc0FycmF5ID0gQXJyYXkuaXNBcnJheShwb3NpdGlvbnMpID8gcG9zaXRpb25zIDogW3Bvc2l0aW9uc107XHJcblxyXG4gICAgZm9yIChjb25zdCBwb3Mgb2YgcG9zaXRpb25zQXJyYXkpIHtcclxuICAgICAgLy8gQ3JlYXRlIHRoZSBrZXkgdG8gY2hlY2sgaW4gdGhlIE1hcFxyXG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmNlbGxLZXkocG9zLngsIHBvcy55KTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmNlbGxzLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbHMuZ2V0KGtleSkhO1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUgPT09IHRydWUpIHtcclxuICAgICAgICAgIGNlbGwuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlnaGxpZ2h0ZWRcIik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgIGNlbGwuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlnaGxpZ2h0ZWRcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIFRvZ2dsZSBjbGFzcyBpZiBzdGF0ZSBpcyBudWxsXHJcbiAgICAgICAgICBjZWxsLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImhpZ2hsaWdodGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGNsZWFySGlnaGxpZ2h0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jZWxscy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgIGxldCBjZWxsID0gdGhpcy5jZWxscy5nZXQoa2V5KSE7XHJcbiAgICAgIGNlbGwuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlnaGxpZ2h0ZWRcIik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59XHJcbiJdfQ==