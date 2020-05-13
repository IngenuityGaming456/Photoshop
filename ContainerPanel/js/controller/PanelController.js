"use strict";
exports.__esModule = true;
var utils_1 = require("../utils/utils");
var io = require("socket.io-client");
var PanelController = /** @class */ (function () {
    function PanelController(eventsObj, viewObj, modelObj, stateContext) {
        this.lockedItems = [];
        this.eventsObj = eventsObj;
        this.view = viewObj;
        this.model = modelObj;
        this.stateContext = stateContext;
        this.instantiateCSInterface();
        this.subscribeListeners();
        this.ready();
        this.listenToConnection();
    }
    PanelController.prototype.instantiateCSInterface = function () {
        this.csInterface = new CSInterface();
    };
    PanelController.prototype.ready = function () {
        this.eventsObj.emit("ControllerInitialized", this.stateContext);
    };
    PanelController.prototype.subscribeListeners = function () {
        this.eventsObj.on("StorageFull", this.sendStorage.bind(this));
        this.eventsObj.on("liClick", this.handleClick.bind(this));
        this.eventsObj.on("bubbleClick", this.stopBubbling.bind(this));
        this.eventsObj.on("submitClick", this.processSubmission.bind(this));
        this.eventsObj.on("jsonProcessed", this.onJsonProcessed.bind(this));
        this.eventsObj.on("ContainerClick", this.onContainerClick.bind(this));
        this.eventsObj.on("ElementClick", this.onElementClick.bind(this));
    };
    PanelController.prototype.processSubmission = function () {
        var _this = this;
        var checkedBoxes = [];
        var responseArray = [];
        this.view.checkBoxArray.forEach(function (item) {
            if (item.checked && !utils_1.utils.isInContainerOrElement(utils_1.utils.getParentLI(item))) {
                item.disabled = true;
                var hierarchyObj = _this.getHierarchy(item.parentElement, "");
                responseArray.push(hierarchyObj);
                utils_1.utils.pushToCheckBoxes(checkedBoxes, item, hierarchyObj);
                if (utils_1.utils.isSafeToLock(item)) {
                    _this.pushToLockedItems(item);
                }
            }
        });
        this.model.processResponse(responseArray, checkedBoxes);
    };
    PanelController.prototype.pushToLockedItems = function (item) {
        if (!~this.lockedItems.indexOf(item)) {
            this.lockedItems.push(item);
        }
    };
    PanelController.prototype.getHierarchy = function (item, hierarchy) {
        if (item.id === "parentUL") {
            return {
                hierarchy: hierarchy,
                platform: utils_1.utils.getLISpan(item.parentElement).childNodes[0].nodeValue
            };
        }
        if (item.tagName === "LI") {
            var nodeValue = utils_1.utils.getLISpan(item).childNodes[0].nodeValue;
            nodeValue = utils_1.utils.spliceFromFront(nodeValue, " ");
            if (utils_1.utils.isInContainerOrElement(item)) {
                return this.getHierarchy(item.parentElement, hierarchy);
            }
            if (hierarchy.length) {
                hierarchy += "," + nodeValue;
            }
            else {
                hierarchy += nodeValue;
            }
            if (!utils_1.utils.decideCheck(item)) {
                return {
                    hierarchy: null,
                    platform: hierarchy
                };
            }
        }
        return this.getHierarchy(item.parentElement, hierarchy);
    };
    PanelController.prototype.handleClick = function (event) {
        var baseUL = utils_1.utils.getChildrenUL(event.target.parentElement);
        event.target.classList.toggle("span-select");
        baseUL.classList.toggle("active");
        event.target.classList.toggle("caret-down");
        event.stopPropagation();
    };
    PanelController.prototype.sendStorage = function (storage) {
        this.view.onStorageFull(storage, this.stateContext);
    };
    PanelController.prototype.listenToConnection = function () {
        var _this = this;
        this.socket = io.connect('http://localhost:8099', { reconnect: true });
        this.socket.on("connect", function () {
            console.log("a user just connected");
            _this.socket.emit("register", "htmlPanel");
        });
        this.socket.on("UncheckFromContainerPanel", function (platform, baseView, layerName) {
            _this.onUncheckFromPanel(platform, baseView, layerName);
        });
        this.socket.once("docOpen", function (directory, docId) { _this.onDocOpen(directory, docId); });
    };
    PanelController.prototype.onDocOpen = function (directory, docId) {
        this.model.onDocOpen(directory, docId);
    };
    PanelController.prototype.onUncheckFromPanel = function (platform, baseView, layerName) {
        var output = this.view.checkBoxArray.find(function (item) {
            var nodeName = utils_1.utils.spliceFromFront(utils_1.utils.getItem(item).childNodes[0].nodeValue, " ");
            if (!platform && nodeName === layerName) {
                return true;
            }
            if (!baseView && utils_1.utils.isInPlatform(platform, item) && nodeName === layerName) {
                return true;
            }
            if (nodeName === layerName && utils_1.utils.isInBaseView(baseView, item) &&
                utils_1.utils.isInPlatform(platform, item)) {
                return true;
            }
        });
        if (output) {
            this.handleOutputElement(output);
        }
        this.processSubmission();
    };
    PanelController.prototype.handleOutputElement = function (output) {
        if (this.lockedItems.indexOf(output) > -1) {
            this.lockedItems.splice(this.lockedItems.indexOf(output), 1);
        }
        output.checked = false;
        output.disabled = !utils_1.utils.getPlatformInput(output).disabled && output.parentElement.parentElement !== document.body;
        this.onContainerClick({ target: output });
    };
    PanelController.prototype.onElementClick = function (event) {
        utils_1.utils.setIntermediateState(event.target);
        this.stopBubbling(event);
    };
    PanelController.prototype.onContainerClick = function (event) {
        var parentLI = utils_1.utils.getParentLI(event.target);
        utils_1.utils.setIntermediateState(event.target);
        this.handleNestedContainers(parentLI, event.target);
        this.stopBubbling(event);
    };
    PanelController.prototype.handleNestedContainers = function (itemRef, inputCheckbox) {
        var _this = this;
        inputCheckbox = Array.from(itemRef.children)[0];
        var childUL = utils_1.utils.getChildrenUL(itemRef);
        if (!childUL) {
            return;
        }
        var allULChildren = Array.from(childUL.children);
        allULChildren.forEach(function (item) {
            _this.checkNestedContainerCheckbox(item, inputCheckbox, utils_1.utils.decideCheck(itemRef));
            _this.handleNestedContainers(item, inputCheckbox);
        });
    };
    PanelController.prototype.checkNestedContainerCheckbox = function (item, inputCheckbox, check) {
        if (item.tagName === "LI") {
            var parentLI = utils_1.utils.getParentLI(item);
            var input = Array.from(item.children)[0];
            if (!~this.lockedItems.indexOf(input)) {
                this.setCheckedState(input, inputCheckbox, check);
                this.setCheckboxState(input, inputCheckbox.checked, parentLI);
            }
        }
    };
    PanelController.prototype.setCheckedState = function (item, inputCheckbox, check, input) {
        if (input) {
            item.checked = inputCheckbox.checked;
        }
        else {
            item.checked = check ? inputCheckbox.checked : false;
        }
    };
    PanelController.prototype.setCheckboxState = function (inputCheckbox, isChecked, parentLI) {
        if (~utils_1.utils.getLISpan(parentLI).childNodes[0].nodeValue.search(/Containers|Elements/) &&
            utils_1.utils.getParentLI(parentLI).children[0].checked) {
            inputCheckbox.disabled = false;
        }
        else {
            inputCheckbox.disabled = !isChecked;
        }
    };
    PanelController.prototype.onJsonProcessed = function (responseMap, checkedBoxes) {
        this.socket.emit("getQuestJson", utils_1.utils.mapToObject(responseMap), checkedBoxes);
    };
    PanelController.prototype.stopBubbling = function (event) {
        try {
            event.stopPropagation();
        }
        catch (err) {
            console.log("event without propogation detected");
        }
    };
    return PanelController;
}());
exports.PanelController = PanelController;
