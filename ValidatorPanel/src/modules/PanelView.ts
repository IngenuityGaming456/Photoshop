import * as EventEmitter from "events";

export class PanelView {
    private eventsObj: EventEmitter;
    private errorUL;
    private statusUL;
    private mappedLi = new Map();
    private disableDiv;

    public constructor(eventsObj: EventEmitter) {
        this.eventsObj = eventsObj;
        this.drawBody();
        this.createStatusBox();
        this.createErrorsBox();
    }

    private createStatusBox() {
        this.handleStatusHTML();
    }

    private createErrorsBox() {
        this.handleErrorsHTML();
    }

    private handleStatusHTML() {
        this.statusUL = this.drawHTML("Status");
    }

    private handleErrorsHTML() {
        this.errorUL = this.drawHTML("Errors & Warnings");
    }

    public onWarning(logString) {
        this.createLIBox(logString, "#ff9511", this.errorUL, "error");
    }

    public onStatusMessage(message) {
        this.createLIBox(message, "#2dff09", this.statusUL, "status");
    }

    private createLIBox(innerText, color, parent, ulString) {
        const li = document.createElement("li");
        const date = new Date();
        li.innerText = innerText + `   [${date. getHours()}hr ${date.getMinutes()}min ${date.getMilliseconds()}msec]`;
        this.setElementColour(li, color);
        parent.append(li);
        if(ulString) {
            this.storeStatus(innerText, color, ulString);
        }
        this.scrollPage(li);
        return li;
    }

    private scrollPage(item) {
        const rect = item.getBoundingClientRect();
        window.scrollTo(0, rect.top);
        console.log(rect.top, rect.right, rect.bottom, rect.left);
    }

    public onWriteData(item) {
        if(item.ulString === "status") {
            this.createLIBox(item.text, item.color, this.statusUL, null);
        } else {
            this.createLIBox(item.text, item.color, this.errorUL, null);
        }
    }

    public handleErrorRemoval(id) {
        const mappedLi: HTMLElement = this.mappedLi.get(id);
        mappedLi.parentElement.removeChild(mappedLi);
    }

    public onError(id, key, logString) {
        const liRef = this.createLIBox(logString, "#ff1a15", this.errorUL, "error");
        this.mappedLi.set(id, liRef);
    }

    private storeStatus(innerText, color, ulString) {
        this.eventsObj.emit("writeData", {
            text: innerText,
            color: color,
            ulString: ulString
        });
    }

    private drawBody() {
        const body = document.createElement("body");
        body.className = "dark";
        document.documentElement.appendChild(body);
    }

    private drawHTML(paraText) {
        const statusDiv = document.createElement("div");
        statusDiv.className = "panel";
        const statusPara = document.createElement("p");
        statusDiv.append(statusPara);
        const ul = document.createElement("ul");
        statusDiv.append(ul);
        document.body.append(statusDiv);
        statusPara.innerText = paraText;
        return ul;
    }

    private setElementColour(ref, colour) {
        ref.style.color = colour;
    }

    public enablePage() {
        if(this.disableDiv) {
            document.body.removeChild(this.disableDiv);
            this.disableDiv = null;
        }
    }

    public disablePage() {
        if(!this.disableDiv) {
            this.disableDiv = document.createElement("div");
            this.disableDiv.className = "disable";
            document.body.prepend(this.disableDiv);
        }
    }

}