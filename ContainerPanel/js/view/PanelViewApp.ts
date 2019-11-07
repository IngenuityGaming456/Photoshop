import {PanelView} from "./PanelView";

export class PanelViewApp extends PanelView {

    private disableDiv;

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