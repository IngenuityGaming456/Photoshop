import {IFactory, IParams} from "../interfaces/IJsxParam";
import * as path from "path";
import {photoshopConstants as pc} from "../constants";

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
        this.loggerEmitter.on(pc.logger.logWarning, loggerType => {
            this.handleDocumentWarning(loggerType);
        });
        this.loggerEmitter.on(pc.logger.getUpdatedValidatorSocket, socket => {
            this.onSocketUpdate(socket);
            this.loggerEmitter.emit(pc.logger.validatorSocketUpdated);
        });
        this.loggerEmitter.on(pc.logger.logError, (id, key, loggerType) => {
            this.handleDocumentError(id, key, loggerType);
        });
        this.loggerEmitter.on(pc.logger.logStatus, message => {
            this.onStatusMessage(message);
        });
        this.loggerEmitter.on(pc.logger.removeError, id => {
            this.handleErrorRemoval(id);
        });
        this.loggerEmitter.on(pc.logger.activeDocument, docId => {
            this.onActiveDoc(docId);
        });
        this.loggerEmitter.on(pc.logger.destroy, () => this.onDestroy());
        this.loggerEmitter.on(pc.logger.newDocument, () => this.onNewDocument());
        this.loggerEmitter.on(pc.logger.currentDocument, () => this.onCurrentDocument());
    }

    private onSocketUpdate(socket) {
        this.socket = socket;
    }

    private onActiveDoc(docId) {
        this.socket.emit(pc.logger.activeDocument, docId);
    }

    private handleDocumentWarning(loggerType) {
        this.socket.emit(pc.logger.logWarning, loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Warning",
            text: loggerType
        });
}

    private handleDocumentError(id, key, loggerType) {
        this.socket.emit(pc.logger.logError, id, key, loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Error",
            text: loggerType
        });
    }

    private onStatusMessage(message) {
        this.socket.emit(pc.logger.logStatus, message);
    }

    private handleErrorRemoval(id) {
        this.socket.emit(pc.logger.removeError, id);
    }

    private onDestroy() {
        this.socket.emit(pc.logger.destroy);
    }

    private onCurrentDocument() {
        this.socket.emit(pc.socket.enablePage);
    }

    private onNewDocument() {
        this.socket.emit(pc.socket.disablePage);
    }

}