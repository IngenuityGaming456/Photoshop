"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventsManager = /** @class */ (function () {
    function EventsManager() {
    }
    EventsManager.prototype.execute = function (params) {
        this.generator = params.generator;
        this.isAddedEvent(params.events);
        this.isDeletionEvent(params.events);
        this.isRenameEvent(params.events);
    };
    EventsManager.prototype.isAddedEvent = function (event) {
        if (event.layers && this.isAdded(event.layers)) {
            this.generator.emit("layersAdded", event.layers);
        }
    };
    EventsManager.prototype.isDeletionEvent = function (event) {
        if (event.layers && this.isDeletion(event.layers)) {
            this.generator.emit("layersDeleted", event.layers);
        }
    };
    EventsManager.prototype.isRenameEvent = function (event) {
        if (event.layers && !event.added && event.layers[0].name) {
            this.generator.emit("layerRenamed", event.layers);
        }
    };
    EventsManager.prototype.isAdded = function (layers) {
        var layersCount = layers.length;
        for (var i = 0; i < layersCount; i++) {
            var subLayer = layers[i];
            if (subLayer.hasOwnProperty("added")) {
                return true;
            }
            if (subLayer.hasOwnProperty("layers")) {
                return this.isAdded(subLayer.layers);
            }
        }
    };
    EventsManager.prototype.isDeletion = function (layers) {
        var layersCount = layers.length;
        for (var i = 0; i < layersCount; i++) {
            var subLayer = layers[i];
            if (subLayer.hasOwnProperty("removed")) {
                return true;
            }
        }
    };
    return EventsManager;
}());
exports.EventsManager = EventsManager;
// if(!event.layers[0].added && (event.layers[0].removed || event.layers[0].name)) {
//     componentsMap.forEach(item => {
//         Restructure.searchAndModifyControlledArray(event.layers, item);
//     });
// }
// _layerManager.addBufferData(event.layers);
//# sourceMappingURL=EventsManager.js.map