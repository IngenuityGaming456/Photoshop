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
exports.MenuProxyManager = void 0;
const constants_1 = require("../../constants");
let menuLabels = require("../../res/menuLables");
class MenuProxyManager {
    constructor(modelFactory) {
        this.menuStates = [];
        this.promiseCallQueue = [];
        this.queueResolveStatus = null;
        this.modelFactory = modelFactory;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.generator = params.generator;
            this.docEmitter = params.docEmitter;
            this.menuStates = this.modelFactory.getPhotoshopModel().allMenuStates;
            this.subscribeListeners();
            yield this.addMenuItems();
        });
    }
    subscribeListeners() {
        this.docEmitter.on(constants_1.photoshopConstants.logger.currentDocument, () => this.modifyAllMenuItems("en", true));
        this.docEmitter.on(constants_1.photoshopConstants.logger.newDocument, () => this.modifyAllMenuItems("dis", false));
    }
    addMenuItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const menuArray = Object.keys(menuLabels);
            for (let menu of menuArray) {
                yield this.drawMenuItems(menu);
            }
        });
    }
    drawMenuItems(menu) {
        return __awaiter(this, void 0, void 0, function* () {
            if (menuLabels[menu].enabled === false) {
                yield this.generator.addMenuItem(menuLabels[menu].label, menuLabels[menu].displayName, menuLabels[menu].enabled, false);
            }
            else {
                yield this.generator.addMenuItem(menuLabels[menu].label, menuLabels[menu].displayName, true, false);
            }
        });
    }
    modifyAllMenuItems(key, enable) {
        if (this.canPushToQueue(key, enable)) {
            key && this.promiseCallQueue.push(key);
            console.log(JSON.stringify({ queue: this.promiseCallQueue }));
        }
        else {
            return;
        }
        if (this.isQueueBusy() && key) {
            return;
        }
        const p = [];
        for (let menu in menuLabels) {
            if (menuLabels.hasOwnProperty(menu)) {
                p.push(this.generator.toggleMenu(menuLabels[menu].label, enable, false, menuLabels[menu].displayName));
            }
        }
        Promise.all(p).then(() => {
            console.log(`All Elements Settled with ${enable}`);
            this.promiseCallQueue.splice(0, 1);
            this.logEndStatus(enable);
            console.log(JSON.stringify({ queue: this.promiseCallQueue }));
            if (this.canQueueProcess()) {
                enable = this.promiseCallQueue[0] === "en";
                this.modifyAllMenuItems(undefined, enable);
            }
        });
    }
    isQueueBusy() {
        return this.promiseCallQueue.length > 1;
    }
    canQueueProcess() {
        return this.promiseCallQueue.length > 0;
    }
    canPushToQueue(key, enable) {
        const queueLength = this.promiseCallQueue.length;
        return (queueLength === 0 && this.queueResolveStatus !== enable) || (queueLength > 0 && this.promiseCallQueue[queueLength - 1] !== key);
    }
    logEndStatus(enable) {
        this.queueResolveStatus = enable;
        if (enable) {
            this.docEmitter.emit("logStatus", "Menu Stabilized");
        }
    }
}
exports.MenuProxyManager = MenuProxyManager;
//# sourceMappingURL=MenuProxyManager.js.map