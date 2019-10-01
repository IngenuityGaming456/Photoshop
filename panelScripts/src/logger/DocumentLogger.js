"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DocumentLogger = /** @class */ (function () {
    function DocumentLogger() {
    }
    DocumentLogger.prototype.execute = function (params) {
        this.generator = params.generator;
        this.subscribeListener();
    };
    DocumentLogger.prototype.subscribeListener = function () {
        var _this = this;
        this.generator.on("logWarning", function (key, id, loggerType) {
            _this.handleDocumentWarning(key, id, loggerType);
        });
        this.generator.on("getUpdatedSocket", function (socket) {
            _this.onSocketUpdate(socket);
        });
        this.generator.on("logError", function (key, id, loggerType) {
            _this.handleDocumentError(key, id, loggerType);
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
    DocumentLogger.prototype.handleErrorRemoval = function (id) {
        this.socket.emit("removeError", id);
    };
    return DocumentLogger;
}());
exports.DocumentLogger = DocumentLogger;
//# sourceMappingURL=DocumentLogger.js.map