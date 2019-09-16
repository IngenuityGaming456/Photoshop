"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DeletedViewState = /** @class */ (function () {
    function DeletedViewState() {
    }
    DeletedViewState.prototype.checkMenuState = function (generator) {
        console.log("The menu seems perfect");
    };
    DeletedViewState.prototype.onAllPlatformsDeletion = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getNoPlatformState());
        menuManager.onAllPlatformsDeletion();
    };
    DeletedViewState.prototype.onPlatformAddition = function (menuManager, menuName) {
        menuManager.setCurrentState(menuManager.getPlatformAdditionState());
        menuManager.onPlatformAddition(menuName);
    };
    DeletedViewState.prototype.onViewDeletion = function (menuManager, generator, menuName) {
        this.checkMenuState(generator);
        generator.toggleMenu(menuName, false, false);
    };
    DeletedViewState.prototype.onViewAddition = function (menuManager, generator, menuName) {
        menuManager.setCurrentState(menuManager.getAddedViewState());
        menuManager.onViewAddition(menuName);
    };
    return DeletedViewState;
}());
exports.DeletedViewState = DeletedViewState;
//# sourceMappingURL=DeletedViewsState.js.map