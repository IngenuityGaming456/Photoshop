"use strict";
exports.__esModule = true;
var FirstRender_1 = require("./FirstRender");
var OtherRenders_1 = require("./OtherRenders");
var StateContext = /** @class */ (function () {
    function StateContext() {
        this.firstRender = new FirstRender_1.FirstRender();
        this.otherRenders = new OtherRenders_1.OtherRenders();
    }
    StateContext.prototype.setState = function (state) {
        this.currentState = state;
    };
    StateContext.prototype.firstRenderState = function () {
        return this.firstRender;
    };
    StateContext.prototype.otherRendersState = function () {
        return this.otherRenders;
    };
    StateContext.prototype.fillStorage = function (checkedBoxes) {
        this.currentState.fillStorage(checkedBoxes);
    };
    StateContext.prototype.isChecked = function (childLabel, key) {
        return this.currentState.isChecked(childLabel, key);
    };
    StateContext.prototype.isDisabled = function (childLabel, type, isContainer) {
        return this.currentState.isDisabled(childLabel, type, isContainer);
    };
    return StateContext;
}());
exports.StateContext = StateContext;
