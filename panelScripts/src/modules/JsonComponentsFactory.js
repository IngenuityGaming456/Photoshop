"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonComponents_1 = require("./JsonComponents");
var JsonComponentsFactory = /** @class */ (function () {
    function JsonComponentsFactory() {
    }
    JsonComponentsFactory.makeJsonComponentsMap = function () {
        var jsonMap = new Map();
        var unifiedPath = "../../../jsx/";
        jsonMap.set("image", new JsonComponents_1.PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx"))
            .set("shape", new JsonComponents_1.PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx"))
            .set("label", new JsonComponents_1.PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx", "text"))
            .set("container", new JsonComponents_1.PhotoshopJsonComponent("layerSection", unifiedPath + "InsertLayer.jsx"))
            .set("meter", new JsonComponents_1.QuestJsonComponent("meter", unifiedPath + "AddMeter.jsx"))
            .set("button", new JsonComponents_1.QuestJsonComponent("button", unifiedPath + "AddButton.jsx"))
            .set("animation", new JsonComponents_1.QuestJsonComponent("animation", unifiedPath + "AddAnimation.jsx"));
        return jsonMap;
    };
    return JsonComponentsFactory;
}());
exports.JsonComponentsFactory = JsonComponentsFactory;
//# sourceMappingURL=JsonComponentsFactory.js.map