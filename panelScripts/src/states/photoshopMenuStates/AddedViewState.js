"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddedViewState = /** @class */ (function () {
    function AddedViewState() {
    }
    AddedViewState.prototype.checkMenuState = function (generator) {
        console.log("The menu state looks perfect, only the view menu needs to be disabled");
    };
    AddedViewState.prototype.onAllPlatformsDeletion = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    };
    AddedViewState.prototype.onPlatformAddition = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    };
    AddedViewState.prototype.onViewAddition = function (menuManager, generator, menuName) {
        this.checkMenuState(generator);
        generator.toggleMenu(menuName, false, false);
    };
    AddedViewState.prototype.onViewDeletion = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getViewDeletionState());
        menuManager.onViewDeletion(menuName);
    };
    return AddedViewState;
}());
exports.AddedViewState = AddedViewState;
//# sourceMappingURL=AddedViewState.js.map