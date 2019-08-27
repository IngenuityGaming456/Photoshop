"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = require("events");
var EventHandler = /** @class */ (function (_super) {
    __extends(EventHandler, _super);
    function EventHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EventHandler.prototype.on = function (event, listener) {
        return _super.prototype.on.call(this, event, listener);
    };
    EventHandler.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return _super.prototype.emit.call(this, event, args);
    };
    EventHandler.prototype.once = function (event, listener) {
        return _super.prototype.once.call(this, event, listener);
    };
    return EventHandler;
}(EventEmitter));
exports.EventHandler = EventHandler;
//# sourceMappingURL=EventsManager.js.map