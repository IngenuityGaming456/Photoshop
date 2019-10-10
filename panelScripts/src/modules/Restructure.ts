import {ISequence} from "../interfaces/IJsxParam";

export class Restructure {

    public static sequenceStructure(elementValue): number {
        
        if(!elementValue.elementArray.length) {
            elementValue.filteredId = [];
            return 1;
        }
        if(!elementValue.filteredId.length) {
            Restructure.sortArray(elementValue.elementArray);
            return elementValue.elementArray[elementValue.elementArray.length-1].sequence + 1;
        }
        elementValue.filteredId.sort();
        const sequence: number = elementValue.filteredId[0];
        elementValue.filteredId = [];
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