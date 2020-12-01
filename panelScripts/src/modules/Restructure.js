"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restructure = void 0;
class Restructure {
    static sequenceStructure(elementValue) {
        if (!elementValue.elementArray.length) {
            elementValue.filteredId = [];
            return 1;
        }
        if (!elementValue.filteredId.length) {
            Restructure.sortArray(elementValue.elementArray);
            return elementValue.elementArray[elementValue.elementArray.length - 1].sequence + 1;
        }
        elementValue.filteredId.sort();
        const sequence = elementValue.filteredId[0];
        elementValue.filteredId = [];
        return sequence;
    }
    static searchAndModifyControlledArray(layersArray, element) {
        element.filteredId = [];
        if (!element.elementArray.length) {
            return;
        }
        layersArray.forEach(itemLA => {
            let buttonIdIndex = 0;
            let buttonId = element.elementArray.find((itemBA, index) => {
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
    }
    static sortArray(typeArray) {
        typeArray.sort((item1, item2) => {
            if (item1.sequence > item2.sequence) {
                return 1;
            }
            return -1;
        });
    }
}
exports.Restructure = Restructure;
//# sourceMappingURL=Restructure.js.map