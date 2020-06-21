import {PanelModel} from "./model/PanelModel";
import * as EventEmitter from "events";
import {StateContext} from "./states/context";
import {PanelControllerApp} from "./controller/PanelControllerApp";
import {PanelViewApp} from "./view/PanelViewApp";
import {SelfPanelModel} from "./model/SelfPanelModel";
import {SelfPanelView} from "./view/SelfPanelView";
import {SelfPanelController} from "./controller/SelfPanelController";
import {MappingView} from "./view/MappingView";

function main() {
    const eventsObj = new EventEmitter();
    const stateContext = new StateContext();
    const modelObj = new PanelModel(eventsObj);
    const viewObj = new PanelViewApp(eventsObj);
    const mappingViewObj = new MappingView(eventsObj);
    new PanelControllerApp(eventsObj, viewObj, mappingViewObj, modelObj, stateContext);
    const selfEventsObj = new EventEmitter();
    const selfModelObj = new SelfPanelModel(selfEventsObj);
    const selfViewObj = new SelfPanelView(selfEventsObj);
    new SelfPanelController(selfEventsObj, selfViewObj, mappingViewObj, selfModelObj, stateContext)
}
main();