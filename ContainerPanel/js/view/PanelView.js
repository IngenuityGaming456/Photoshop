"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PanelView {
    constructor(eventsObj) {
        this.eventsObj = eventsObj;
        this.subscribeListeners();
    }
    subscribeListeners() {
        this.eventsObj.on("StorageFull", this.onStorageFull);
    }
    onStorageFull(storage) {
        this.treeView(storage);
    }
    treeView(storage) {
        this.constructHtml();
        storage.forEach(item => {
            let refUL = new Map();
            this.makeJsonView(item, undefined, refUL);
        });
    }
    makeJsonView(item, parentUL, refUL) {
        for (let key in item) {
            if (!item[key].type) {
                parentUL = this.handleBaseElement();
                this.makeJsonView(item[key], parentUL, refUL);
                continue;
            }
            if (!item[key].parent && item[key].type === "container") {
                this.handleBaseChildElement(parentUL, item, key, refUL);
                continue;
            }
            if (item[key].parent && item[key].type === "container") {
                this.handleNestedChildElement(item, key, item[key].parent, refUL);
            }
        }
    }
    handleBaseElement() {
        const parentUL = document.createElement("ul");
        document.body.appendChild(parentUL);
        return parentUL;
    }
    handleBaseChildElement(parentUL, item, key, refUL) {
        const baseChildLI = document.createElement("li");
        parentUL.append(baseChildLI);
        refUL.set(item[key], baseChildLI);
    }
    handleNestedChildElement(item, key, parent, refUL) {
        let childRef;
        const tagRef = refUL.get(parent);
        if (tagRef.tagName === "UL") {
            childRef = document.createElement("li");
        }
        if (tagRef.tagName === "LI") {
            childRef = document.createElement("ul");
        }
        tagRef.append(childRef);
        refUL.set(item[key], childRef);
    }
    constructHtml() {
        const body = document.createElement("body");
        document.documentElement.appendChild(body);
    }
}
exports.PanelView = PanelView;
//# sourceMappingURL=PanelView.js.map