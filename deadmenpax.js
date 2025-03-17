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
    Ship.prototype.positioningMode = function (room, positions, boolean, , , ) {
        if (state = null) {
            state = !this.positioning;
        }
    };
    return Ship;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVhZG1lbnBheC5qcyIsInNvdXJjZVJvb3QiOiIuL3NyYy8iLCJzb3VyY2VzIjpbIkdhbWVCYXNpY3MudHMiLCJDdXN0b21Nb2R1bGUudHMiLCJkZWFkbWVucGF4LnRzIiwienpNYWluLnRzIiwidWkvcGxheWVyYm9hcmQudHMiLCJ1aS9yb29tc01hbmFnZXIudHMiLCJ1aS9zaGlwTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxhQUFhO0FBQ2IsT0FBTyxHQUFHLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZCLFNBQVMsT0FBTyxLQUFJLENBQUM7SUFDckIsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUdMO0dBQ0c7QUFFSDtJQUF5Qiw4QkFBTztJQUk5QjtRQUNFLFlBQUEsTUFBSyxXQUFFLFNBQUM7UUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFaEMsS0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsS0FBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDM0IsS0FBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQzs7SUFDdEMsQ0FBQztJQUVELGNBQWM7SUFDZCwwQkFBSyxHQUFMLFVBQU0sU0FBUztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQUVELG9DQUFlLEdBQWYsVUFBZ0IsU0FBUyxFQUFFLElBQUk7UUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1FBQzFCLDBCQUEwQjtRQUMxQixJQUFJLEdBQUcsSUFBSSxDQUFD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QUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzVDLENBQUM7cUJBQU0sSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDL0MsQ0FBQztxQkFBTSxDQUFDO29CQUNOLGdDQUFnQztvQkFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRU0sNkJBQWMsR0FBckI7UUFBQSxpQkFLQztRQUpDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLEdBQUc7WUFDNUIsSUFBSSxJQUFJLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLDhCQUFlLEdBQXRCLFVBQXVCLElBQWMsRUFBRSxTQUFrQixFQUFFLE9BQU8sRUFBQSxFQUFDLEVBQU8sQUFBRDtRQUN2RSxJQUFJLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQztZQUNqQixLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7SUFJSCxDQUFDO0lBQ0gsV0FBQztBQUFELENBQUMsQUF6UEQsSUF5UEMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5HYW1lR3VpID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBHYW1lR3VpKCkge31cbiAgcmV0dXJuIEdhbWVHdWk7XG59KSgpO1xuXG5cbi8qKiBDbGFzcyB0aGF0IGV4dGVuZHMgZGVmYXVsdCBiZ2EgY29yZSBnYW1lIGNsYXNzIHdpdGggbW9yZSBmdW5jdGlvbmFsaXR5XG4gKi9cblxuY2xhc3MgR2FtZUJhc2ljcyBleHRlbmRzIEdhbWVHdWkge1xuICBjdXJzdGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBwZW5kaW5nVXBkYXRlOiBib29sZWFuO1xuICBjdXJyZW50UGxheWVyV2FzQWN0aXZlOiBib29sZWFuO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIGNvbnNvbGUubG9nKFwiZ2FtZSBjb25zdHJ1Y3RvclwiKTtcblxuICAgIHRoaXMuY3Vyc3RhdGUgPSBudWxsO1xuICAgIHRoaXMucGVuZGluZ1VwZGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMuY3VycmVudFBsYXllcldhc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgLy8gc3RhdGUgaG9va3NcbiAgc2V0dXAoZ2FtZWRhdGFzKSB7XG4gICAgY29uc29sZS5sb2coXCJTdGFydGluZyBnYW1lIHNldHVwXCIsIGdhbWV1aSk7XG4gICAgdGhpcy5nYW1lZGF0YXMgPSBnYW1lZGF0YXM7XG4gIH1cblxuICBvbkVudGVyaW5nU3RhdGUoc3RhdGVOYW1lLCBhcmdzKSB7XG4gICAgY29uc29sZS5sb2coXCJvbkVudGVyaW5nU3RhdGU6IFwiICsgc3RhdGVOYW1lLCBhcmdzLCB0aGlzLmRlYnVnU3RhdGVJbmZvKCkpO1xuICAgIHRoaXMuY3Vyc3RhdGUgPSBzdGF0ZU5hbWU7XG4gICAgLy8gQ2FsbCBhcHByb3ByaWF0ZSBtZXRob2RcbiAgICBhcmdzID0gYXJncyA/IGFyZ3MuYXJncyA6IG51bGw7IC8vIHRoaXMgbWV0aG9kIGhhcyBleHRyYSB3cmFwcGVyIGZvciBhcmdzIGZvciBzb21lIHJlYXNvblxuICAgIHZhciBtZXRob2ROYW1lID0gXCJvbkVudGVyaW5nU3RhdGVfXCIgKyBzdGF0ZU5hbWU7XG4gICAgdGhpcy5jYWxsZm4obWV0aG9kTmFtZSwgYXJncyk7XG5cbiAgICBpZiAodGhpcy5wZW5kaW5nVXBkYXRlKSB7XG4gICAgICB0aGlzLm9uVXBkYXRlQWN0aW9uQnV0dG9ucyhzdGF0ZU5hbWUsIGFyZ3MpO1xuICAgICAgdGhpcy5wZW5kaW5nVXBkYXRlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgb25MZWF2aW5nU3RhdGUoc3RhdGVOYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJvbkxlYXZpbmdTdGF0ZTogXCIgKyBzdGF0ZU5hbWUsIHRoaXMuZGVidWdTdGF0ZUluZm8oKSk7XG4gICAgdGhpcy5jdXJyZW50UGxheWVyV2FzQWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBvblVwZGF0ZUFjdGlvbkJ1dHRvbnMoc3RhdGVOYW1lLCBhcmdzKSB7XG4gICAgaWYgKHRoaXMuY3Vyc3RhdGUgIT0gc3RhdGVOYW1lKSB7XG4gICAgICAvLyBkZWxheSBmaXJpbmcgdGhpcyB1bnRpbCBvbkVudGVyaW5nU3RhdGUgaXMgY2FsbGVkIHNvIHRoZXkgYWx3YXlzIGNhbGxlZCBpbiBzYW1lIG9yZGVyXG4gICAgICB0aGlzLnBlbmRpbmdVcGRhdGUgPSB0cnVlO1xuICAgICAgLy9jb25zb2xlLmxvZygnICAgREVMQVlFRCBvblVwZGF0ZUFjdGlvbkJ1dHRvbnMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wZW5kaW5nVXBkYXRlID0gZmFsc2U7XG4gICAgaWYgKGdhbWV1aS5pc0N1cnJlbnRQbGF5ZXJBY3RpdmUoKSAmJiB0aGlzLmN1cnJlbnRQbGF5ZXJXYXNBY3RpdmUgPT0gZmFsc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwib25VcGRhdGVBY3Rpb25CdXR0b25zOiBcIiArIHN0YXRlTmFtZSwgYXJncywgdGhpcy5kZWJ1Z1N0YXRlSW5mbygpKTtcbiAgICAgIHRoaXMuY3VycmVudFBsYXllcldhc0FjdGl2ZSA9IHRydWU7XG4gICAgICAvLyBDYWxsIGFwcHJvcHJpYXRlIG1ldGhvZFxuICAgICAgdGhpcy5jYWxsZm4oXCJvblVwZGF0ZUFjdGlvbkJ1dHRvbnNfXCIgKyBzdGF0ZU5hbWUsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmN1cnJlbnRQbGF5ZXJXYXNBY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvLyB1dGlsc1xuICBkZWJ1Z1N0YXRlSW5mbygpIHtcbiAgICB2YXIgaXNjdXJhYyA9IGdhbWV1aS5pc0N1cnJlbnRQbGF5ZXJBY3RpdmUoKTtcbiAgICB2YXIgcmVwbGF5TW9kZSA9IGZhbHNlO1xuICAgIGlmICh0eXBlb2YgZ19yZXBsYXlGcm9tICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHJlcGxheU1vZGUgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgaW5zdGFudGFuZW91c01vZGUgPSBnYW1ldWkuaW5zdGFudGFuZW91c01vZGUgPyB0cnVlIDogZmFsc2U7XG4gICAgdmFyIHJlcyA9IHtcbiAgICAgIGlzQ3VycmVudFBsYXllckFjdGl2ZTogaXNjdXJhYyxcbiAgICAgIGluc3RhbnRhbmVvdXNNb2RlOiBpbnN0YW50YW5lb3VzTW9kZSxcbiAgICAgIHJlcGxheU1vZGU6IHJlcGxheU1vZGUsXG4gICAgfTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIGFqYXhjYWxsd3JhcHBlcihhY3Rpb246IHN0cmluZywgYXJncz86IGFueSwgaGFuZGxlcj8pIHtcbiAgICBpZiAoIWFyZ3MpIHtcbiAgICAgIGFyZ3MgPSB7fTtcbiAgICB9XG4gICAgYXJncy5sb2NrID0gdHJ1ZTtcblxuICAgIGlmIChnYW1ldWkuY2hlY2tBY3Rpb24oYWN0aW9uKSkge1xuICAgICAgZ2FtZXVpLmFqYXhjYWxsKFxuICAgICAgICBcIi9cIiArIGdhbWV1aS5nYW1lX25hbWUgKyBcIi9cIiArIGdhbWV1aS5nYW1lX25hbWUgKyBcIi9cIiArIGFjdGlvbiArIFwiLmh0bWxcIixcbiAgICAgICAgYXJncywgLy9cbiAgICAgICAgZ2FtZXVpLFxuICAgICAgICAocmVzdWx0KSA9PiB7fSxcbiAgICAgICAgaGFuZGxlclxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVIdG1sKGRpdnN0cjogc3RyaW5nLCBsb2NhdGlvbj86IHN0cmluZykge1xuICAgIGNvbnN0IHRlbXBIb2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRlbXBIb2xkZXIuaW5uZXJIVE1MID0gZGl2c3RyO1xuICAgIGNvbnN0IGRpdiA9IHRlbXBIb2xkZXIuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgY29uc3QgcGFyZW50Tm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGxvY2F0aW9uKTtcbiAgICBpZiAocGFyZW50Tm9kZSkgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIHJldHVybiBkaXY7XG4gIH1cblxuICBjcmVhdGVEaXYoaWQ/OiBzdHJpbmcgfCB1bmRlZmluZWQsIGNsYXNzZXM/OiBzdHJpbmcsIGxvY2F0aW9uPzogc3RyaW5nKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBpZiAoaWQpIGRpdi5pZCAgPSBpZDtcbiAgICBpZiAoY2xhc3NlcykgZGl2LmNsYXNzTGlzdC5hZGQoLi4uY2xhc3Nlcy5zcGxpdChcIiBcIikpO1xuICAgIGNvbnN0IHBhcmVudE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChsb2NhdGlvbik7XG4gICAgaWYgKHBhcmVudE5vZGUpIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICByZXR1cm4gZGl2O1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzXG4gICAqIEByZXR1cm5zXG4gICAqL1xuICBjYWxsZm4obWV0aG9kTmFtZSwgYXJncykge1xuICAgIGlmICh0aGlzW21ldGhvZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQ2FsbGluZyBcIiArIG1ldGhvZE5hbWUsIGFyZ3MpO1xuICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kTmFtZV0oYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgLyoqIEBPdmVycmlkZSBvblNjcmlwdEVycm9yIGZyb20gZ2FtZXVpICovXG4gIG9uU2NyaXB0RXJyb3IobXNnLCB1cmwsIGxpbmVudW1iZXIpIHtcbiAgICBpZiAoZ2FtZXVpLnBhZ2VfaXNfdW5sb2FkaW5nKSB7XG4gICAgICAvLyBEb24ndCByZXBvcnQgZXJyb3JzIGR1cmluZyBwYWdlIHVubG9hZGluZ1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBJbiBhbnljYXNlLCByZXBvcnQgdGhlc2UgZXJyb3JzIGluIHRoZSBjb25zb2xlXG4gICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgIC8vIGNhbm5vdCBjYWxsIHN1cGVyIC0gZG9qbyBzdGlsbCBoYXZlIHRvIHVzZWQgaGVyZVxuICAgIC8vc3VwZXIub25TY3JpcHRFcnJvcihtc2csIHVybCwgbGluZW51bWJlcik7XG4gICAgcmV0dXJuIHRoaXMuaW5oZXJpdGVkKGFyZ3VtZW50cyk7XG4gIH1cbn1cbiIsIi8qKlxuICogQ3VzdG9tIG1vZHVsZVxuICovXG5jbGFzcyBDdXN0b21Nb2R1bGUge1xuICBnYW1lZGF0YXM6IGFueTtcbiAgc2V0dXAoZ2FtZWRhdGFzOiBhbnkpe1xuICAgICB0aGlzLmdhbWVkYXRhcyA9IGdhbWVkYXRhcztcbiAgICAgY29uc29sZS5sb2coXCJoZWxsbyBmcm9tIHNldHVwIG9mIE15Rm9vXCIpO1xuICB9XG59OyIsIi8qKiBHYW1lIGNsYXNzICovXG5jbGFzcyBEZWFkTWVuUGF4IGV4dGVuZHMgR2FtZUJhc2ljcyB7XG4gIHZhcmZvbzogQ3VzdG9tTW9kdWxlO1xuICBzaGlwOiBTaGlwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52YXJmb28gPSBuZXcgQ3VzdG9tTW9kdWxlKCk7IC8vIHRoaXMgZXhhbXBsZSBvZiBjbGFzcyBmcm9tIGN1c3RvbSBtb2R1bGVcbiAgfVxuXG4gIHNldHVwKGdhbWVkYXRhcykge1xuICAgIHN1cGVyLnNldHVwKGdhbWVkYXRhcyk7XG4gICAgLy9zdXBlci5zZXR1cChnYW1lZGF0YXMpO1xuXG4gICAgdGhpcy5zaGlwID0gbmV3IFNoaXAodGhpcyk7XG5cblxuICAgIHRoaXMuY3JlYXRlRGl2KHVuZGVmaW5lZCwgXCJ3aGl0ZWJsb2NrIGNvd1wiLCBcInRoZXRoaW5nXCIpLmlubmVySFRNTCA9IF8oXCJTaG91bGQgd2UgZWF0IHRoZSBjb3c/XCIpO1xuICAgIHRoaXMudmFyZm9vLnNldHVwKGdhbWVkYXRhcyk7XG4gICAgdGhpcy5zZXR1cE5vdGlmaWNhdGlvbnMoKTtcbiAgICBjb25zb2xlLmxvZyhcIkVuZGluZyBnYW1lIHNldHVwXCIpO1xuICB9XG5cbiAgLy8gb24gY2xpY2sgaG9va3NcbiAgb25CdXR0b25DbGljayhldmVudCkge1xuICAgIGNvbnNvbGUubG9nKFwib25CdXR0b25DbGlja1wiLCBldmVudCk7XG4gIH1cblxuICBvblVwZGF0ZUFjdGlvbkJ1dHRvbnNfcGxheWVyVHVybkEoYXJncykge1xuICAgIHRoaXMuYWRkQWN0aW9uQnV0dG9uKFwiYjFcIiwgXyhcIlBsYXkgQ2FyZFwiKSwgKCkgPT4gdGhpcy5hamF4Y2FsbHdyYXBwZXIoXCJwbGF5Q2FyZFwiKSk7XG4gICAgdGhpcy5hZGRBY3Rpb25CdXR0b24oXCJiMlwiLCBfKFwiVm90ZVwiKSwgKCkgPT4gdGhpcy5hamF4Y2FsbHdyYXBwZXIoXCJwbGF5Vm90ZVwiKSk7XG4gICAgdGhpcy5hZGRBY3Rpb25CdXR0b24oXCJiM1wiLCBfKFwiUGFzc1wiKSwgKCkgPT4gdGhpcy5hamF4Y2FsbHdyYXBwZXIoXCJwYXNzXCIpKTtcbiAgfVxuICBvblVwZGF0ZUFjdGlvbkJ1dHRvbnNfcGxheWVyVHVybkIoYXJncykge1xuICAgIHRoaXMuYWRkQWN0aW9uQnV0dG9uKFwiYjFcIiwgXyhcIlN1cHBvcnRcIiksICgpID0+IHRoaXMuYWpheGNhbGx3cmFwcGVyKFwicGxheVN1cHBvcnRcIikpO1xuICAgIHRoaXMuYWRkQWN0aW9uQnV0dG9uKFwiYjJcIiwgXyhcIk9wcG9zZVwiKSwgKCkgPT4gdGhpcy5hamF4Y2FsbHdyYXBwZXIoXCJwbGF5T3Bwb3NlXCIpKTtcbiAgICB0aGlzLmFkZEFjdGlvbkJ1dHRvbihcImIzXCIsIF8oXCJXYWl0XCIpLCAoKSA9PiB0aGlzLmFqYXhjYWxsd3JhcHBlcihcInBsYXlXYWl0XCIpKTtcbiAgfVxuXG4gIHNldHVwTm90aWZpY2F0aW9ucygpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBtIGluIHRoaXMpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1ttXSA9PSBcImZ1bmN0aW9uXCIgJiYgbS5zdGFydHNXaXRoKFwibm90aWZfXCIpKSB7XG4gICAgICAgIGRvam8uc3Vic2NyaWJlKG0uc3Vic3RyaW5nKDYpLCB0aGlzLCBtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBub3RpZl9tZXNzYWdlKG5vdGlmOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZyhcIm5vdGlmXCIsIG5vdGlmKTtcbiAgfVxufVxuIiwiXG5kZWZpbmUoW1xuICBcImRvam9cIixcbiAgXCJkb2pvL19iYXNlL2RlY2xhcmVcIixcbiAgXCJlYmcvY29yZS9nYW1lZ3VpXCIsXG4gIFwiZWJnL2NvdW50ZXJcIixcbiAgXCIuL21vZHVsZXMvanMvc2Nyb2xsbWFwV2l0aFpvb21cIixcbiAgXCIuL21vZHVsZXMvanMvYmdhLWNhcmRzXCJcbl0sIGZ1bmN0aW9uIChkb2pvLCBkZWNsYXJlKSB7XG4gIGRlY2xhcmUoXCJiZ2FnYW1lLmRlYWRtZW5wYXhcIiwgZWJnLmNvcmUuZ2FtZWd1aSwgbmV3IERlYWRNZW5QYXgoKSk7XG59KTtcbiIsImNsYXNzIFBsYXllckJvYXJkIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IERlYWRNZW5QYXgpIHt9XHJcbiAgXHJcbiAgICBwdWJsaWMgaW5pdCh0YXJnZXREaXY6RWxlbWVudCwgcGxheWVyOmFueSApIHtcclxuICAgICAgICAvL2NyZWF0ZSB0aGUgYm9hcmRcclxuICAgICAgICBsZXQgYm9hcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGJvYXJkLmlkID0gXCJib2FyZF9cIitwbGF5ZXIuaWQ7XHJcbiAgICAgICAgYm9hcmQuY2xhc3NMaXN0LmFkZChcInBsYXllcl9ib2FyZFwiKTtcclxuICAgICAgICB0YXJnZXREaXYuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYmVmb3JlZW5kXCIsYm9hcmQpO1xyXG5cclxuICAgICAgICAvL2NyZWF0ZSB0aGUgZmF0aWd1ZSBkaWFsXHJcbiAgICAgICAgbGV0IGRpYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpYWwuaWQgPSBcImZhdGlndWVfXCIrcGxheWVyLmlkO1xyXG4gICAgICAgIGRpYWwuY2xhc3NMaXN0LmFkZChcImZhdGlndWVfZGlhbFwiKTtcclxuICAgICAgICBib2FyZC5hcHBlbmRDaGlsZChkaWFsKTtcclxuICAgICAgICBcclxuICAgICAgICAvL2NyZWF0ZSB0aGUgYmF0dGxlIG1hcmtlciBwb3Npc2l0b25zXHJcbiAgICAgICAgZm9yKGxldCBpPTE7IGk8PTU7IGkrKyl7XHJcbiAgICAgICAgICAgIGxldCBiYXR0bGVzdHJlbmdodCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgICAgIGJhdHRsZXN0cmVuZ2h0LmlkID0gXCJiYXR0bGVfXCIraStcIl9cIitwbGF5ZXIuaWQ7XHJcbiAgICAgICAgICAgIGJhdHRsZXN0cmVuZ2h0LmNsYXNzTGlzdC5hZGQoXCJiYXR0bGVfXCIraSk7XHJcbiAgICAgICAgICAgIGJvYXJkLmFwcGVuZENoaWxkKGJhdHRsZXN0cmVuZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIFxyXG59IiwidHlwZSBSb3RhdGlvbkRpcmVjdGlvbiA9IFwibGVmdFwiIHwgXCJyaWdodFwiO1xyXG50eXBlIE9yaWVudGF0aW9uID0gMCB8IDkwIHwgMTgwIHwgMjcwO1xyXG5cclxuaW50ZXJmYWNlIENhcmQge1xyXG4gIGlkOiBudW1iZXI7XHJcbiAgdHlwZTogc3RyaW5nO1xyXG4gIHR5cGVfYXJnOiBudW1iZXI7XHJcbiAgbG9jYXRpb246IHN0cmluZztcclxuICBsb2NhdGlvbl9hcmc6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIFJvb21DYXJkIGV4dGVuZHMgQ2FyZCB7XHJcbiAgZmlyZV9sZXZlbDogbnVtYmVyO1xyXG4gIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbjtcclxufVxyXG5cclxuY2xhc3MgUm9vbSBpbXBsZW1lbnRzIFJvb21DYXJkIHtcclxuICBpZDogbnVtYmVyO1xyXG4gIHR5cGU6IHN0cmluZztcclxuICB0eXBlX2FyZzogbnVtYmVyO1xyXG4gIGxvY2F0aW9uOiBzdHJpbmc7XHJcbiAgbG9jYXRpb25fYXJnOiBudW1iZXI7XHJcbiAgZmlyZV9sZXZlbDogbnVtYmVyO1xyXG4gIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbjtcclxuXHJcbiAgcHJpdmF0ZSBlbGVtZW50OiBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKGNhcmQ6IFJvb21DYXJkKSB7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIGNhcmQpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIHRoaXMuZWxlbWVudC5pZCA9IFN0cmluZyh0aGlzLmlkKTtcclxuICAgIHRoaXMudXBkYXRlU3R5bGUoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByb3RhdGUoZGlyZWN0aW9uOiBSb3RhdGlvbkRpcmVjdGlvbik6IHZvaWQge1xyXG4gICAgY29uc3Qgb3JpZW50YXRpb25zOiBPcmllbnRhdGlvbltdID0gWzAsIDkwLCAxODAsIDI3MF07XHJcbiAgICBjb25zdCBjdXJyZW50SW5kZXggPSBvcmllbnRhdGlvbnMuaW5kZXhPZih0aGlzLm9yaWVudGF0aW9uKTtcclxuXHJcbiAgICBsZXQgbmV3SW5kZXg7XHJcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcInJpZ2h0XCIpIHtcclxuICAgICAgbmV3SW5kZXggPSAoY3VycmVudEluZGV4ICsgMSkgJSBvcmllbnRhdGlvbnMubGVuZ3RoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmV3SW5kZXggPSAoY3VycmVudEluZGV4IC0gMSArIG9yaWVudGF0aW9ucy5sZW5ndGgpICUgb3JpZW50YXRpb25zLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb25zW25ld0luZGV4XTtcclxuICAgIHRoaXMudXBkYXRlU3R5bGUoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVTdHlsZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tb3JpZW50YXRpb25cIiwgU3RyaW5nKHRoaXMub3JpZW50YXRpb24pKTtcclxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tZmlyZVwiLCBTdHJpbmcodGhpcy5maXJlX2xldmVsKSk7XHJcbiAgfVxyXG59XHJcbiIsInR5cGUgQ2VsbFN0YXRlID0gXCJlbXB0eVwiIHwgXCJmaWxsZWRcIjtcclxuXHJcbmludGVyZmFjZSBQb3NpdGlvbiB7XHJcbiAgeDogbnVtYmVyO1xyXG4gIHk6IG51bWJlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIEdyaWRDZWxsIGV4dGVuZHMgUG9zaXRpb24ge1xyXG4gIHN0YXRlOiBDZWxsU3RhdGU7XHJcbiAgZWxlbWVudDogSFRNTERpdkVsZW1lbnQ7XHJcbn1cclxuXHJcbmNsYXNzIFNoaXAge1xyXG4gIC8vIEtlZXAgYSBNYXAgb2YgYWxsIGNlbGxzIChlbXB0eSBvciBmaWxsZWQpXHJcbiAgcHJpdmF0ZSBjZWxsczogTWFwPHN0cmluZywgR3JpZENlbGw+ID0gbmV3IE1hcCgpO1xyXG5cclxuICAvLyBUcmFjayB0aGUgYm91bmRpbmcgYm94IG9mIGFsbCBjZWxscyAoZW1wdHkgb3IgZmlsbGVkKVxyXG4gIHByaXZhdGUgbWluWCA9IDA7XHJcbiAgcHJpdmF0ZSBtYXhYID0gMDtcclxuICBwcml2YXRlIG1pblkgPSAwO1xyXG4gIHByaXZhdGUgbWF4WSA9IDA7XHJcblxyXG4gIC8vVUkgcGFyYW1ldGVyc1xyXG4gIHByaXZhdGUgZ3JpZENvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XHJcbiAgcHJpdmF0ZSBzY3JvbGxNYXA6IFNjcm9sbG1hcFdpdGhab29tTlMuU2Nyb2xsbWFwV2l0aFpvb207XHJcblxyXG4gIC8vc3RhdGVcclxuICBwcml2YXRlIHBvc2l0aW9uaW5nOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogRGVhZE1lblBheCkge31cclxuXHJcbiAgcHVibGljIGluaXQoKSB7XHJcbiAgICAvL2FkZCB0aGUgd3JhcHBlciBmb3IgdGhlIHNjcm9sbG1hcFxyXG4gICAgbGV0IHRhcmdldERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZV9wbGF5X2FyZWFcIik7XHJcbiAgICBsZXQgc2VhRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGxldCBpZCA9IFwic2VhX3dyYXBwZXJcIjtcclxuICAgIHNlYURpdi5pZCA9IGlkO1xyXG4gICAgdGFyZ2V0RGl2Lmluc2VydEJlZm9yZShzZWFEaXYsIHRhcmdldERpdi5maXJzdENoaWxkKTtcclxuXHJcbiAgICAvL3NldHVwIHRoZSBzY3JvbGxtYXBcclxuICAgIHRoaXMuc2V0dXBTY3JvbGxNYXAoXCJzZWFfd3JhcHBlclwiKTtcclxuXHJcbiAgICAvL3ByZXBhcmUgdGhlIGdyaWQgaW4gdGhlIG92ZXJzdXJmYWNlXHJcblxyXG4gICAgbGV0IG92ZXJzdXJmYWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRGl2RWxlbWVudD4oXHJcbiAgICAgIFwiLnNjcm9sbG1hcF9vbnN1cmZhY2VcIlxyXG4gICAgKTtcclxuICAgIHRoaXMuaW5pdEdyaWQob3ZlcnN1cmZhY2UpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cFNjcm9sbE1hcChzZWFXcmFwcGVyOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc2Nyb2xsTWFwID0gbmV3IGViZy5zY3JvbGxtYXBXaXRoWm9vbSgpO1xyXG4gICAgdGhpcy5zY3JvbGxNYXAuem9vbSA9IDAuODtcclxuXHJcbiAgICAvL2NyZWF0ZSBtYWluIHNjcm9sbG1hcFxyXG4gICAgdGhpcy5zY3JvbGxNYXAuY3JlYXRlQ29tcGxldGVseSgkKHNlYVdyYXBwZXIpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdEdyaWQob3ZlcnN1cmZhY2U6IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcbiAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGNvbnRhaW5lci5pZCA9IFwiZ3JpZF9jb250YWluZXJcIjtcclxuXHJcbiAgICAvLyBKdXN0IHNvbWUgYmFzZSBzdHlsaW5nIGZvciB2aXN1YWxpemF0aW9uLlxyXG4gICAgY29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xyXG4gICAgY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcImdyaWRcIjtcclxuICAgIGNvbnRhaW5lci5zdHlsZS5ib3JkZXIgPSBcIjFweCBzb2xpZCAjMzMzXCI7XHJcbiAgICAvL2FkZCB0aGUgZ3JpZCBjb250YWluZXJcclxuICAgIHRoaXMuZ3JpZENvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuICAgIG92ZXJzdXJmYWNlLmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XHJcblxyXG4gICAgLy9hZGQgdGhlIGZpcnN0IGVtcHR5IGVsZW1lbnQgYXQgMCwwXHJcbiAgICB0aGlzLmNyZWF0ZUNlbGwoMCwgMCk7XHJcbiAgICB0aGlzLnVwZGF0ZUdyaWQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBmaWxsQ2VsbCh4OiBudW1iZXIsIHk6IG51bWJlciwgY2hpbGQ/OiBIVE1MRWxlbWVudCk6IHZvaWQge1xyXG4gICAgaWYgKHkgPCAwKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihgQ2Fubm90IGZpbGwgYSBjZWxsIHdpdGggbmVnYXRpdmUgWTogKHg9JHt4fSwgeT0ke3l9KWApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBrZXkgPSB0aGlzLmNlbGxLZXkoeCwgeSk7XHJcbiAgICBjb25zdCBjZWxsID0gdGhpcy5jZWxscy5nZXQoa2V5KTtcclxuXHJcbiAgICBpZiAoIWNlbGwpIHtcclxuICAgICAgY29uc29sZS53YXJuKGBDYW5ub3QgZmlsbCAoeD0ke3h9LCB5PSR7eX0pIGJlY2F1c2UgaXQgZG9lc24ndCBleGlzdC4gXHJcbiAgICAgICAgICAgICAgICAgICAgIFlvdSBjYW4gb25seSBmaWxsIGNlbGxzIHRoYXQgd2VyZSBwcmV2aW91c2x5IGVtcHR5LmApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoY2VsbC5zdGF0ZSA9PT0gXCJmaWxsZWRcIikge1xyXG4gICAgICBjb25zb2xlLndhcm4oYENlbGwgKHg9JHt4fSwgeT0ke3l9KSBpcyBhbHJlYWR5IGZpbGxlZC5gKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpbGwgdGhlIGNlbGxcclxuICAgIGNlbGwuc3RhdGUgPSBcImZpbGxlZFwiO1xyXG4gICAgY2VsbC5lbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICBpZiAoY2hpbGQpIHtcclxuICAgICAgY2VsbC5lbGVtZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNlbGwuZWxlbWVudC50ZXh0Q29udGVudCA9IGAoJHt4fSwgJHt5fSlgO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSBncmlkID0+IGVuc3VyZXMgdGhlIG5ld2x5IGZpbGxlZCBjZWxsIGhhcyBlbXB0eSBuZWlnaGJvcnNcclxuICAgIHRoaXMudXBkYXRlR3JpZCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJuYWwgaGVscGVyIHRvIGdlbmVyYXRlIGEgc3RhYmxlIHN0cmluZyBrZXkgZm9yIGVhY2ggKHgsIHkpLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2VsbEtleSh4OiBudW1iZXIsIHk6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCR7eH06JHt5fWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIHVuZGVybHlpbmcgRE9NIDxkaXY+IGZvciBhIGNlbGwuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjcmVhdGVDZWxsKFxyXG4gICAgeDogbnVtYmVyLFxyXG4gICAgeTogbnVtYmVyLFxyXG4gICAgc3RhdGU6IENlbGxTdGF0ZSA9IFwiZW1wdHlcIlxyXG4gICk6IEdyaWRDZWxsIHtcclxuICAgIGNvbnN0IGtleSA9IHRoaXMuY2VsbEtleSh4LCB5KTtcclxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBkaXYuaWQgPSBgY2VsbF8ke2tleX1gO1xyXG4gICAgZGl2LnN0eWxlLmJvcmRlciA9IFwiMXB4IHNvbGlkIGJsYWNrXCI7XHJcbiAgICBkaXYuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgZGl2LnN0eWxlLmFsaWduSXRlbXMgPSBcImNlbnRlclwiO1xyXG4gICAgZGl2LnN0eWxlLmp1c3RpZnlDb250ZW50ID0gXCJjZW50ZXJcIjtcclxuXHJcbiAgICAvLyBNaW5pbWFsIHBsYWNlaG9sZGVyczpcclxuICAgIGRpdi5kYXRhc2V0LnggPSB4LnRvU3RyaW5nKCk7XHJcbiAgICBkaXYuZGF0YXNldC55ID0geS50b1N0cmluZygpO1xyXG5cclxuICAgIGNvbnN0IGNlbGw6IEdyaWRDZWxsID0geyB4LCB5LCBzdGF0ZSwgZWxlbWVudDogZGl2IH07XHJcbiAgICB0aGlzLmNlbGxzLnNldChrZXksIGNlbGwpO1xyXG5cclxuICAgIC8vIEFwcGVuZCB0byBjb250YWluZXIgc28gaXQgcGh5c2ljYWxseSBleGlzdHNcclxuICAgIHRoaXMuZ3JpZENvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xyXG5cclxuICAgIHJldHVybiBjZWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVHcmlkKCk6IHZvaWQge1xyXG4gICAgLy8gRm9yIGVhY2ggZmlsbGVkIGNlbGwsIGVuc3VyZSBuZWlnaGJvcnMgZXhpc3QgKHVubGVzcyB5PTAgYmxvY2tzIGJlbG93KS5cclxuICAgIHRoaXMuY2VsbHMuZm9yRWFjaCgoY2VsbCkgPT4ge1xyXG4gICAgICBpZiAoY2VsbC5zdGF0ZSA9PT0gXCJmaWxsZWRcIikge1xyXG4gICAgICAgIHRoaXMuZ3Jvd0Zyb21DZWxsKGNlbGwueCwgY2VsbC55KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gICAgUmVjb21wdXRlIGJvdW5kaW5nIGJveCBmcm9tIGFsbCBleGlzdGluZyBjZWxsc1xyXG4gICAgLy8gICAgKFdlIGRvIHRoaXMgaW4gb25lIHBhc3Mgc28gd2Ugb25seSBleHBhbmQgYXMgbmVlZGVkLilcclxuICAgIHRoaXMucmVjb21wdXRlQm91bmRpbmdCb3goKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgdGhlIENTUyBncmlkIHRvIGNvdmVyIG1pblguLm1heFgsIG1pblkuLm1heFlcclxuICAgIC8vICAgIFRoZSAjIG9mIGNvbHVtbnMvcm93cyBpcyAobWF4LW1pbisxKS5cclxuICAgIGNvbnN0IHRvdGFsQ29scyA9IHRoaXMubWF4WCAtIHRoaXMubWluWCArIDE7XHJcbiAgICBjb25zdCB0b3RhbFJvd3MgPSB0aGlzLm1heFkgLSB0aGlzLm1pblkgKyAxO1xyXG5cclxuICAgIHRoaXMuZ3JpZENvbnRhaW5lci5zdHlsZS5ncmlkVGVtcGxhdGVDb2x1bW5zID0gYHJlcGVhdCgke3RvdGFsQ29sc30sIDUwcHgpYDtcclxuICAgIHRoaXMuZ3JpZENvbnRhaW5lci5zdHlsZS5ncmlkVGVtcGxhdGVSb3dzID0gYHJlcGVhdCgke3RvdGFsUm93c30sIDUwcHgpYDtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiBlYWNoIGNlbGxcclxuICAgIHRoaXMuY2VsbHMuZm9yRWFjaCgoY2VsbCkgPT4ge1xyXG4gICAgICBjb25zdCBjb2xQb3MgPSBjZWxsLnggLSB0aGlzLm1pblggKyAxOyAvLyAxLWJhc2VkIGZyb20gdGhlIGxlZnRcclxuICAgICAgLy8gSW52ZXJ0IFk6IHJvdyAxIGlzIG1heFksIHJvdyB0b3RhbFJvd3MgaXMgbWluWVxyXG4gICAgICBjb25zdCByb3dQb3MgPSB0aGlzLm1heFkgLSBjZWxsLnkgKyAxO1xyXG4gICAgICBjZWxsLmVsZW1lbnQuc3R5bGUuZ3JpZENvbHVtbiA9IFN0cmluZyhjb2xQb3MpO1xyXG4gICAgICBjZWxsLmVsZW1lbnQuc3R5bGUuZ3JpZFJvdyA9IFN0cmluZyhyb3dQb3MpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgZ3Jvd0Zyb21DZWxsKHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAvLyBMZWZ0IG5laWdoYm9yID0+ICh4LTEsIHkpIGlmIG5vdCBwcmVzZW50XHJcbiAgICB0aGlzLmdyb3dJbkRpcmVjdGlvbih4IC0gMSwgeSk7XHJcblxyXG4gICAgLy8gUmlnaHQgbmVpZ2hib3IgPT4gKHgrMSwgeSlcclxuICAgIHRoaXMuZ3Jvd0luRGlyZWN0aW9uKHggKyAxLCB5KTtcclxuXHJcbiAgICAvLyBBYm92ZSA9PiAoeCwgeSsxKVxyXG4gICAgdGhpcy5ncm93SW5EaXJlY3Rpb24oeCwgeSArIDEpO1xyXG5cclxuICAgIC8vIEJlbG93ID0+ICh4LCB5LTEpLCBidXQgb25seSBpZiB5LTEgPj0gMFxyXG4gICAgaWYgKHkgLSAxID49IDApIHtcclxuICAgICAgdGhpcy5ncm93SW5EaXJlY3Rpb24oeCwgeSAtIDEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBncm93SW5EaXJlY3Rpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICh5IDwgMCkgcmV0dXJuOyAvLyBza2lwIGFueSByb3cgYmVsb3cgeT0wXHJcblxyXG4gICAgY29uc3Qga2V5ID0gdGhpcy5jZWxsS2V5KHgsIHkpO1xyXG4gICAgaWYgKCF0aGlzLmNlbGxzLmhhcyhrZXkpKSB7XHJcbiAgICAgIHRoaXMuY3JlYXRlQ2VsbCh4LCB5KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVjb21wdXRlQm91bmRpbmdCb3goKTogdm9pZCB7XHJcbiAgICBsZXQgbWluWCA9IEluZmluaXR5O1xyXG4gICAgbGV0IG1heFggPSAtSW5maW5pdHk7XHJcbiAgICBsZXQgbWluWSA9IEluZmluaXR5O1xyXG4gICAgbGV0IG1heFkgPSAtSW5maW5pdHk7XHJcblxyXG4gICAgdGhpcy5jZWxscy5mb3JFYWNoKChjZWxsKSA9PiB7XHJcbiAgICAgIGlmIChjZWxsLnggPCBtaW5YKSBtaW5YID0gY2VsbC54O1xyXG4gICAgICBpZiAoY2VsbC54ID4gbWF4WCkgbWF4WCA9IGNlbGwueDtcclxuICAgICAgaWYgKGNlbGwueSA8IG1pblkpIG1pblkgPSBjZWxsLnk7XHJcbiAgICAgIGlmIChjZWxsLnkgPiBtYXhZKSBtYXhZID0gY2VsbC55O1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSWYgd2Ugc29tZWhvdyBoYXZlIG5vIGNlbGxzLCBsZWF2ZSBib3VuZGluZyBib3ggYWxvbmVcclxuICAgIGlmICh0aGlzLmNlbGxzLnNpemUgPT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWluWCA9IG1pblg7XHJcbiAgICB0aGlzLm1heFggPSBtYXhYO1xyXG4gICAgdGhpcy5taW5ZID0gTWF0aC5tYXgobWluWSwgMCk7IC8vIGNsYW1wIHRvIDBcclxuICAgIHRoaXMubWF4WSA9IG1heFk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdG9nZ2xlSGlnaGxpZ2h0KFxyXG4gICAgcG9zaXRpb25zOiBQb3NpdGlvbiB8IFBvc2l0aW9uW10sXHJcbiAgICBzdGF0ZTogYm9vbGVhbiB8IG51bGwgPSBudWxsXHJcbiAgKTogdm9pZCB7XHJcbiAgICAvLyBFbnN1cmUgcG9zaXRpb25zIGlzIGFsd2F5cyBhbiBhcnJheVxyXG4gICAgY29uc3QgcG9zaXRpb25zQXJyYXkgPSBBcnJheS5pc0FycmF5KHBvc2l0aW9ucykgPyBwb3NpdGlvbnMgOiBbcG9zaXRpb25zXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IHBvcyBvZiBwb3NpdGlvbnNBcnJheSkge1xyXG4gICAgICAvLyBDcmVhdGUgdGhlIGtleSB0byBjaGVjayBpbiB0aGUgTWFwXHJcbiAgICAgIGNvbnN0IGtleSA9IHRoaXMuY2VsbEtleShwb3MueCwgcG9zLnkpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuY2VsbHMuaGFzKGtleSkpIHtcclxuICAgICAgICBjb25zdCBjZWxsID0gdGhpcy5jZWxscy5nZXQoa2V5KSE7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgY2VsbC5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWdobGlnaHRlZFwiKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgY2VsbC5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWdobGlnaHRlZFwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gVG9nZ2xlIGNsYXNzIGlmIHN0YXRlIGlzIG51bGxcclxuICAgICAgICAgIGNlbGwuZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiaGlnaGxpZ2h0ZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2xlYXJIaWdobGlnaHQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNlbGxzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcclxuICAgICAgbGV0IGNlbGwgPSB0aGlzLmNlbGxzLmdldChrZXkpITtcclxuICAgICAgY2VsbC5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWdobGlnaHRlZFwiKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBvc2l0aW9uaW5nTW9kZShyb29tOiBSb29tQ2FyZCwgcG9zaXRpb25zOiAgIHN0YXRlOiBib29sZWFufG51bGwgPSBudWxsKXtcclxuICAgIGlmIChzdGF0ZSA9IG51bGwpIHtcclxuICAgICAgc3RhdGUgPSAhdGhpcy5wb3NpdGlvbmluZztcclxuICAgIH0gXHJcblxyXG5cclxuXHJcbiAgfVxyXG59XHJcbiJdfQ==