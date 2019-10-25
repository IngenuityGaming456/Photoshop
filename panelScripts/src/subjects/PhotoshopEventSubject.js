"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var fsExtra = require("fs-extra/lib/empty/index.js");
var packageJson = require("../../package.json");
var PhotoshopEventSubject = /** @class */ (function () {
    function PhotoshopEventSubject() {
        this.observerList = [];
    }
    PhotoshopEventSubject.prototype.execute = function (params) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.docId = params.storage.docId;
        this.activeId = this.activeDocument.id;
        this.subscribeListeners();
    };
    PhotoshopEventSubject.prototype.subscribeListeners = function () {
        var _this = this;
        this.docEmitter.on("observerAdd", function (observer) { return _this.add(observer); });
        this.docEmitter.on("observerRemove", function (observer) { return _this.remove(observer); });
        this.generator.on("save", function () { return _this.onPhotoshopClose(); });
        this.generator.on("closedDocument", function (closeId) { return _this.onDocumentClose(closeId); });
    };
    PhotoshopEventSubject.prototype.onDocumentClose = function (closeId) {
        if (closeId === this.activeId) {
            fsExtra.emptyDirSync(require('os').homedir() + "/" + this.docId);
            fs.rmdir(require('os').homedir() + "/" + this.docId, function (err) {
                console.log(err);
            });
        }
    };
    PhotoshopEventSubject.prototype.onPhotoshopClose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var docId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.generator.getDocumentSettingsForPlugin(this.activeDocument.id, packageJson.name + "Document")];
                    case 1:
                        docId = _a.sent();
                        this.createFolder(docId);
                        this.isState = this.photoshopCloseCallback;
                        this.notify();
                        return [2 /*return*/];
                }
            });
        });
    };
    PhotoshopEventSubject.prototype.onPhotoshopOpen = function () {
        this.isState = this.photoshopStartCallback;
        this.notify();
    };
    PhotoshopEventSubject.prototype.createFolder = function (docId) {
        if (this.activeDocument.directory) {
            var filteredPath = this.activeDocument.directory + "\\" + docId.docId;
            if (!fs.existsSync(filteredPath)) {
                fs.mkdirSync(filteredPath);
            }
        }
    };
    PhotoshopEventSubject.prototype.photoshopCloseCallback = function (observer) {
        observer.onPhotoshopClose();
    };
    PhotoshopEventSubject.prototype.photoshopStartCallback = function (observer) {
        observer.onPhotoshopStart();
    };
    PhotoshopEventSubject.prototype.add = function (observer) {
        this.observerList.push(observer);
    };
    PhotoshopEventSubject.prototype.notify = function () {
        var _this = this;
        this.observerList.forEach(function (factoryItem) {
            _this.isState(factoryItem);
        });
    };
    PhotoshopEventSubject.prototype.remove = function (observer) {
        //remove an observer
    };
    return PhotoshopEventSubject;
}());
exports.PhotoshopEventSubject = PhotoshopEventSubject;
//# sourceMappingURL=PhotoshopEventSubject.js.map