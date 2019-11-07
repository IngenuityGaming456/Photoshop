import {IJsonStorage, IState} from "../interfaces/interfaces";

export class FirstRender implements IState {

    public checkedBoxes: IJsonStorage;

    public isChecked(key:string): boolean {
        return false;
    }

    public isDisabled(childInput, type) {
        if(type) {
            return !type;
        }
        return true;
    }

    public fillStorage(checkedBoxes: IJsonStorage): void {
        this.checkedBoxes = checkedBoxes;
    }

}