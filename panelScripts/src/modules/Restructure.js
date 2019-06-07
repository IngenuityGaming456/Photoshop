"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Restructure = /** @class */ (function () {
    function Restructure() {
    }
    Restructure.sequenceStructure = function (element, componentsMap) {
        var elementObj = componentsMap.get(element.label);
        if (!elementObj.elementArray.length) {
            elementObj.filteredId = [];
            return 1;
        }
        if (!elementObj.filteredId.length) {
            Restructure.sortArray(elementObj.elementArray);
            return elementObj.elementArray[elementObj.elementArray.length - 1].sequence + 1;
        }
        elementObj.filteredId.sort();
        var sequence = elementObj.filteredId[0];
        elementObj.filteredId = [];
        return sequence;
    };
    Restructure.searchAndModifyControlledArray = function (layersArray, element) {
        element.filteredId = [];
        if (!element.elementArray.length) {
            return;
        }
        layersArray.forEach(function (itemLA) {
            var buttonIdIndex = 0;
            var buttonId = element.elementArray.find(function (itemBA, index) {
                if (itemLA.id === itemBA.id) {
                    buttonIdIndex = index;
                    return true;
                }
                return false;
            });
            if (buttonId) {
                element.filteredId.push(buttonId.sequence);
                element.elementArray.splice(buttonIdIndex, 1);
            }
        });
    };
    Restructure.sortArray = function (typeArray) {
        typeArray.sort(function (item1, item2) {
            if (item1.sequence > item2.sequence) {
                return 1;
            }
            return -1;
        });
    };
    return Restructure;
}());
exports.Restructure = Restructure;
//# sourceMappingURL=Restructure.js.map