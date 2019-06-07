import {ISequence} from "../interfaces/IJsxParam";

export class Restructure {

    public static sequenceStructure(element, componentsMap): number {
        let elementObj = componentsMap.get(element.label);
        if(!elementObj.elementArray.length) {
            elementObj.filteredId = [];
            return 1;
        }
        if(!elementObj.filteredId.length) {
            Restructure.sortArray(elementObj.elementArray);
            return elementObj.elementArray[elementObj.elementArray.length-1].sequence + 1;
        }
        elementObj.filteredId.sort();
        const sequence: number = elementObj.filteredId[0];
        elementObj.filteredId = [];
        return sequence;
    }

    public static searchAndModifyControlledArray(layersArray, element) {
        element.filteredId = [];
        if(!element.elementArray.length) {
            return;
        }

        layersArray.forEach(itemLA => {
            let buttonIdIndex = 0;
            let buttonId = element.elementArray.find( (itemBA, index) => {
                if (itemLA.id === itemBA.id) {
                    buttonIdIndex = index;
                    return true;
                }
                return false;
            });
            if(buttonId) {
                element.filteredId.push(buttonId.sequence);
                element.elementArray.splice(buttonIdIndex, 1);
            }
        });
    }

    public static sortArray(typeArray: Array<ISequence>) {
        typeArray.sort((item1, item2) => {
            if(item1.sequence > item2.sequence) {
                return 1;
            }
            return -1;
        })
    }
}