import {PhotoshopJsonComponent, QuestJsonComponent} from "./JsonComponents";

export class JsonComponentsFactory {

    public static makeJsonComponentsMap() {
        let jsonMap = new Map();
        let unifiedPath: string = "../../../jsx/";
        jsonMap.set("image", new PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx"))
            .set("shape", new PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx"))
            .set("label", new PhotoshopJsonComponent("artLayer", unifiedPath + "InsertLayer.jsx",
                "text"))
               .set("container", new PhotoshopJsonComponent("layerSection", unifiedPath + "InsertLayer.jsx"))
               .set("meter", new QuestJsonComponent("meter", unifiedPath + "AddMeter.jsx"))
               .set("spine", new QuestJsonComponent("spine", unifiedPath + "AddSpine.jsx"))
               .set("button", new QuestJsonComponent("button", unifiedPath + "AddButton.jsx"))
               .set("animation", new QuestJsonComponent("animation", unifiedPath + "AddAnimation.jsx"));
        return jsonMap;
    }
}