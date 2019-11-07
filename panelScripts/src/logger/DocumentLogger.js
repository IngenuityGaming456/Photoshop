"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
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
        this.loggerEmitter.on("destroy", function () { return _this.onDestroy(); });
        this.loggerEmitter.on("newDocument", function () { return _this.onNewDocument(); });
        this.loggerEmitter.on("currentDocument", function () { return _this.onCurrentDocument(); });
    };
    DocumentLogger.prototype.onSocketUpdate = function (socket) {
        this.socket = socket;
    };
    DocumentLogger.prototype.onActiveDoc = function (docId) {
        this.socket.emit("activeDocument", docId);
    };
    DocumentLogger.prototype.handleDocumentWarning = function (loggerType) {
        this.socket.emit("logWarning", loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Warning",
            text: loggerType
        });
    };
    DocumentLogger.prototype.handleDocumentError = function (id, key, loggerType) {
        this.socket.emit("logError", id, key, loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Error",
            text: loggerType
        });
    };
    DocumentLogger.prototype.onStatusMessage = function (message) {
        this.socket.emit("logStatus", message);
    };
    DocumentLogger.prototype.handleErrorRemoval = function (id) {
        this.socket.emit("removeError", id);
    };
    DocumentLogger.prototype.onDestroy = function () {
        this.socket.emit("destroy");
    };
    DocumentLogger.prototype.onCurrentDocument = function () {
        this.socket.emit("enablePage");
    };
    DocumentLogger.prototype.onNewDocument = function () {
        this.socket.emit("disablePage");
    };
    return DocumentLogger;
}());
exports.DocumentLogger = DocumentLogger;
//# sourceMappingURL=DocumentLogger.js.map