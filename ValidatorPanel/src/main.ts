import * as EventEmitter from "events";
import {PanelView} from "./modules/PanelView";
import {PanelModel} from "./modules/PanelModel";
import {PanelController} from "./modules/PanelController";

function main() {
    const eventsObj = new EventEmitter();
    const modelObj = new PanelModel(eventsObj);
    const viewObj = new PanelView(eventsObj);
    new PanelController(eventsObj, viewObj, modelObj);
}
main();