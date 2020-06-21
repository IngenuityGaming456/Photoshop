import {PanelViewApp} from "./PanelViewApp";
import {EventEmitter} from "events";

export class SelfPanelView extends PanelViewApp{

    public constructor(eventsObj: EventEmitter) {
        super(eventsObj);
        this.createRefreshButton()
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

}