import {PanelControllerApp} from "./PanelControllerApp";
import {StateContext} from "../states/context";
import {EventEmitter} from "events";
import {SelfPanelView} from "../view/SelfPanelView";
import {SelfPanelModel} from "../model/SelfPanelModel";
import {utils} from "../utils/utils";
import {MappingView} from "../view/MappingView";
import * as io from "socket.io-client";


export class SelfPanelController extends PanelControllerApp {

    protected model: SelfPanelModel;
    protected view: SelfPanelView;

    public constructor(eventsObj: EventEmitter, viewObj: SelfPanelView, mappingView: MappingView, modelObj: SelfPanelModel, stateContext: StateContext) {
        super(eventsObj, viewObj, mappingView, modelObj, stateContext)
    }

    protected subscribeListeners() {
        super.subscribeListeners();
        this.eventsObj.on("refreshClick", () => this.refresh());
        this.eventsObj.on("refreshResponse", (response) => this.sendResponse(response));
    }

    private refresh() {
        this.socket.once("updatedDocument", (activeDocument) => this.activeDocumentRecieved(activeDocument));
        this.socket.emit("getUpdatedDocument");
    }

    private activeDocumentRecieved(activeDocument) {
        (this.model as SelfPanelModel).selfFillStorage(activeDocument)
    }

    protected listenToConnection() {
        this.socket = io.connect('http://localhost:8099', {reconnect:true});
        this.socket.on("connect", () => {
            console.log("a user just connected");
            this.socket.emit("register", "SelfHtmlPanel");
        });
        this.socket.on("questItems", (questItems) => {
            this.model.storeQuestItems(questItems);
            this.view.storeQuestItems(questItems);
        });
    }

    protected sendStorage(storage: Array<Object>) {
        (this.view as SelfPanelView).destroyDiv();
        this.view.onStorageFull(storage, this.stateContext, "Self Made Strutures");
        this.processRefreshSubmission();
    }

    private processRefreshSubmission() {
        const checkedBoxes = [];
        const responseArray = [];
        this.makeSubmission(checkedBoxes, responseArray);
        (this.model as SelfPanelModel).processRefreshResponse(responseArray);
        (this.model as SelfPanelModel).processRefreshResponse(responseArray);
    }

    private sendResponse(responseMap) {
        this.socket.emit("getRefreshResponse", utils.mapToObject(responseMap));
    }

}