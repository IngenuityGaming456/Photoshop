export interface IState {
    checkedBoxes: IJsonStorage;
    isChecked(childLabel, key: string): boolean;
    isDisabled(childInput, type?, isContainer?): boolean;
    fillStorage(checkedBoxes: IJsonStorage):void;
}

export interface IJsonStorage {
    [checkedBoxes: string]: Array<string>
}