import {IFactory, IParams} from "../interfaces/IJsxParam";

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
        this.loggerEmitter.on("logWarning", (key, id, loggerType) => {
            this.handleDocumentWarning(key, id, loggerType);
        });
        this.loggerEmitter.on("getUpdatedValidatorSocket", socket => {
            this.onSocketUpdate(socket);
            this.loggerEmitter.emit("validatorSocketUpdated");
        });
        this.loggerEmitter.on("logError", (key, id, loggerType) => {
            this.handleDocumentError(key, id, loggerType);
        });
        this.loggerEmitter.on("logStatus", message => {
            this.onStatusMessage(message);
        });
        this.loggerEmitter.on("removeError", id => {
            this.handleErrorRemoval(id);
        });
    }

    private onSocketUpdate(socket) {
        this.socket = socket;
    }

    private handleDocumentWarning(key, id, loggerType) {
        this.socket.emit(loggerType, key, id);
    }

    private handleDocumentError(key, id, loggerType) {
        this.socket.emit(loggerType, key, id);
    }

    private onStatusMessage(message) {
        this.socket.emit("logStatus", message);
    }

    private handleErrorRemoval(id) {
        this.socket.emit("removeError", id);
    }

}