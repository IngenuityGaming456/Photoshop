import EventEmitter = NodeJS.EventEmitter;
import {PanelView} from "../view/PanelView";
import {PanelModel} from "../model/PanelModel";
import {utils} from "../utils/utils";
import * as io from "socket.io-client";
import {StateContext} from "../states/context";
import {PanelViewApp} from "../view/PanelViewApp";

export class PanelController {
    protected eventsObj: EventEmitter;
    protected view: PanelViewApp;
    protected model: PanelModel;
    protected socket;
    private readonly stateContext: StateContext;
    protected lockedItems = [];
    protected csInterface;

    public constructor(eventsObj: EventEmitter, viewObj: PanelViewApp, modelObj: PanelModel, stateContext: StateContext) {
        this.eventsObj = eventsObj;
        this.view = viewObj;
        this.model = modelObj;
        this.stateContext = stateContext;
        this.instantiateCSInterface();
        this.subscribeListeners();
        this.ready();
        this.listenToConnection();
    }

    private instantiateCSInterface() {
        this.csInterface = new CSInterface();
    }

    private ready() {
        this.eventsObj.emit("ControllerInitialized", this.stateContext);
    }

    protected subscribeListeners() {
        this.eventsObj.on("StorageFull", this.sendStorage.bind(this));
        this.eventsObj.on("liClick", this.handleClick.bind(this));
        this.eventsObj.on("bubbleClick", this.stopBubbling.bind(this));
        this.eventsObj.on("submitClick", this.processSubmission.bind(this));
        this.eventsObj.on("jsonProcessed", this.onJsonProcessed.bind(this));
        this.eventsObj.on("ContainerClick", this.onContainerClick.bind(this));
        this.eventsObj.on("ElementClick", this.onElementClick.bind(this));
    }

    protected processSubmission() {
        const checkedBoxes = [];
        const responseArray = [];
        this.view.checkBoxArray.forEach((item) => {
            if((item as HTMLInputElement).checked && !utils.isInContainerOrElement(utils.getParentLI(item))) {
                (item as HTMLInputElement).disabled = true;
                const hierarchyObj = this.getHierarchy(item.parentElement, "");
                responseArray.push(hierarchyObj);
                utils.pushToCheckBoxes(checkedBoxes, item, hierarchyObj);
                if(utils.isSafeToLock(item)) {
                    this.pushToLockedItems(item);
                }
            }
        });
        this.model.processResponse(responseArray, checkedBoxes);
    }

    private pushToLockedItems(item) {
        if(!~this.lockedItems.indexOf(item)) {
            this.lockedItems.push(item);
        }
    }

    private getHierarchy(item, hierarchy) {
        if(item.id === "parentUL") {
            return {
                hierarchy: hierarchy,
                platform: utils.getLISpan(item.parentElement).childNodes[0].nodeValue
            }
        }
        if(item.tagName === "LI") {
            const nodeValue = utils.getLISpan(item).childNodes[0].nodeValue;
            if(utils.isInContainerOrElement(item)) {
                return this.getHierarchy(item.parentElement, hierarchy);
            }
            if(hierarchy.length) {
                hierarchy += "," + nodeValue;
            } else {
                hierarchy += nodeValue;
            }
            if(!utils.decideCheck(item)) {
                return {
                    hierarchy: null,
                    platform: hierarchy
                }
            }
        }
        return this.getHierarchy(item.parentElement, hierarchy);
    }

    private handleClick(event) {
        const baseUL = utils.getChildrenUL(event.target.parentElement);
        event.target.classList.toggle("span-select");
        baseUL.classList.toggle("active");
        event.target.classList.toggle("caret-down");
        event.stopPropagation();
    }

    private sendStorage(storage: Array<Object>) {
        this.view.onStorageFull(storage, this.stateContext);
    }

