"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utilsPhotoshopState_1 = require("../../utils/utilsPhotoshopState");
var menuLabels = require("../../res/menuLables.json");
var AddedPlatformState = /** @class */ (function () {
    function AddedPlatformState() {
    }
    AddedPlatformState.prototype.checkMenuState = function (generator) {
        Object.keys(menuLabels).forEach(function (menu) {
            if (!utilsPhotoshopState_1.UtilsPhotoshopState.isPlatform(menu)) {
                generator.toggleMenu(menuLabels[menu].label, true, false, menuLabels[menu].displayName);
            }
        });
    };
    AddedPlatformState.prototype.onAllPlatformsDeletion = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    };
    AddedPlatformState.prototype.onPlatformAddition = function (menuManager, generator, menuName) {
        this.checkMenuState(generator);
        generator.toggleMenu(menuName, false, false);
    };
    AddedPlatformState.prototype.onViewAddition = function (menuManager, generator, menuName) {
        menuManager.setCurrentState(menuManager.getAddedViewState());
        menuManager.onViewAddition(menuName);
    };
    AddedPlatformState.prototype.onViewDeletion = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getViewDeletionState());
        menuManager.onViewDeletion(menuName);
    };
    return AddedPlatformState;
}());
exports.AddedPlatformState = AddedPlatformState;
//# sourceMappingURL=AddedPlatformState.js.map