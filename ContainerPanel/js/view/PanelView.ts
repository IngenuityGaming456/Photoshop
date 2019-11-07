import {EventEmitter} from "events";
import {utils} from "../utils/utils";
import {StateContext} from "../states/context";

export class PanelView {
    private eventsObj: EventEmitter;
    private leafsMap: Map<string, any>;
    public checkBoxArray: Array<HTMLElement> = [];
    private stateContext: StateContext;
    private safeToLock = [];

    public constructor(eventsObj: EventEmitter) {
        this.eventsObj = eventsObj;
    }

    public onStorageFull(storage: Array<Object>, stateContext) {
        this.stateContext = stateContext;
        this.treeView(storage);
        this.sendIndeterminateStates();
    }

    private treeView(storage: Array<Object>) {
        ["desktop", "portrait", "landscape"].forEach(platform => {
            this.createJSONForPlatform(platform, storage);
        });
        this.createSubmitButton();
    }

    private sendIndeterminateStates() {
        this.safeToLock.forEach(item => {
            this.eventsObj.emit("safeToLock", item);
        });
    }

    private createJSONForPlatform(platform, storage) {
        const parentUL = this.constructHtml();
        this.insertParentULIntoPlatforms(parentUL, platform);
        this.leafsMap = new Map();
        storage.forEach(item => {
            this.makeJsonView(item, parentUL);
        });
    }

    private makeJsonView(item: Object, parentUL) {
        for(let key in item) {
            if(key === "noElement" || key === "noContainer" || key === "leaf") {
                continue;
            }
            if (!item[key].type) {
                const liObj = this.handleBaseElement(item, key, parentUL);
                this.makeJsonView(item[key], liObj);
                continue;
            }
            if(item[key].type === "container") {
                this.handleContainerElement(item, parentUL, key);
                continue;
            }
            this.handleLeafs(item, key, parentUL);
        }
    }

    private handleContainerElement(item, liObj, key) {
        if(item[key].parent) {
            this.handleNestedChildElement(item, key, item[key].parent);
            return;
        }
        this.handleBaseChildElement(item, liObj["containers"], key);
    }

    private handleLeafs(item, key, liObj) {
        if(item[key].parent) {
            this.handleLeafsWithParent(item[key].id, item[key].parent);
            return;
        }
        this.handleLeafsWithoutParent(item[key].id, liObj);
    }

    private handleLeafsWithoutParent(key, liObj) {
        this.checkBoxArray.push(this.insertCheckbox(key, liObj["elements"]));
    }

    private handleLeafsWithParent(key, parent) {
        const refObj = this.leafsMap.get(parent);
        this.checkBoxArray.push(this.insertCheckbox(key, refObj["elements"]));
    }

    private handleBaseElement(item, key: string, parentUL) {
        const liObj = this.insertLIToUL(item, parentUL, key);
        this.setLeafsMap(key, liObj);
        this.addContainerCheckbox(liObj["base"]);
        return liObj;
    }

    private handleBaseChildElement(item, parentUL, key) {
        const liObj = this.insertLIToUL(item, parentUL, key);
        this.setLeafsMap(key, liObj);
        this.addContainerCheckbox(liObj["base"]);
    }

    private handleNestedChildElement(item, key, parent) {
        const refObj = this.leafsMap.get(parent);
        const liObj = this.insertLIToUL(item, refObj["containers"], key);
        this.setLeafsMap(key, liObj);
        this.addContainerCheckbox(liObj["base"]);
    }

    private addContainerCheckbox(baseUL, type?) {
        const baseLI = baseUL.parentElement;
        const childInput = this.insertContainerCheckbox(baseLI);
        childInput.checked = this.stateContext.isChecked(childInput, "");
        childInput.disabled = this.stateContext.isDisabled(childInput, type, true);
        this.isSafeToLock(childInput);

        this.checkBoxArray.push(childInput);
    }

    private insertLIToUL(item, parentUL, key) {
        const baseUL = this.insertLIAndUL(key, parentUL);
        const liObj = this.addContainersAndElements(item[key], baseUL);
        if(item[key].leaf === true) {
            utils.getLISpan(baseUL.parentElement).classList.remove("cursor");
        }
        liObj["base"] = baseUL;
        return liObj;
    }

    private insertLIAndUL(key, parentUL) {
        const baseLI = document.createElement("li");
        const spanLI = this.addSpan(baseLI, key, "cursor");
        this.subscribeListListener(spanLI);
        const baseUL = document.createElement("ul");
        baseLI.append(baseUL);
        baseUL.className = "nested";
        parentUL.append(baseLI);
        return baseUL;
    }

    public addContainersAndElements(item, baseUL) {
        const containerUL = item.leaf || item.noContainer? null : this.insertLIAndUL("Containers", baseUL);
        const elementUL = item.leaf || item.noElement ? null : this.insertLIAndUL("Elements", baseUL);
        containerUL && this.addContainerCheckbox(containerUL);
        elementUL && this.addContainerCheckbox(elementUL);
        return {
            containers: containerUL,
            elements: elementUL
        };
    }

    public addSpan(baseLI, key, className) {
        const spanLI = document.createElement("span");
        spanLI.innerText = key;
        if(className) spanLI.className = className;
        baseLI.append(spanLI);
        return spanLI;
    }

    private subscribeListListener(spanLI) {
        spanLI.addEventListener("click", (event) => {
            this.eventsObj.emit("liClick", event);
        });
    }

    private setLeafsMap(key, liObj) {
        this.leafsMap.set(key, liObj);
    }

    private createSubmitButton() {
        const submitButton = document.createElement("button");
        submitButton.type = "button";
        submitButton.innerText = "Generate";
        submitButton.className = "submit";
        document.body.append(submitButton);
        this.subscribeButtonListener(submitButton);
    }

    private subscribeButtonListener(submitButton) {
        submitButton.addEventListener("click", () => {
            this.eventsObj.emit("submitClick");
        });
    }

    private insertContainerCheckbox(parentLI) {
        const childInput = document.createElement("input");
        childInput.type = "checkbox";
        parentLI.prepend(childInput);
        childInput.addEventListener("click", event => {
            this.eventsObj.emit("ContainerClick", event);
        });
        return childInput;
    }

    private insertCheckbox(key, parentUL) {
        const childLI = document.createElement("li");
        this.addSpan(childLI, key, null);
        const childInput = this.insertContainerCheckbox(childLI);
        parentUL.append(childLI);
        childInput.checked = this.stateContext.isChecked(childInput, key);
        childInput.disabled = this.stateContext.isDisabled(childInput);
        childInput.addEventListener("click", event => {
            this.eventsObj.emit("ElementClick", event);
        });
        this.isSafeToLock(childInput);
        return childInput;
    }

    private isSafeToLock(childInput) {
        if(childInput.checked && childInput.disabled && utils.isSafeToLock(childInput)) {
            this.safeToLock.push(childInput);
        }
    }

    private insertParentULIntoPlatforms(parentUL, platform) {
        const platformLI = document.createElement("li");
        const spanLI = this.addSpan(platformLI, platform, "cursor");
        this.subscribeListListener(spanLI);
        platformLI.append(parentUL);
        this.addContainerCheckbox(parentUL, true);
        document.body.append(platformLI);
    }

    private constructHtml() {
        let body;
        if(!document.body) {
            body = document.createElement("body");
        } else {
            body = document.body;
        }
        body.className = "dark";
        document.documentElement.appendChild(body);
        const parentUL = document.createElement("ul");
        parentUL.id = "parentUL";
        parentUL.className = "nested";
        return parentUL;
    }
}