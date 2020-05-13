"use strict";
exports.__esModule = true;
var FirstRender = /** @class */ (function () {
    function FirstRender() {
    }
    FirstRender.prototype.isChecked = function (key) {
        return false;
    };
    FirstRender.prototype.isDisabled = function (childInput, type) {
        if (type) {
            return !type;
        }
        return true;
    };
    FirstRender.prototype.fillStorage = function (checkedBoxes) {
        this.checkedBoxes = checkedBoxes;
    };
    return FirstRender;
}());
exports.FirstRender = FirstRender;
