"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utilsPhotoshopState_1 = require("../../utils/utilsPhotoshopState");
var menuLabel = require("../../res/menuLables.json");
var NoPlatformState = /** @class */ (function () {
    function NoPlatformState() {
    }
    NoPlatformState.prototype.checkMenuState = function (generator) {
        Object.keys(menuLabel).forEach(function (menu) {
            if (!utilsPhotoshopState_1.UtilsPhotoshopState.isPlatform(menuLabel[menu].displayName)) {
                generator.toggleMenu(menuLabel[menu].label, false, false, menuLabel[menu].displayName);
            }
        });
    };
    NoPlatformState.prototype.onAllPlatformsDeletion = function (menuManager, generator) {
        this.checkMenuState(generator);
    };
    NoPlatformState.prototype.onPlatformAddition = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    };
    NoPlatformState.prototype.onViewAddition = function (menuManager, generator, menuName) {
    };
    NoPlatformState.prototype.onViewDeletion = function (menuManager, menuName) {
    };
    return NoPlatformState;
}());
exports.NoPlatformState = NoPlatformState;
//# sourceMappingURL=NoPlatformState.js.map