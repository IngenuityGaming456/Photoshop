import {EventEmitter} from "events";
let mapping = require("../res/panel.json");


export class MappingView {
    private eventsObj;

    public constructor(eventsObj: EventEmitter) {
        this.eventsObj = eventsObj;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.eventsObj.on("makePanelView", () => this.makePanel());
    }

    private makePanel() {
        const panelDiv = document.createElement("div");
        panelDiv.className = "panel";
        document.body.prepend(panelDiv);
        this.addDivChildren(panelDiv);
    }

    private addDivChildren(panelDiv) {
        mapping.connection.forEach(item => {
            const platformLI = this.makeLIStruct(item);
            panelDiv.append(platformLI);
        })
    }

    private makeLIStruct(item) {
        const frontSpan = document.createElement("span");
        frontSpan.innerText = item["front"];
        const rearSpan = document.createElement("span");
        rearSpan.innerText = item["rear"];
        const reverseButton = document.createElement("button");
        reverseButton.innerText = "<>";
        const radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.name = "put";
        const li = document.createElement("li");
        li.append(frontSpan);
        li.append(reverseButton);
        li.append(rearSpan);
        li.append(radioButton);
        return li;
    }

}