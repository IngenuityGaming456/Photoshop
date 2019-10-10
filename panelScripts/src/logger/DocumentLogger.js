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
        this.loggerEmitter.on("logWarning", function (key, id, loggerType) {
            _this.handleDocumentWarning(key, id, loggerType);
        });
        this.loggerEmitter.on("getUpdatedValidatorSocket", function (socket) {
            _this.onSocketUpdate(socket);
            _this.loggerEmitter.emit("validatorSocketUpdated");
        });
        this.loggerEmitter.on("logError", function (key, id, loggerType) {
            _this.handleDocumentError(key, id, loggerType);
        });
        this.loggerEmitter.on("logStatus", function (message) {
            _this.onStatusMessage(message);
        });
        this.loggerEmitter.on("removeError", function (id) {
            _this.handleErrorRemoval(id);
        });
    };
    DocumentLogger.prototype.onSocketUpdate = function (socket) {
        this.socket = socket;
    };
    DocumentLogger.prototype.handleDocumentWarning = function (key, id, loggerType) {
        this.socket.emit(loggerType, key, id);
    };
    DocumentLogger.prototype.handleDocumentError = function (key, id, loggerType) {
        this.socket.emit(loggerType, key, id);
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