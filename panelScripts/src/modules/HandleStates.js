"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var HandleStates = /** @class */ (function () {
    function HandleStates() {
        this.clickedMenus = [];
    }
    HandleStates.prototype.execute = function (params) {
    };
    HandleStates.prototype.setLocalStorage = function (storage) {
        fs.writeFile("D:/clickedMenus.json", JSON.stringify(storage), function (err) {
            if (err) {
                console.log("unable to write file");
            }
        });
    };
    HandleStates.prototype.handleChanges = function (responseMap, viewsMap) {
        try {
            var data = fs.readFileSync("D:/clickedMenus.json", { encoding: "utf8" });
            this.getChanges(new Map(JSON.parse(data)), responseMap, viewsMap);
        }
        catch (err) {
            console.log("There is no previous response");
        }
    };
    HandleStates.prototype.getChanges = function (previousResponseMap, responseMap, viewsMap) {
        var _this = this;
        this.clickedMenus.forEach(function (item) {
            var viewObj = viewsMap.get(item);
            var viewKeys = Object.keys(viewObj);
            _this.handleViewKeys(viewKeys, previousResponseMap, responseMap);
        });
    };
    HandleStates.prototype.handleViewKeys = function (viewKeys, previousResponseMap, responseMap) {
        var _this = this;
        viewKeys.forEach(function (item) {
            _this.sendJsonChanges(previousResponseMap.get(item), responseMap.get(item));
        });
    };
    HandleStates.prototype.sendJsonChanges = function (previousJson, currentJson) {
        var previousBaseChild = previousJson[Object.keys(previousJson)[0]];
        var currentBaseChild = currentJson[Object.keys(currentJson)[0]];
        for (var key in currentBaseChild) {
            if (currentBaseChild.hasOwnProperty(key)) {
                if (!previousBaseChild[key]) {
                    this.sendAdditionRequest(Object.keys(previousJson)[0], currentBaseChild[key]);
                }
            }
        }
        for (var key in previousBaseChild) {
            if (previousBaseChild.hasOwnProperty(key)) {
                if (!currentBaseChild[key]) {
                    this.sendDeletionRequest(Object.keys(previousJson)[0], previousBaseChild[key]);
                }
            }
        }
    };
    HandleStates.prototype.sendAdditionRequest = function (baseKey, currentObj) {
        console.log(baseKey, currentObj);
    };
    HandleStates.prototype.sendDeletionRequest = function (baseKey, previousObj) {
        console.log(baseKey, previousObj);
    };
    Object.defineProperty(HandleStates.prototype, "menuClicked", {
        set: function (pressedMenu) {
            this.clickedMenus.push(pressedMenu);
        },
        enumerable: true,
        configurable: true
    });
    return HandleStates;
}());
exports.HandleStates = HandleStates;
//# sourceMappingURL=HandleStates.js.map