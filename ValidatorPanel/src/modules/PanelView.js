"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelView = void 0;
class PanelView {
    constructor(eventsObj) {
        this.mappedLi = new Map();
        this.eventsObj = eventsObj;
        this.drawBody();
        this.createStatusBox();
        this.createErrorsBox();
    }
    createStatusBox() {
        this.handleStatusHTML();
    }
    createErrorsBox() {
        this.handleErrorsHTML();
    }
    handleStatusHTML() {
        this.statusUL = this.drawHTML("Status");
    }
    handleErrorsHTML() {
        this.errorUL = this.drawHTML("Errors & Warnings");
    }
    onWarning(logString) {
        this.createLIBox(logString, "#ff9511", this.errorUL, "error");
    }
    onStatusMessage(message) {
        this.createLIBox(message, "#2dff09", this.statusUL, "status");
    }
    createLIBox(innerText, color, parent, ulString) {
        const li = document.createElement("li");
        const date = new Date();
        li.innerText = innerText + `   [${date.getHours()}hr ${date.getMinutes()}min ${date.getMilliseconds()}msec]`;
        this.setElementColour(li, color);
        parent.append(li);
        if (ulString) {
            this.storeStatus(innerText, color, ulString);
        }
        this.scrollPage(li);
        return li;
    }
    scrollPage(item) {
        const rect = item.getBoundingClientRect();
        window.scrollTo(0, rect.top);
        console.log(rect.top, rect.right, rect.bottom, rect.left);
    }
    onWriteData(item) {
        if (item.ulString === "status") {
            this.createLIBox(item.text, item.color, this.statusUL, null);
        }
        else {
            this.createLIBox(item.text, item.color, this.errorUL, null);
        }
    }
    handleErrorRemoval(id) {
        const mappedLi = this.mappedLi.get(id);
        mappedLi.parentElement.removeChild(mappedLi);
    }
    onError(id, key, logString) {
        const liRef = this.createLIBox(logString, "#ff1a15", this.errorUL, "error");
        this.mappedLi.set(id, liRef);
    }
    storeStatus(innerText, color, ulString) {
        this.eventsObj.emit("writeData", {
            text: innerText,
            color: color,
            ulString: ulString
        });
    }
    drawBody() {
        const body = document.createElement("body");
        body.className = "dark";
        document.documentElement.appendChild(body);
    }
    drawHTML(paraText) {
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
    setElementColour(ref, colour) {
        ref.style.color = colour;
    }
    enablePage() {
        if (this.disableDiv) {
            document.body.removeChild(this.disableDiv);
            this.disableDiv = null;
        }
    }
    disablePage() {
        if (!this.disableDiv) {
            this.disableDiv = document.createElement("div");
            this.disableDiv.className = "disable";
            document.body.prepend(this.disableDiv);
        }
    }
}
exports.PanelView = PanelView;
//# sourceMappingURL=PanelView.js.map