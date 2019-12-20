import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as path from "path";

export class DocumentLogger implements IFactory {
    private generator;
    private socket;
    private loggerEmitter;

    public execute(params: IParams) {
        this.generator = params.generator;
        this.loggerEmitter = params.loggerEmitter;
        this.subscribeListener();
    }

    private subscribeListener() {
        this.loggerEmitter.on("logWarning", loggerType => {
            this.handleDocumentWarning(loggerType);
        });
        this.loggerEmitter.on("getUpdatedValidatorSocket", socket => {
            this.onSocketUpdate(socket);
            this.loggerEmitter.emit("validatorSocketUpdated");
        });
        this.loggerEmitter.on("logError", (id, key, loggerType) => {
            this.handleDocumentError(id, key, loggerType);
        });
        this.loggerEmitter.on("logStatus", message => {
            this.onStatusMessage(message);
        });
        this.loggerEmitter.on("removeError", id => {
            this.handleErrorRemoval(id);
        });
        this.loggerEmitter.on("activeDocument", docId => {
            this.onActiveDoc(docId);
        });
        this.loggerEmitter.on("destroy", () => this.onDestroy());
        this.loggerEmitter.on("newDocument", () => this.onNewDocument());
        this.loggerEmitter.on("currentDocument", () => this.onCurrentDocument());
    }

    private onSocketUpdate(socket) {
        this.socket = socket;
    }

    private onActiveDoc(docId) {
        this.socket.emit("activeDocument", docId);
    }

    private handleDocumentWarning(loggerType) {
        this.socket.emit("logWarning", loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Warning",
            text: loggerType
        });
}

    private handleDocumentError(id, key, loggerType) {
        this.socket.emit("logError", id, key, loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Error",
            text: loggerType
        });
    }

    private onStatusMessage(message) {
        this.socket.emit("logStatus", message);
    }

    private handleErrorRemoval(id) {
        this.socket.emit("removeError", id);
    }

    private onDestroy() {
        this.socket.emit("destroy");
    }

    private onCurrentDocument() {
        this.socket.emit("enablePage");
    }

    private onNewDocument() {
        this.socket.emit("disablePage");
    }

}