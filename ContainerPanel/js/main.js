const PanelView_1 = require("./view/PanelView");
const PanelModel_1 = require("./model/PanelModel");
const PanelController_1 = require("./controller/PanelController");
const EventEmitter = require("events");
const eventsObj = new EventEmitter();
const modelObj = new PanelModel_1.PanelModel(eventsObj);
const viewObj = new PanelView_1.PanelView(eventsObj);
new PanelController_1.PanelController(eventsObj, viewObj, modelObj);
//# sourceMappingURL=main.js.map