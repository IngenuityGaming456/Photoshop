import {PanelViewApp} from "./PanelViewApp";
import {EventEmitter} from "events";

export class SelfPanelView extends PanelViewApp{

    public constructor(eventsObj: EventEmitter) {
        super(eventsObj);
        this.createRefreshButton();
    }

    private createRefreshButton() {
        const refreshButton = this.createButton("refreshClick", "Refresh", "refresh");
        console.log("pass");
    }

}