import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {ModelFactory} from "../../models/ModelFactory";
import {photoshopConstants as pc} from "../../constants";

let menuLabels = require("../../res/menuLables");

export class MenuProxyManager implements IFactory {
    private readonly modelFactory;
    private generator;
    private menuStates = [];
    private docEmitter;
    private promiseCallQueue = [];
    private queueResolveStatus = null;
    public constructor(modelFactory: ModelFactory) {
        this.modelFactory = modelFactory;
    }

    public async execute(params: IParams) {
        this.generator = params.generator;
        this.docEmitter = params.docEmitter;
        this.menuStates = this.modelFactory.getPhotoshopModel().allMenuStates;
        this.subscribeListeners();
        await this.addMenuItems();
    }

    private subscribeListeners() {
        this.docEmitter.on(pc.logger.currentDocument, () => this.modifyAllMenuItems("en", true));
        this.docEmitter.on(pc.logger.newDocument, () => this.modifyAllMenuItems("dis", false));
    }

    private async addMenuItems() {
        const menuArray = Object.keys(menuLabels);
        for (let menu of menuArray) {
            await this.drawMenuItems(menu);
        }
    }

    private async drawMenuItems(menu) {
        if(menuLabels[menu].enabled === false) {
            await this.generator.addMenuItem(menuLabels[menu].label,
                menuLabels[menu].displayName, menuLabels[menu].enabled, false);
        } else {
            await this.generator.addMenuItem(menuLabels[menu].label,
                menuLabels[menu].displayName, true, false);
        }
    }

    private modifyAllMenuItems(key, enable) {
        if(this.canPushToQueue(key, enable)) {
            key && this.promiseCallQueue.push(key);
            console.log(JSON.stringify({queue : this.promiseCallQueue}));
        } else {
            return;
        }
        if (this.isQueueBusy() && key) {
            return;
        }
        const p = [];
        for (let menu in menuLabels) {
            if (menuLabels.hasOwnProperty(menu)) {
                p.push(this.generator.toggleMenu(menuLabels[menu].label, enable, false,
                    menuLabels[menu].displayName));
            }
        }
        Promise.all(p).then(() => {
            console.log(`All Elements Settled with ${enable}`);
            this.promiseCallQueue.splice(0, 1);
            this.logEndStatus(enable);
            console.log(JSON.stringify({queue : this.promiseCallQueue}));
            if (this.canQueueProcess()) {
                enable = this.promiseCallQueue[0] === "en";
                this.modifyAllMenuItems(undefined, enable);
            }
        });
    }

    private isQueueBusy() {
        return this.promiseCallQueue.length > 1;
    }

    private canQueueProcess() {
        return this.promiseCallQueue.length > 0;
    }

    private canPushToQueue(key, enable) {
        const queueLength = this.promiseCallQueue.length;
        return (queueLength === 0 && this.queueResolveStatus !== enable) || (queueLength > 0 && this.promiseCallQueue[queueLength - 1] !== key);
    }

    private logEndStatus(enable) {
        this.queueResolveStatus = enable;
        if(enable) {
            this.docEmitter.emit("logStatus", "Menu Stabilized");
        }
    }
}