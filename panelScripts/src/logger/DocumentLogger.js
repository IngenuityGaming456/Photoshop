"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLogger = void 0;
var path = require("path");
var constants_1 = require("../constants");
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
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.logWarning, function (loggerType) {
            _this.handleDocumentWarning(loggerType);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.getUpdatedValidatorSocket, function (socket) {
            _this.onSocketUpdate(socket);
            _this.loggerEmitter.emit(constants_1.photoshopConstants.logger.validatorSocketUpdated);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.logError, function (id, key, loggerType) {
            _this.handleDocumentError(id, key, loggerType);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.logStatus, function (message) {
            _this.onStatusMessage(message);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.removeError, function (id) {
            _this.handleErrorRemoval(id);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.activeDocument, function (docId) {
            _this.onActiveDoc(docId);
        });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.destroy, function () { return _this.onDestroy(); });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.newDocument, function () { return _this.onNewDocument(); });
        this.loggerEmitter.on(constants_1.photoshopConstants.logger.currentDocument, function () { return _this.onCurrentDocument(); });
    };
    DocumentLogger.prototype.onSocketUpdate = function (socket) {
        this.socket = socket;
    };
    DocumentLogger.prototype.onActiveDoc = function (docId) {
        this.socket.emit(constants_1.photoshopConstants.logger.activeDocument, docId);
    };
    DocumentLogger.prototype.handleDocumentWarning = function (loggerType) {
        this.socket.emit(constants_1.photoshopConstants.logger.logWarning, loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Warning",
            text: loggerType
        });
    };
    DocumentLogger.prototype.handleDocumentError = function (id, key, loggerType) {
        this.socket.emit(constants_1.photoshopConstants.logger.logError, id, key, loggerType);
        this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
            panelName: "Error",
            text: loggerType
        });
    };
    DocumentLogger.prototype.onStatusMessage = function (message) {
        this.socket.emit(constants_1.photoshopConstants.logger.logStatus, message);
    };
    DocumentLogger.prototype.handleErrorRemoval = function (id) {
        this.socket.emit(constants_1.photoshopConstants.logger.removeError, id);
    };
    DocumentLogger.prototype.onDestroy = function () {
        this.socket.emit(constants_1.photoshopConstants.logger.destroy);
    };
    DocumentLogger.prototype.onCurrentDocument = function () {
        this.socket.emit(constants_1.photoshopConstants.socket.enablePage);
    };
    DocumentLogger.prototype.onNewDocument = function () {
        this.socket.emit(constants_1.photoshopConstants.socket.disablePage);
    };
    return DocumentLogger;
}());
exports.DocumentLogger = DocumentLogger;
//# sourceMappingURL=DocumentLogger.js.map