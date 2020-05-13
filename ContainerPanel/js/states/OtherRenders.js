"use strict";
exports.__esModule = true;
var utils_1 = require("../utils/utils");
var OtherRenders = /** @class */ (function () {
    function OtherRenders() {
    }
    OtherRenders.prototype.fillStorage = function (data) {
        this.checkedBoxes = data;
    };
    OtherRenders.prototype.isChecked = function (ref, key) {
        var data = utils_1.utils.getData(ref);
        if (!data.view) {
            key = null;
        }
        else if (!key.length) {
            key = utils_1.utils.getLISpan(utils_1.utils.getParentLI(ref)).childNodes[0].nodeValue;
        }
        return this.checkedBoxes.checkedBoxes.some(function (item) {
            if (data.platform === item.platform && data.view === item.view && key === item.key) {
                return true;
            }
        });
    };
    OtherRenders.prototype.isDisabled = function (childInput, type, isContainer) {
        if (childInput.checked) {
            return true;
        }
        if (type) {
            return !type;
        }
        if (isContainer && !utils_1.utils.isInContainerOrElement(utils_1.utils.getParentLI(childInput))) {
            return !this.isPlatformChecked(childInput);
        }
        if (utils_1.utils.isInContainerOrElement(utils_1.utils.getParentLI(childInput))) {
            return !this.isChecked(utils_1.utils.getParentLI(utils_1.utils.getParentLI(childInput)), utils_1.utils.getView(childInput));
        }
        return !this.isViewChecked(childInput);
    };
    OtherRenders.prototype.isPlatformChecked = function (childInput) {
        return utils_1.utils.getPlatformInput(childInput).checked;
    };
    OtherRenders.prototype.isViewChecked = function (childInput) {
        return utils_1.utils.getViewInput(childInput).checked;
    };
    return OtherRenders;
}());
exports.OtherRenders = OtherRenders;
