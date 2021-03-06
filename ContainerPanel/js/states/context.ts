import {IJsonStorage, IState} from "../interfaces/interfaces";
import {FirstRender} from "./FirstRender";
import {OtherRenders} from "./OtherRenders";

export class StateContext {
    private readonly firstRender: IState;
    protected otherRenders: IState;
    private currentState: IState;

    public constructor() {
        this.firstRender = new FirstRender();
        this.otherRenders = new OtherRenders();
    }

    public setState(state: IState) {
        this.currentState = state;
    }

    public firstRenderState() {
        return this.firstRender;
    }

    public otherRendersState() {
        return this.otherRenders;
    }

    public fillStorage(checkedBoxes: IJsonStorage) {
        this.currentState.fillStorage(checkedBoxes);
    }

    public isChecked(childLabel, key: string): boolean {
        return this.currentState.isChecked(childLabel, key);
    }

    public isDisabled(childLabel, type?, isContainer?, questElements?) {
        return this.currentState.isDisabled(childLabel, type, isContainer, questElements);
    }

}