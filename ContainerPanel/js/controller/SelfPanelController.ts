import {PanelControllerApp} from "./PanelControllerApp";
import {StateContext} from "../states/context";
import {EventEmitter} from "events";
import {SelfPanelView} from "../view/SelfPanelView";
import {SelfPanelModel} from "../model/SelfPanelModel";


export class SelfPanelController extends PanelControllerApp {

    public constructor(eventsObj: EventEmitter, viewObj: SelfPanelView, modelObj: SelfPanelModel, stateContext: StateContext) {
        super(eventsObj, viewObj, modelObj as SelfPanelModel, stateContext)
    }

    protected subscribeListeners() {
        super.subscribeListeners();
        this.eventsObj.on("refreshClick", () => this.refresh())
    }

    private refresh() {
        this.socket.on("updatedDocument", (activeDocument) => this.activeDocumentRecieved(activeDocument));
        this.socket.emit("getUpdatedDocument");
    }

    private activeDocumentRecieved(activeDocument) {
        (this.model as SelfPanelModel).selfFillStorage(activeDocument)
    }

    protected listenToConnection() {
        super.listenToConnection();
        this.socket.removeAllListeners("docOpen");
    }

}