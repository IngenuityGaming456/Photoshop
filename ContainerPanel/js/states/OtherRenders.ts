import {IJsonStorage, IState} from "../interfaces/interfaces";
import {utils} from "../utils/utils";

export class OtherRenders implements IState {

    public checkedBoxes;

    public fillStorage(data: IJsonStorage) {
        this.checkedBoxes = data;
    }

    public isChecked(ref, key): boolean {
        const data = utils.getData(ref);
        if(!data.view) {
            key = null;
        } else if(!key.length) {
            key = utils.getLISpan(utils.getParentLI(ref)).childNodes[0].nodeValue;
        }
        return this.checkedBoxes.checkedBoxes.some(item => {
            if(data.platform === item.platform && data.view === item.view) {
                if(key === item.key || (item.key && ~item.key.search(key))) {
                    return true;
                }
            }
        });
    }

    public isDisabled(childInput, type?, isContainer?) {
        if(childInput.checked) {
            return true;
        }
        if(type) {
            return !type;
        }
        if(isContainer && !utils.isInContainerOrElement(utils.getParentLI(childInput))) {
            return !this.isPlatformChecked(childInput);
        }
        if(utils.isInContainerOrElement(utils.getParentLI(childInput))) {
            return !this.isChecked(utils.getParentLI(utils.getParentLI(childInput)), utils.getView(childInput));
        }
        return !this.isViewChecked(childInput);
    }

    public isPlatformChecked(childInput) {
        return utils.getPlatformInput(childInput).checked;
    }

    public isViewChecked(childInput) {
        return utils.getViewInput(childInput).checked;
    }

}