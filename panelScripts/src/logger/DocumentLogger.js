"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DocumentLogger = /** @class */ (function () {
    function DocumentLogger() {
    }
    DocumentLogger.prototype.execute = function (params) {
        this.generator = params.generator;
        this.loggerEmitter = params.loggerEmitter;
        this.subscribeListener();
    };
    DocumentLogger.prototype.subscribeListener = function () {
        var _this = this;
        this.loggerEmitter.on("logWarning", function (loggerType) {
            _this.handleDocumentWarning(loggerType);
        });
        this.loggerEmitter.on("getUpdatedValidatorSocket", function (socket) {
            _this.onSocketUpdate(socket);
            _this.loggerEmitter.emit("validatorSocketUpdated");
        });
        this.loggerEmitter.on("logError", function (id, key, loggerType) {
            _this.handleDocumentError(id, key, loggerType);
        });
        this.loggerEmitter.on("logStatus", function (message) {
            _this.onStatusMessage(message);
        });
        this.loggerEmitter.on("removeError", function (id) {
            _this.handleErrorRemoval(id);
        });
        this.loggerEmitter.on("activeDocument", function (docId) {
            _this.onActiveDoc(docId);
        });
    };
    DocumentLogger.prototype.onSocketUpdate = function (socket) {
        this.socket = socket;
    };
    DocumentLogger.prototype.onActiveDoc = function (docId) {
        this.socket.emit("activeDocument", docId);
    };
    DocumentLogger.prototype.handleDocumentWarning = function (loggerType) {
        this.socket.emit("logWarning", loggerType);
    };
    DocumentLogger.prototype.handleDocumentError = function (id, key, loggerType) {
        this.socket.emit("logError", id, key, loggerType);
    };
    DocumentLogger.prototype.onStatusMessage = function (message) {
        this.socket.emit("logStatus", message);
    };
    DocumentLogger.prototype.handleErrorRemoval = function (id) {
        this.socket.emit("removeError", id);
    };
    return DocumentLogger;
}());
exports.DocumentLogger = DocumentLogger;
//# sourceMappingURL=DocumentLogger.js.map