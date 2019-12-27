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
var packageJson = require("../../package.json");
var PhotoshopStartModel = /** @class */ (function () {
    function PhotoshopStartModel() {
        this.writeObj = {};
    }
    PhotoshopStartModel.prototype.execute = function (params) {
        this.writeObj = {};
        this.docIdObj = null;
        this.openDocumentData = null;
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.subscribeListeners();
    };
    PhotoshopStartModel.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("writeData", function (data, isComplete) { return _this.onWriteData(data, isComplete); });
        this.generator.on("docId", function (docId) {
            _this.docIdObj.docId = docId;
        });
    };
    PhotoshopStartModel.prototype.onWriteData = function (data, isComplete) {
        this.writeObj = Object.assign(this.writeObj, data);
        isComplete && this.writeDataAtPath();
    };
    PhotoshopStartModel.prototype.writeDataAtPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = JSON.stringify(this.writeObj, null, "  ");
                fs.writeFile(this.activeDocument.directory + "\\" + this.docIdObj.docId + "/States.json", result, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    PhotoshopStartModel.prototype.onPhotoshopStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.generator.getDocumentSettingsForPlugin(this.activeDocument.id, packageJson.name + "Document")];
                    case 1:
                        _a.docIdObj = _b.sent();
                        if (!Object.keys(this.docIdObj).length) {
                            return [2 /*return*/, null];
                        }
                        data = fs.readFileSync(this.activeDocument.directory + "\\" + this.docIdObj.docId + "/States.json", { encoding: "utf8" });
                        this.openDocumentData = JSON.parse(data);
                        return [2 /*return*/, this.openDocumentData];
                }
            });
        });
    };
    PhotoshopStartModel.prototype.onPhotoshopClose = function () {
    };
    return PhotoshopStartModel;
}());
exports.PhotoshopStartModel = PhotoshopStartModel;
//# sourceMappingURL=PhotoshopStartModel.js.map