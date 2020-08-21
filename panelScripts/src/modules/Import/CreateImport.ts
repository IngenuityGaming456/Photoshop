import {IFactory, IParams} from "../../interfaces/IJsxParam";
import * as fs from "fs";
import {utlis} from "../../utils/utils";
import {PhotoshopParser} from "./PhotoshopParser";
import {result} from "./result";

export class CreateImport implements IFactory{
    private generator;
    private activeDocument;
    private qAssetsPath;
    private qObj;
    private readonly result;
    private readonly pParser;

    public constructor(pParser: PhotoshopParser) {
        this.pParser = pParser;
        this.result = {...result};
    }

    execute(params: IParams) {
        this.generator = params.generator;
        this.activeDocument = params.activeDocument;
        this.getAssetsAndJson();
        this.compareJson();
    }

    private getAssetsAndJson() {
        const stats = utlis.getAssetsAndJson("Quest", this.activeDocument);
        this.qAssetsPath = stats.qAssetsPath;
        this.qObj = stats.qObj;
    }

    private compareJson() {
        for(let platform in this.qObj) {
            if(!this.qObj.hasOwnProperty(platform)) {
                continue;
            }
            const enObj = this.qObj[platform]["en"];
            this.compareViews(enObj, platform);
        }
    }

    private compareViews(enObj, platform) {
        for(let view in enObj) {
            if(!enObj.hasOwnProperty(view)) {
                continue;
            }
            const pView = this.pParser.getPView(view, platform);
            if(!pView) {
                this.result.create.views.push({
                    view,
                    platform
                });
            }
            this.compareComponents(enObj[view], view, platform);
        }
    }

    private compareComponents(viewObj, view, platform) {
        for(let comp in viewObj) {
            if(!viewObj.hasOwnProperty(comp)) {
                continue;
            }
            const compObj = viewObj[comp];
            if(this.isNew(compObj)) {
                const type = this.getType(compObj);
                this.result.create[type].push(compObj);
            } else {
                this.isMove(compObj, viewObj, view, platform);
                this.isRename(compObj, viewObj);
                this.isEdit(compObj, viewObj);
            }
        }
    }

    private isMove(compObj, viewObj, view, platform) {
        const moveObj = {};
        const parent = compObj.parent;
        const parentObj = viewObj[parent];
        if(this.isNew(parentObj)) {
            this.handleMove(moveObj, compObj, parentObj, this.getType(compObj), view, platform);
        }
        const isDiff = this.psParser.compareParent(compObj, parentObj, view, platform);
        if(isDiff) {
            this.handleMove(moveObj, compObj, parentObj, this.getType(compObj), view, platform);
        }
    }

    private isRename(compObj, viewObj) {
        
    }

    private isEdit(compObj, viewObj) {

    }

    private isNew(compObj) {
        return ~compObj.layerID.search("ID")
    }

    private getType(compObj) {
        return compObj.type;
    }

    private handleMove(moveObj, child, parent, type, view, platform) {
        moveObj["child"] = child;
        moveObj["parent"] = parent;
        this.result.move[type].push({
            moveObj,
            view,
            platform
        });
    }
}