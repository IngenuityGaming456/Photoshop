"use strict";
exports.__esModule = true;
var utils_1 = require("../utils/utils");
var PanelView = /** @class */ (function () {
    function PanelView(eventsObj) {
        this.checkBoxArray = [];
        this.safeToLock = [];
        this.eventsObj = eventsObj;
    }
    PanelView.prototype.onStorageFull = function (storage, stateContext) {
        this.stateContext = stateContext;
        this.treeView(storage);
        this.sendIndeterminateStates();
    };
    PanelView.prototype.treeView = function (storage) {
        var _this = this;
        ["desktop", "portrait", "landscape"].forEach(function (platform) {
            _this.createJSONForPlatform(platform, storage);
        });
        this.createSubmitButton();
    };
    PanelView.prototype.sendIndeterminateStates = function () {
        var _this = this;
        this.safeToLock.forEach(function (item) {
            _this.eventsObj.emit("safeToLock", item);
        });
    };
    PanelView.prototype.createJSONForPlatform = function (platform, storage) {
        var _this = this;
        var parentUL = this.constructHtml();
        this.insertParentULIntoPlatforms(parentUL, platform);
        this.leafsMap = new Map();
        storage.forEach(function (item) {
            _this.makeJsonView(item, parentUL);
        });
    };
    PanelView.prototype.makeJsonView = function (item, parentUL) {
        for (var key in item) {
            if (key === "noElement" || key === "noContainer" || key === "leaf") {
                continue;
            }
            if (!item[key].type) {
                var liObj = this.handleBaseElement(item, key, parentUL);
                this.makeJsonView(item[key], liObj);
                continue;
            }
            if (item[key].type === "container") {
                this.handleContainerElement(item, parentUL, key);
                continue;
            }
            this.handleLeafs(item, key, parentUL);
        }
    };
    PanelView.prototype.handleContainerElement = function (item, liObj, key) {
        if (item[key].parent) {
            this.handleNestedChildElement(item, key, item[key].parent);
            return;
        }
        this.handleBaseChildElement(item, liObj["containers"], key);
    };
    PanelView.prototype.handleLeafs = function (item, key, liObj) {
        if (item[key].parent) {
            this.handleLeafsWithParent(item[key].id, item[key].parent, item[key].type);
            return;
        }
        this.handleLeafsWithoutParent(item[key].id, liObj, item[key].type);
    };
    PanelView.prototype.handleLeafsWithoutParent = function (key, liObj, type) {
        this.checkBoxArray.push(this.insertCheckbox(key, liObj["elements"], type));
    };
    PanelView.prototype.handleLeafsWithParent = function (key, parent, type) {
        var refObj = this.leafsMap.get(parent);
        this.checkBoxArray.push(this.insertCheckbox(key, refObj["elements"], type));
    };
    PanelView.prototype.handleBaseElement = function (item, key, parentUL) {
        var liObj = this.insertLIToUL(item, parentUL, key);
        this.setLeafsMap(key, liObj);
        this.addContainerCheckbox(liObj["base"]);
        return liObj;
    };
    PanelView.prototype.handleBaseChildElement = function (item, parentUL, key) {
        var liObj = this.insertLIToUL(item, parentUL, key);
        this.setLeafsMap(key, liObj);
        this.addContainerCheckbox(liObj["base"]);
    };
    PanelView.prototype.handleNestedChildElement = function (item, key, parent) {
        var refObj = this.leafsMap.get(parent);
        var liObj = this.insertLIToUL(item, refObj["containers"], key);
        this.setLeafsMap(key, liObj);
        this.addContainerCheckbox(liObj["base"]);
    };
    PanelView.prototype.addContainerCheckbox = function (baseUL, type) {
        var baseLI = baseUL.parentElement;
        var childInput = this.insertContainerCheckbox(baseLI);
        childInput.checked = this.stateContext.isChecked(childInput, "");
        childInput.disabled = this.stateContext.isDisabled(childInput, type, true);
        this.isSafeToLock(childInput);
        this.checkBoxArray.push(childInput);
    };
    PanelView.prototype.insertLIToUL = function (item, parentUL, key) {
        var baseUL = this.insertLIAndUL(key, parentUL);
        var liObj = this.addContainersAndElements(item[key], baseUL);
        if (item[key].leaf === true) {
            utils_1.utils.getLISpan(baseUL.parentElement).classList.remove("cursor");
        }
        liObj["base"] = baseUL;
        return liObj;
    };
    PanelView.prototype.insertLIAndUL = function (key, parentUL) {
        var baseLI = document.createElement("li");
        var spanLI = this.addSpan(baseLI, key, "cursor");
        this.subscribeListListener(spanLI);
        var baseUL = document.createElement("ul");
        baseLI.append(baseUL);
        baseUL.className = "nested";
        parentUL.append(baseLI);
        return baseUL;
    };
    PanelView.prototype.addContainersAndElements = function (item, baseUL) {
        var containerUL = item.leaf || item.noContainer ? null : this.insertLIAndUL("Containers", baseUL);
        var elementUL = item.leaf || item.noElement ? null : this.insertLIAndUL("Elements", baseUL);
        containerUL && this.addContainerCheckbox(containerUL);
        elementUL && this.addContainerCheckbox(elementUL);
        return {
            containers: containerUL,
            elements: elementUL
        };
    };
    PanelView.prototype.addSpan = function (baseLI, key, className, type) {
        var spanLI = document.createElement("span");
        spanLI.innerText = type ? key + " [" + type + "]" : key;
        if (className)
            spanLI.className = className;
        baseLI.append(spanLI);
        return spanLI;
    };
    PanelView.prototype.subscribeListListener = function (spanLI) {
        var _this = this;
        spanLI.addEventListener("click", function (event) {
            _this.eventsObj.emit("liClick", event);
        });
    };
    PanelView.prototype.setLeafsMap = function (key, liObj) {
        this.leafsMap.set(key, liObj);
    };
    PanelView.prototype.createSubmitButton = function () {
        var submitButton = document.createElement("button");
        submitButton.type = "button";
        submitButton.innerText = "Generate";
        submitButton.className = "submit";
        document.body.append(submitButton);
        this.subscribeButtonListener(submitButton);
    };
    PanelView.prototype.subscribeButtonListener = function (submitButton) {
        var _this = this;
        submitButton.addEventListener("click", function () {
            _this.eventsObj.emit("submitClick");
        });
    };
    PanelView.prototype.insertContainerCheckbox = function (parentLI) {
        var _this = this;
        var childInput = document.createElement("input");
        childInput.type = "checkbox";
        parentLI.prepend(childInput);
        childInput.addEventListener("click", function (event) {
            _this.eventsObj.emit("ContainerClick", event);
        });
        return childInput;
    };
    PanelView.prototype.insertCheckbox = function (key, parentUL, type) {
        var _this = this;
        var childLI = document.createElement("li");
        this.addSpan(childLI, key, null, type);
        var childInput = this.insertContainerCheckbox(childLI);
        parentUL.append(childLI);
        childInput.checked = this.stateContext.isChecked(childInput, key);
        childInput.disabled = this.stateContext.isDisabled(childInput);
        childInput.addEventListener("click", function (event) {
            _this.eventsObj.emit("ElementClick", event);
        });
        this.isSafeToLock(childInput);
        return childInput;
    };
    PanelView.prototype.isSafeToLock = function (childInput) {
        if (childInput.checked && childInput.disabled && utils_1.utils.isSafeToLock(childInput)) {
            this.safeToLock.push(childInput);
        }
    };
    PanelView.prototype.insertParentULIntoPlatforms = function (parentUL, platform) {
        var platformLI = document.createElement("li");
        var spanLI = this.addSpan(platformLI, platform, "cursor");
        this.subscribeListListener(spanLI);
        platformLI.append(parentUL);
        this.addContainerCheckbox(parentUL, true);
        document.body.append(platformLI);
    };
    PanelView.prototype.constructHtml = function () {
        var body;
        if (!document.body) {
            body = document.createElement("body");
        }
        else {
            body = document.body;
        }
        body.className = "dark";
        document.documentElement.appendChild(body);
        var parentUL = document.createElement("ul");
        parentUL.id = "parentUL";
        parentUL.className = "nested";
        return parentUL;
    };
    return PanelView;
}());
exports.PanelView = PanelView;
