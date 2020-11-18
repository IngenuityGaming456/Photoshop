import {OtherRenders} from "../OtherRenders";
import {utils} from "../../utils/utils";

export class SelfOtherRenders extends OtherRenders {
    public isDisabled(childInput, type?, isContainer?, questElements?): boolean {
        if(childInput.checked) {
            return true;
        }
        const key = utils.getLISpan(utils.getParentLI(childInput)).childNodes[0].nodeValue;
        const splicedKey = utils.spliceKeyType(key);
        if(questElements && ~questElements.indexOf(splicedKey) && !childInput.checked) {
            return true;
        }
        const liInput = utils.getLIInput(utils.getParentLI(utils.getParentLI(childInput)));
        if(liInput) {
            return !(liInput as HTMLInputElement).checked;
        }
        return false;
    }
}