import {PhotoshopJsonComponent, QuestJsonComponent} from "./JsonComponents";

export class JsonComponentsFactory {

    public static makeJsonComponentsMap() {
        let jsonMap = new Map();
        let unifiedPath: string = "../../../jsx/";
        jsonMap.set("image", new PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx"));
        jsonMap.set("shape", new PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx"));
        jsonMap.set("label", new PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx",
            "text"));
        jsonMap.set("container", new PhotoshopJsonComponent("layerSection", unifiedPath + "InsertLayer.jsx"));
        jsonMap.set("meter", new QuestJsonComponent("meter", unifiedPath + "AddMeter.jsx"));
        jsonMap.set("spine", new QuestJsonComponent("spine", unifiedPath + "AddSpine.jsx"));
        jsonMap.set("button", new QuestJsonComponent("button", unifiedPath + "AddButton.jsx"));
        jsonMap.set("animation", new QuestJsonComponent("animation", unifiedPath + "AddAnimation.jsx"));
        return jsonMap;
    }
}