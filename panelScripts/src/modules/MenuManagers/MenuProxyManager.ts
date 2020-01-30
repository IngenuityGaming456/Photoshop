import {IFactory, IParams} from "../../interfaces/IJsxParam";
import {ModelFactory} from "../../models/ModelFactory";
import {photoshopConstants as pc} from "../../constants";

let menuLabels = require("../../res/menuLables");

export class MenuProxyManager implements IFactory {
    private readonly modelFactory;
    private generator;
    private menuStates = [];
    private docEmitter;
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
        this.docEmitter.on(pc.logger.currentDocument, () => this.enableAllMenuItems());
        this.docEmitter.on(pc.logger.newDocument, () => this.disableAllMenuItems());
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

    private async enableAllMenuItems() {
        for(let menu in menuLabels) {
            if(menuLabels.hasOwnProperty(menu) && menuLabels[menu].enabled !== false) {
                await this.generator.toggleMenu(menuLabels[menu].label, true, false,
                    menuLabels[menu].displayName);
            }
        }
    }

    private async disableAllMenuItems() {
        for(let menu in menuLabels) {
            if(menuLabels.hasOwnProperty(menu)) {
                    await this.generator.toggleMenu(menuLabels[menu].label,false, false,
                        menuLabels[menu].displayName);
                }
            }
        }
}
