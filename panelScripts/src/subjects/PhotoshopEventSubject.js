"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoshopEventSubject = void 0;
const fs = require("fs");
const fsExtra = require("fs-extra/lib/empty/index");
const constants_1 = require("../constants");
let packageJson = require("../../package.json");
class PhotoshopEventSubject {
    constructor() {
        this.observerList = [];
    }
    execute(params) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.activeDocument = params.activeDocument;
        this.docId = params.storage.docId;
        this.activeId = this.activeDocument.id;
        this.currentId = params.storage.activeId;
        this.subscribeListeners();
    }
    subscribeListeners() {
        this.docEmitter.on(constants_1.photoshopConstants.emitter.observerAdd, observer => this.add(observer));
        this.docEmitter.on(constants_1.photoshopConstants.emitter.observerRemove, observer => this.remove(observer));
        this.generator.on(constants_1.photoshopConstants.generator.save, () => this.onPhotoshopClose());
        this.generator.on(constants_1.photoshopConstants.generator.closedDocument, (closeId) => this.onDocumentClose(closeId));
    }
    onDocumentClose(closeId) {
        if (closeId === this.activeId) {
            fsExtra.emptyDirSync(require('os').homedir() + "/" + this.docId);
            fs.rmdir(require('os').homedir() + "/" + this.docId, err => {
                console.log(err);
            });
        }
    }
    onPhotoshopClose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentId.id && this.currentId.id !== this.activeId) {
                return;
            }
            this.isState = this.photoshopCloseCallback;
            this.notify();
        });
    }
    onPhotoshopOpen() {
        this.isState = this.photoshopStartCallback;
        this.notify();
    }
    photoshopCloseCallback(observer) {
        observer.onPhotoshopClose();
    }
    photoshopStartCallback(observer) {
        observer.onPhotoshopStart();
    }
    add(observer) {
        this.observerList.push(observer);
    }
    notify() {
        this.observerList.forEach(factoryItem => {
            this.isState(factoryItem);
        });
    }
    remove(observer) {
        //remove an observer
    }
}
exports.PhotoshopEventSubject = PhotoshopEventSubject;
//# sourceMappingURL=PhotoshopEventSubject.js.map