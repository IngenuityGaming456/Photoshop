import {PanelModel} from "./model/PanelModel";
import * as EventEmitter from "events";
import {StateContext} from "./states/context";
import {PanelControllerApp} from "./controller/PanelControllerApp";
import {PanelViewApp} from "./view/PanelViewApp";

function main() {
    const eventsObj = new EventEmitter();
    const stateContext = new StateContext();
    const modelObj = new PanelModel(eventsObj);
    const viewObj = new PanelViewApp(eventsObj);
    new PanelControllerApp(eventsObj, viewObj, modelObj, stateContext);
}
main();