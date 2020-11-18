import {StateContext} from "../context";
import {SelfOtherRenders} from "./SelfOtherRenders";

export class SelfStateContext extends StateContext {

    public constructor() {
        super();
        this.otherRenders = new SelfOtherRenders();
    }

}