"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var utils_1 = require("../utils/utils");
var PanelModel = /** @class */ (function () {
    function PanelModel(eventsObj) {
        this.storage = [];
        this.jsonMap = new Map();
        this.checkBoxArray = [];
        this.eventsObj = eventsObj;
        this.fillStorage();
        this.subscribeListeners();
    }
    PanelModel.prototype.fillStorage = function () {
        var _this = this;
        var folderPath = path.join(__dirname, "js/res");
        fs.readdirSync(folderPath).forEach(function (fileName) {
            var jsonObject = window.require(folderPath + "/" + fileName);
            _this.storage.push(jsonObject);
            var keysArray = Object.keys(jsonObject);
            keysArray.forEach(function (key) {
                _this.jsonMap.set(key, jsonObject[key]);
            });
        });
    };
    PanelModel.prototype.subscribeListeners = function () {
        this.eventsObj.on("ControllerInitialized", this.storageReady.bind(this));
    };
    PanelModel.prototype.storageReady = function (stateContext) {
        this.stateContext = stateContext;
    };
    PanelModel.prototype.processResponse = function (responseArray, checkedBoxes) {
        var _this = this;
        this.writeSession(checkedBoxes);
        var responseJsonMap = this.createResponseMap();
        responseArray.forEach(function (hierarchyObj) {
            var hierarchy = hierarchyObj.hierarchy;
            var platformMap = responseJsonMap.get(hierarchyObj.platform);
            if (!hierarchy) {
                platformMap.set("base", true);
            }
            else {
                var splicedString = utils_1.utils.spliceLastTillLast(hierarchy, ",");
                var jsonObj = _this.jsonMap.get(splicedString);
                var responseObj = platformMap.get(splicedString);
                _this.fillResponseMap(jsonObj, responseObj[splicedString], utils_1.utils.spliceLastFromFront(hierarchy, ","));
            }
        });
        this.eventsObj.emit("jsonProcessed", responseJsonMap, checkedBoxes);
    };
    PanelModel.prototype.writeSession = function (checkedBoxes) {
        fs.writeFile(window.require('os').homedir() + "/" + this.docId + "/" + "CachePanel.json", JSON.stringify({
            checkedBoxes: checkedBoxes
        }), function (err) {
            if (err) {
                console.log(err);
            }
        });
    };
    PanelModel.prototype.createResponseMap = function () {
        var _this = this;
        var jsonMap = new Map();
        ["desktop", "portrait", "landscape"].forEach(function (platform) {
            var viewJsonMap = _this.createViewJsonMap();
            jsonMap.set(platform, viewJsonMap);
        });
        return jsonMap;
    };
    PanelModel.prototype.createViewJsonMap = function () {
        var responseJsonMap = new Map();
        this.storage.forEach(function (jsonObject) {
            var keysArray = Object.keys(jsonObject);
            keysArray.forEach(function (key) {
                var _a;
                responseJsonMap.set(key, (_a = {}, _a[key] = {}, _a));
            });
        });
        return responseJsonMap;
    };
    PanelModel.prototype.fillResponseMap = function (jsonObj, responseObj, hierarchy) {
        var _this = this;
        var hierarchyArray = hierarchy.split(",");
        hierarchyArray.forEach(function (item) {
            var insertionKey = _this.getInsertionObj(item, jsonObj);
            if (!insertionKey) {
                responseObj["base"] = true;
            }
            else {
                responseObj[insertionKey] = jsonObj[insertionKey];
            }
        });
    };
    PanelModel.prototype.getInsertionObj = function (item, jsonObj) {
        for (var key in jsonObj) {
            if (jsonObj[key].id === item) {
                return key;
            }
        }
    };
    PanelModel.prototype.onDocOpen = function (directory, docId) {
        this.docId = docId;
        this.checkIfJsonStorageExists(directory, docId);
    };
    PanelModel.prototype.checkIfJsonStorageExists = function (directory, docId) {
        var data;
        try {
            data = fs.readFileSync(window.require('os').homedir() + "/" + docId + "/" + "CachePanel.json", { encoding: "utf8" });
        }
        catch (err) {
            try {
                data = fs.readFileSync(directory + "\\" + docId + "/CheckedBoxes.json", { encoding: "utf8" });
            }
            catch (err) {
                console.log("HTML PAGE IS GETTING RENDERED FOR THE FIRST TIME");
                this.stateContext.setState(this.stateContext.firstRenderState());
            }
        }
        if (data) {
            this.checkBoxArray = JSON.parse(data).checkedBoxes;
            this.stateContext.setState(this.stateContext.otherRendersState());
            this.stateContext.fillStorage(JSON.parse(data));
        }
        this.eventsObj.emit("StorageFull", this.storage);
    };
    return PanelModel;
}());
exports.PanelModel = PanelModel;
