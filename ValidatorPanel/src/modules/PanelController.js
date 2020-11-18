"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelController = void 0;
const io = require("socket.io-client");
class PanelController {
    constructor(eventsObj, viewObj, modelObj) {
        this.eventsObj = eventsObj;
        this.viewObj = viewObj;
        this.modelObj = modelObj;
        this.instantiateCSInterface();
        this.subscribeListeners();
        this.listenToSocket();
    }
    instantiateCSInterface() {
        this.csInterface = new CSInterface();
    }
    subscribeListeners() {
        this.eventsObj.on("writeData", data => {
            this.modelObj.onWriteData(data);
        });
        this.eventsObj.on("parsedData", data => {
            this.onParsedData(data);
        });
    }
    listenToSocket() {
        const socket = io.connect('http://localhost:8099', { reconnect: true });
        socket.on("connect", () => {
            console.log("a user just connected");
            socket.emit("register", "validatorPanel");
        });
        this.applySocketListeners(socket);
    }
    applySocketListeners(socket) {
        socket.on("logWarning", (logString) => {
            this.onWarning(logString);
        });
        socket.on("logError", (id, key, logString) => {
            this.onError(id, key, logString);
        });
        socket.on("removeError", id => this.onErrorRemoval(id));
        socket.on("logStatus", message => this.onStatusMessage(message));
        socket.on("activeDocument", docId => {
            this.onActiveDoc(docId);
        });
        socket.once("getStorage", docId => {
            this.onGetStorage(docId);
        });
        socket.on("destroy", () => this.onDestroy());
        socket.on("enablePage", () => this.onEnable());
        socket.on("disablePage", () => this.onDisable());
    }
    onGetStorage(docId) {
        this.modelObj.getStorage(docId);
    }
    onParsedData(data) {
        const writeArray = data.writeData;
        writeArray.forEach(item => {
            this.viewObj.onWriteData(item);
        });
    }
    onActiveDoc(docId) {
        this.modelObj.onActiveDoc(docId);
    }
    onWarning(logString) {
        this.viewObj.onWarning(logString);
    }
    onErrorRemoval(id) {
        this.viewObj.handleErrorRemoval(id);
    }
    onError(id, key, logString) {
        this.viewObj.onError(id, key, logString);
    }
    onStatusMessage(message) {
        this.viewObj.onStatusMessage(message);
    }
    onDestroy() {
        this.csInterface.closeExtension();
    }
    onEnable() {
        this.viewObj.enablePage();
    }
    onDisable() {
        this.viewObj.disablePage();
    }
}
exports.PanelController = PanelController;
//# sourceMappingURL=PanelController.js.map