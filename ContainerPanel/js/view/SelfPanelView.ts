import {PanelViewApp} from "./PanelViewApp";
import {EventEmitter} from "events";

export class SelfPanelView extends PanelViewApp{

    private questItems;

    public constructor(eventsObj: EventEmitter) {
        super(eventsObj);
        this.createRefreshButton()
    }

    public storeQuestItems(questItems) {
        this.questItems = questItems;
        this.questItems.push("desktop", "landscape", "portrait");
    }

    private createRefreshButton() {
        const refreshButton = this.createButton("refreshClick", "Refresh", "refresh", document.body);
        console.log("pass");
    }

    public destroyDiv() {
        const nodes = Array.from(document.querySelectorAll(".base"));
        if(nodes.length === 2) {
            document.body.removeChild(nodes[1]);
        }
    }

    protected checkAndDisable(input, key, type?, isContainer?) {
        input.checked = this.stateContext.isChecked(input, key);
        input.disabled = this.stateContext.isDisabled(input, type, isContainer, this.questItems);
    }

}