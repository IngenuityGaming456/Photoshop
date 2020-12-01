"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLogger = void 0;
const path = require("path");
const constants_1 = require("../constants");
class DocumentLogger {
    execute(params) {
        this.generator = params.generator;
        this.loggerEmitter = params.loggerEmitter;
        this.subscribeListener();
    }
    subscribeListener() {
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.logWarning, loggerType => {
            this.handleDocumentWarning(loggerType);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.getUpdatedValidatorSocket, socket => {
            this.onSocketUpdate(socket);
            this.loggerEmitter.emit(constants_1.photoshopConstants.logger.validatorSocketUpdated);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.logError, (id, key, loggerType) => {
            this.handleDocumentError(id, key, loggerType);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.logStatus, message => {
            this.onStatusMessage(message);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.removeError, id => {
            this.handleErrorRemoval(id);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.activeDocument, docId => {
            this.onActiveDoc(docId);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.destroy, () => this.onDestroy());
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.newDocument, () => this.onNewDocument());
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.currentDocument, () => this.onCurrentDocument());
    }
    onSocketUpdate(socket) {
        this.socket = socket;
    }
    onActiveDoc(docId) {
        this.socket.emit(constants_1.photoshopConstants.logger.activeDocument, docId);
    }
    handleDocumentWarning(loggerType) {
        this.socket.emit(constants_1.photoshopConstants.logger.logWarning, loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Warning",
            text: loggerType
        });
    }
    handleDocumentError(id, key, loggerType) {
        this.socket.emit(constants_1.photoshopConstants.logger.logError, id, key, loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Error",
            text: loggerType
        });
    }
    onStatusMessage(message) {
        this.socket.emit(constants_1.photoshopConstants.logger.logStatus, message);
    }
    handleErrorRemoval(id) {
        this.socket.emit(constants_1.photoshopConstants.logger.removeError, id);
    }
    onDestroy() {
        this.socket.emit(constants_1.photoshopConstants.logger.destroy);
    }
    onCurrentDocument() {
        this.socket.emit(constants_1.photoshopConstants.socket.enablePage);
    }
    onNewDocument() {
        this.socket.emit(constants_1.photoshopConstants.socket.disablePage);
    }
}
exports.DocumentLogger = DocumentLogger;
//# sourceMappingURL=DocumentLogger.js.map