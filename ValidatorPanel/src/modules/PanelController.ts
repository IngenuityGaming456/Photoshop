import * as EventEmitter from "events";
import {PanelModel} from "./PanelModel";
import {PanelView} from "./PanelView";
import * as io from "socket.io-client";

export class PanelController {
    private eventsObj: EventEmitter;
    private viewObj: PanelView;
    private modelObj: PanelModel;
    private csInterface;

    public constructor(eventsObj: EventEmitter, viewObj: PanelView, modelObj: PanelModel) {
        this.eventsObj = eventsObj;
        this.viewObj = viewObj;
        this.modelObj = modelObj;
        this.instantiateCSInterface();
        this.subscribeListeners();
        this.listenToSocket();
    }

    private instantiateCSInterface() {
        this.csInterface = new CSInterface();
    }
    private subscribeListeners() {
        this.eventsObj.on("writeData", data => {
            this.modelObj.onWriteData(data);
        });
        this.eventsObj.on("parsedData", data => {
            this.onParsedData(data);
        });
    }

    private listenToSocket() {
        const socket = io.connect('http://localhost:8099', {reconnect:true});
        socket.on("connect", () => {
            console.log("a user just connected");
            socket.emit("register", "validatorPanel");
        });
        this.applySocketListeners(socket);
    }

    private applySocketListeners(socket) {
        socket.on("logWarning", (logString) => {
            this.onWarning(logString);
        });
        socket.on("logError", (id, key, logString) => {
            this.onError(id, key, logString);
        });
        socket.on("removeError", id => this.onErrorRemoval(id));
        socket.on("logStatus", message => this.onStatusMessage(message));
        socket.on("activeDocument",  docId => {
            this.onActiveDoc(docId);
        });
        socket.once("getStorage", docId => {
            this.onGetStorage(docId);
        });
        socket.on("destroy", () => this.onDestroy());
        socket.on("enablePage", () => this.onEnable());
        socket.on("disablePage", () => this.onDisable());
    }

    private onGetStorage(docId) {
        this.modelObj.getStorage(docId);
    }

    private onParsedData(data) {
        const writeArray = data.writeData;
        writeArray.forEach(item => {
            this.viewObj.onWriteData(item);
        });
    }

    private onActiveDoc(docId) {
        this.modelObj.onActiveDoc(docId);
    }

    private onWarning(logString) {
        this.viewObj.onWarning(logString);
    }

    private onErrorRemoval(id) {
        this.viewObj.handleErrorRemoval(id);
    }

    private onError(id, key, logString) {
        this.viewObj.onError(id, key, logString);
    }

    private onStatusMessage(message) {
        this.viewObj.onStatusMessage(message);
    }

    private onDestroy() {
        this.csInterface.closeExtension();
    }

    private onEnable() {
        this.viewObj.enablePage();
    }

    private onDisable() {
        this.viewObj.disablePage();
    }

}