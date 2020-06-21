import EventEmitter = NodeJS.EventEmitter;
import {PanelView} from "../view/PanelView";
import {PanelModel} from "../model/PanelModel";
import {utils} from "../utils/utils";
import * as io from "socket.io-client";
import {StateContext} from "../states/context";
import {PanelViewApp} from "../view/PanelViewApp";
import {MappingView} from "../view/MappingView";

export class PanelController {
    protected eventsObj: EventEmitter;
    protected view: PanelViewApp;
    private mappingView: MappingView;
    protected model: PanelModel;
    protected socket;
    protected readonly stateContext: StateContext;
    protected lockedItems = [];
    protected csInterface;

    public constructor(eventsObj: EventEmitter, viewObj: PanelViewApp, mappingViewObj: MappingView, modelObj: PanelModel, stateContext: StateContext) {
        this.eventsObj = eventsObj;
        this.view = viewObj;
        this.mappingView = mappingViewObj;
        this.model = modelObj;
        this.stateContext = stateContext;
        this.instantiateCSInterface();
        utils.createBody();
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
        this.makeSubmission(checkedBoxes, responseArray);
        const mappingResponse = this.mappingView.sendMappingResponse();
        this.model.processResponse(responseArray, checkedBoxes, mappingResponse);
    }

    protected makeSubmission(checkedBoxes, responseArray) {
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
            let nodeValue = utils.getLISpan(item).childNodes[0].nodeValue;
            nodeValue = utils.spliceFromFront(nodeValue, " ");
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

    protected sendStorage(storage: Array<Object>) {
        this.view.onStorageFull(storage, this.stateContext, "Quest Strutures");
        this.eventsObj.emit("makePanelView");
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
            const nodeName = utils.spliceFromFront(utils.getItem(item).childNodes[0].nodeValue, " ");
            if(!platform && nodeName === layerName) {
                return true;
            }
            if(!baseView && utils.isInPlatform(platform, item) && nodeName === layerName) {
                return true;
            }
            if (nodeName === layerName && utils.isInBaseView(baseView, item) &&
                utils.isInPlatform(platform, item)) {
                return true;
            }
        });
        if (output) {
            this.handleOutputElement(output);
        }
        this.processSubmission();
        this.socket.emit("uncheckFinished");
    }

    protected handleOutputElement(output) {
        if(this.lockedItems.indexOf(output) > -1) {
            this.lockedItems.splice(this.lockedItems.indexOf(output), 1);
        }
        (output as HTMLInputElement).checked = false;
        (output as HTMLInputElement).disabled = !utils.getPlatformInput(output).disabled && output.parentElement.parentElement !== document.body;
        this.onContainerClick({target: output}, true);
    }

    protected onElementClick(event) {
        utils.setIntermediateState(event.target);
        this.stopBubbling(event);
    }

    protected onContainerClick(event, uncheck?) {
        const parentLI = utils.getParentLI(event.target);
        utils.setIntermediateState(event.target);
        this.handleNestedContainers(parentLI, event.target, uncheck);
        this.stopBubbling(event);
    }

    private handleNestedContainers(itemRef, inputCheckbox, uncheck?) {
        inputCheckbox = Array.from(itemRef.children)[0];
        const childUL = utils.getChildrenUL(itemRef);
        if(!childUL) {
            return;
        }
        const allULChildren = Array.from(childUL.children);
        allULChildren.forEach((item: HTMLElement) => {
            this.checkNestedContainerCheckbox(item, inputCheckbox, utils.decideCheck(itemRef), uncheck);
            this.handleNestedContainers(item, inputCheckbox, uncheck);
        })
    }

    private checkNestedContainerCheckbox(item, inputCheckbox, check, uncheck?) {
        if(item.tagName === "LI") {
            const parentLI = utils.getParentLI(item);
            const input: HTMLElement = Array.from(item.children)[0] as HTMLElement;
            if(!~this.lockedItems.indexOf(input) || uncheck) {
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
            if(!inputCheckbox.checked) {
                (item as HTMLInputElement).indeterminate = false;
            }
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

    private onJsonProcessed(responseMap, checkedBoxes, type, mappingResponse) {
        this.socket.emit("getQuestJson", utils.mapToObject(responseMap),checkedBoxes, type, mappingResponse);
    }

    private stopBubbling(event) {
        try {
            event.stopPropagation();
        } catch(err) {
            console.log("event without propogation detected");
        }
    }

}