    protected listenToConnection() {
        this.socket = io.connect('http://localhost:8099', {reconnect:true});
        this.socket.on("connect", () => {
            console.log("a user just connected");
            this.socket.emit("register", "htmlPanel");
        });
        this.socket.on("UncheckFromContainerPanel", (platform, baseView, layerName) => {
            this.onUncheckFromPanel(platform, baseView, layerName)
        } );
        this.socket.once("docOpen", (directory, docId) => {this.onDocOpen(directory, docId)});
    }

    private onDocOpen(directory, docId) {
        this.model.onDocOpen(directory, docId);
    }

    private onUncheckFromPanel(platform, baseView, layerName) {
        const output = this.view.checkBoxArray.find(item => {
            if(!platform && utils.getItem(item).childNodes[0].nodeValue === layerName) {
                return true;
            }
            if(!baseView && utils.isInPlatform(platform, item) && utils.getItem(item).childNodes[0].nodeValue === layerName) {
                return true;
            }
            if (utils.getItem(item).childNodes[0].nodeValue === layerName && utils.isInBaseView(baseView, item) &&
               utils.isInPlatform(platform, item)) {
                return true;
            }
        });
        if (output) {
            this.handleOutputElement(output);
        }
        this.processSubmission();
    }

    protected handleOutputElement(output) {
        if(this.lockedItems.indexOf(output) > -1) {
            this.lockedItems.splice(this.lockedItems.indexOf(output), 1);
        }
        (output as HTMLInputElement).checked = false;
        (output as HTMLInputElement).disabled = !utils.getPlatformInput(output).disabled && output.parentElement.parentElement !== document.body;
        this.onContainerClick({target: output});
    }

    protected onElementClick(event) {
        utils.setIntermediateState(event.target);
        this.stopBubbling(event);
    }

    protected onContainerClick(event) {
        const parentLI = utils.getParentLI(event.target);
        utils.setIntermediateState(event.target);
        this.handleNestedContainers(parentLI, event.target);
        this.stopBubbling(event);
    }

    private handleNestedContainers(itemRef, inputCheckbox) {
        inputCheckbox = Array.from(itemRef.children)[0];
        const childUL = utils.getChildrenUL(itemRef);
        if(!childUL) {
            return;
        }
        const allULChildren = Array.from(childUL.children);
        allULChildren.forEach((item: HTMLElement) => {
            this.checkNestedContainerCheckbox(item, inputCheckbox, utils.decideCheck(itemRef));
            this.handleNestedContainers(item, inputCheckbox);
        })
    }

    private checkNestedContainerCheckbox(item, inputCheckbox, check) {
        if(item.tagName === "LI") {
            const parentLI = utils.getParentLI(item);
            const input: HTMLElement = Array.from(item.children)[0] as HTMLElement;
            if(!~this.lockedItems.indexOf(input)) {
                this.setCheckedState(input, inputCheckbox, check);
                this.setCheckboxState(input, inputCheckbox.checked, parentLI);
            }
        }
    }

    private setCheckedState(item, inputCheckbox, check, input?) {
        if(input) {
            (item as HTMLInputElement).checked = inputCheckbox.checked;
        } else {
            (item as HTMLInputElement).checked = check? inputCheckbox.checked : false;
        }
    }

    private setCheckboxState(inputCheckbox, isChecked, parentLI) {
        if(~utils.getLISpan(parentLI).childNodes[0].nodeValue.search(/Containers|Elements/) &&
           utils.getParentLI(parentLI).children[0].checked) {
            inputCheckbox.disabled = false;
        } else {
            inputCheckbox.disabled = !isChecked;
        }
    }

    private onJsonProcessed(responseMap, checkedBoxes) {
        this.socket.emit("getQuestJson", utils.mapToObject(responseMap),checkedBoxes);
    }

    private stopBubbling(event) {
        try {
            event.stopPropagation();
        } catch(err) {
            console.log("event without propogation detected");
        }
    }

}