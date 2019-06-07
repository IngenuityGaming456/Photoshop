"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonComponents_1 = require("./JsonComponents");
var JsonComponentsFactory = /** @class */ (function () {
    function JsonComponentsFactory() {
    }
    JsonComponentsFactory.makeJsonComponentsMap = function () {
        var jsonMap = new Map();
        var unifiedPath = "../../../jsx/";
        jsonMap.set("image", new JsonComponents_1.PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx"));
        jsonMap.set("shape", new JsonComponents_1.PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx"));
        jsonMap.set("label", new JsonComponents_1.PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx", "text"));
        jsonMap.set("container", new JsonComponents_1.PhotoshopJsonComponent("layerSection", unifiedPath + "InsertLayer.jsx"));
        jsonMap.set("meter", new JsonComponents_1.QuestJsonComponent("meter", unifiedPath + "AddMeter.jsx"));
        jsonMap.set("spine", new JsonComponents_1.QuestJsonComponent("spine", unifiedPath + "AddSpine.jsx"));
        jsonMap.set("button", new JsonComponents_1.QuestJsonComponent("button", unifiedPath + "AddButton.jsx"));
        jsonMap.set("animation", new JsonComponents_1.QuestJsonComponent("animation", unifiedPath + "AddAnimation.jsx"));
        return jsonMap;
    };
    return JsonComponentsFactory;
}());
exports.JsonComponentsFactory = JsonComponentsFactory;
//# sourceMappingURL=JsonComponentsFactory.js.map