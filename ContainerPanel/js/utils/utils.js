"use strict";
exports.__esModule = true;
var utils = /** @class */ (function () {
    function utils() {
    }
    utils.spliceFromFront = function (key, char) {
        var indexOfLine = key.indexOf(char);
        if (indexOfLine > -1) {
            return key.slice(0, indexOfLine);
        }
        return key;
    };
    utils.spliceTillLast = function (key, char) {
        var indexOfLine = key.indexOf(char);
        if (indexOfLine > -1) {
            return key.slice(indexOfLine + 1);
        }
        return key;
    };
    utils.spliceLastTillLast = function (key, char) {
        var indexOfLine = key.lastIndexOf(char);
        if (indexOfLine > -1) {
            return key.slice(indexOfLine + 1);
        }
        return key;
    };
    utils.spliceLastFromFront = function (key, char) {
        var indexOfLine = key.lastIndexOf(char);
        if (indexOfLine > -1) {
            return key.slice(0, indexOfLine);
        }
        return key;
    };
    utils.getParentLI = function (childInput) {
        var parent = childInput.parentElement;
        if (parent.tagName === "BODY") {
            return null;
        }
        if (parent.tagName === "LI") {
            return parent;
        }
        else {
            return utils.getParentLI(parent);
        }
    };
    utils.mapToObject = function (map) {
        var obj = {};
        for (var _i = 0, map_1 = map; _i < map_1.length; _i++) {
            var _a = map_1[_i], key = _a[0], value = _a[1];
            if (value instanceof Map) {
                obj[key] = utils.mapToObject(value);
            }
            else {
                obj[key] = value;
            }
        }
        return obj;
    };
    utils.objectToMap = function (obj) {
        var map = new Map();
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var key = _a[_i];
            if (obj[key] instanceof Object) {
                map.set(key, utils.objectToMap(obj[key]));
            }
            else {
                map.set(key, obj[key]);
            }
        }
        return map;
    };
    utils.getView = function (item) {
        if (!item.parentElement) {
            return null;
        }
        if (item.parentElement.id === "parentUL") {
            return utils.getLISpan(item).childNodes[0].nodeValue;
        }
        return utils.getView(item.parentElement);
    };
    utils.getViewInput = function (item) {
        if (item.parentElement.id === "parentUL") {
            return utils.getLIInput(item);
        }
        return utils.getViewInput(item.parentElement);
    };
    utils.getLIInput = function (itemRef) {
        for (var _i = 0, _a = Array.from(itemRef.children); _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.tagName === "INPUT") {
                return item;
            }
        }
    };
    utils.getPlatformInput = function (item) {
        if (item.parentElement === document.body) {
            return utils.getLIInput(item);
        }
        return utils.getPlatformInput(item.parentElement);
    };
    utils.pushToCheckBoxes = function (checkedBoxes, item, hierarchyObj) {
        if (item.checked && item.parentElement.tagName === "LI") {
            if (!utils.decideCheck(item.parentElement)) {
                checkedBoxes.push({
                    platform: hierarchyObj.platform,
                    view: null,
                    key: null
                });
                return;
            }
            var parentLI = utils.getParentLI(item);
            checkedBoxes.push({
                platform: hierarchyObj.platform,
                view: utils.getView(item),
                key: utils.getLISpan(parentLI).childNodes[0].nodeValue
            });
        }
        else {
            checkedBoxes.push({
                platform: hierarchyObj.platform,
                view: utils.getView(item),
                key: item.childNodes[0].nodeValue
            });
        }
    };
    utils.getData = function (item) {
        if (!item.parentElement || item.parentElement === document.body) {
            return {
                view: null,
                platform: utils.getLISpan(item).childNodes[0].nodeValue
            };
        }
        if (item.parentElement.id === "parentUL") {
            var data = {
                view: utils.getLISpan(item).childNodes[0].nodeValue,
                platform: utils.getLISpan(item.parentElement.parentElement).childNodes[0].nodeValue
            };
            return data;
        }
        return utils.getData(item.parentElement);
    };
    utils.isInBaseView = function (baseView, item) {
        var view = utils.getView(item);
        return view === baseView;
    };
    utils.isInPlatform = function (platform, item) {
        return utils.getData(item).platform === platform;
    };
    utils.getChildrenUL = function (baseLI) {
        var liChildren = Array.from(baseLI.children);
        for (var _i = 0, liChildren_1 = liChildren; _i < liChildren_1.length; _i++) {
            var item = liChildren_1[_i];
            if (~item.className.search(/(nested|active)/)) {
                return item;
            }
        }
    };
    utils.getLISpan = function (baseLI) {
        var liChildren = Array.from(baseLI.children);
        for (var _i = 0, liChildren_2 = liChildren; _i < liChildren_2.length; _i++) {
            var item = liChildren_2[_i];
            if (item.tagName === "SPAN") {
                return item;
            }
        }
    };
    utils.getItem = function (item) {
        return utils.getLISpan(item.parentElement);
    };
    utils.decideCheck = function (item) {
        var value = utils.getLISpan(item).childNodes[0].nodeValue.search(/(desktop|portrait|landscape)/);
        return value === -1;
    };
    utils.isInContainerOrElement = function (parentLI) {
        return parentLI && ~utils.getLISpan(parentLI).childNodes[0].nodeValue.search(/(Containers|Elements)/);
    };
    utils.setIntermediateState = function (inputCheckbox) {
        var parentLI = utils.getParentLI(utils.getParentLI(inputCheckbox));
        if (parentLI && ~utils.getLISpan(parentLI).childNodes[0].nodeValue.search(/(Containers|Elements)/)) {
            var checkBoxDeletionCount = utils.getCheckboxDeletion(parentLI);
            try {
                utils.setNoDeletionState(checkBoxDeletionCount, parentLI)
                    .setAllDeletedState(checkBoxDeletionCount, parentLI)
                    .setInBetweenState(parentLI);
            }
            catch (err) {
                console.log("Intermediate state done");
            }
        }
    };
    utils.getCheckboxDeletion = function (parentLI) {
        var parentUL = utils.getChildrenUL(parentLI);
        var checkboxDeletionCount = 0;
        var childArray = Array.from(parentUL.children);
        for (var _i = 0, childArray_1 = childArray; _i < childArray_1.length; _i++) {
            var item = childArray_1[_i];
            var itemCheckbox = item.children[0];
            if (!itemCheckbox.checked) {
                checkboxDeletionCount++;
            }
        }
        return checkboxDeletionCount;
    };
    utils.setNoDeletionState = function (checkboxDeletionCount, parentLI) {
        if (!checkboxDeletionCount) {
            parentLI.children[0].indeterminate = false;
            parentLI.children[0].checked = true;
            throw new Error("Done");
        }
        return utils;
    };
    utils.setAllDeletedState = function (checkboxDeletionCount, parentLI) {
        var parentUL = utils.getChildrenUL(parentLI);
        var childArray = Array.from(parentUL.children);
        var length = childArray.length;
        if (checkboxDeletionCount === length) {
            parentLI.children[0].indeterminate = false;
            parentLI.children[0].checked = false;
            throw new Error("Done");
        }
        return utils;
    };
    utils.setInBetweenState = function (parentLI) {
        parentLI.children[0].indeterminate = true;
        parentLI.children[0].checked = false;
    };
    utils.isSafeToLock = function (output) {
        var spanString = utils.getLISpan(utils.getParentLI(output)).childNodes[0].nodeValue;
        if (spanString !== utils.getView(output) && spanString !== utils.getData(output).platform &&
            !utils.isInContainerOrElement(utils.getParentLI(output))) {
            return true;
        }
    };
    utils.isInElement = function (childInput) {
        return utils.getLISpan(utils.getParentLI(childInput)).childNodes[0].nodeValue === "Elements";
    };
    utils.isInContainer = function (childInput) {
        return utils.getLISpan(utils.getParentLI(childInput)).childNodes[0].nodeValue === "Containers";
    };
    return utils;
}());
exports.utils = utils;
