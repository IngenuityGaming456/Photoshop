import {IFactory, IParams} from "../interfaces/IJsxParam";

export class DocumentLogger implements IFactory {
    private generator;
    private socket;

    public execute(params: IParams) {
        this.generator = params.generator;
        this.subscribeListener();
    }

    private subscribeListener() {
        this.generator.on("logWarning", (key, id, loggerType) => {
            this.handleDocumentWarning(key, id, loggerType);
        });
        this.generator.on("getUpdatedSocket", socket => {
            this.onSocketUpdate(socket);
        });
        this.generator.on("logError", (key, id, loggerType) => {
            this.handleDocumentError(key, id, loggerType);
        });
    }

    private onSocketUpdate(socket) {
        this.socket = socket
    }

    private handleDocumentWarning(key, id, loggerType) {
        this.socket.emit(loggerType, key, id);
    }

    private handleDocumentError(key, id, loggerType) {
        this.socket.emit(loggerType, key, id);
    }

    private handleErrorRemoval(id) {
        this.socket.emit("removeError", id);
    }

}