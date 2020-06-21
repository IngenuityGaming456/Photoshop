import {EventEmitter} from "events";
import {utils} from "../utils/utils";
let mapping = require("../panel.json");


export class MappingView {
    private eventsObj;
    private panelDiv;

    public constructor(eventsObj: EventEmitter) {
        this.eventsObj = eventsObj;
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.eventsObj.on("makePanelView", () => this.makePanel());
    }

    private makePanel() {
        this.panelDiv = document.createElement("div");
        this.panelDiv.className = "panel";
        document.body.prepend(this.panelDiv);
        this.addDivChildren(this.panelDiv);
    }

    private addDivChildren(panelDiv) {
        mapping.connection.forEach(item => {
            const platformLI = this.makeLIStruct(item);
            panelDiv.append(platformLI);
        })
        const noConnectionLI = this.makeNoConnection();
        panelDiv.append(noConnectionLI);
    }

    private makeLIStruct(item) {
        const frontSpan = document.createElement("span");
        frontSpan.innerText = item["front"];
        const rearSpan = document.createElement("span");
        rearSpan.innerText = item["rear"];
        const reverseButton = document.createElement("button");
        reverseButton.innerText = "<>";
        reverseButton.className = "reverse";
        const radioButton = utils.createRadio("put", false)
        const li = document.createElement("li");
        li.append(frontSpan);
        li.append(reverseButton);
        li.append(rearSpan);
        li.append(radioButton);
        this.addListener(reverseButton, frontSpan, rearSpan);
        return li;
    }

    private makeNoConnection() {
        const singleSpan = document.createElement("span");
        singleSpan.innerText = "noConnection";
        const radioButton = utils.createRadio("put", true);
        const li = document.createElement("li");
        li.append(singleSpan);
        li.append(radioButton)
        return li;
    }

    private addListener(reverseButton, frontSpan, rearSpan) {
        reverseButton.addEventListener("click", event => {
            const temp = frontSpan.innerText;
            frontSpan.innerText = rearSpan.innerText;
            rearSpan.innerText = temp;
        })
    }

    public sendMappingResponse() {
        const children = Array.from(this.panelDiv.children);
        let response = {};
        for(let child of children) {
            const radioInput = (child as HTMLElement).querySelector("input");
            if(radioInput.checked) {
                const spanChildren = Array.from((child as HTMLElement).querySelectorAll("span"));
                if (spanChildren.length === 1) {
                    response["front"] = spanChildren[0].innerText;
                    response["rear"] = spanChildren[0].innerText;
                } else {
                    response["front"] = spanChildren[0].innerText;
                    response["rear"] = spanChildren[1].innerText;
                }
                break;
            }
        }
        return response;
    }

}