"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var PanelView_1 = require("./PanelView");
var PanelViewApp = /** @class */ (function (_super) {
    __extends(PanelViewApp, _super);
    function PanelViewApp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PanelViewApp.prototype.enablePage = function () {
        if (this.disableDiv) {
            document.body.removeChild(this.disableDiv);
            this.disableDiv = null;
        }
    };
    PanelViewApp.prototype.disablePage = function () {
        if (!this.disableDiv) {
            this.disableDiv = document.createElement("div");
            this.disableDiv.className = "disable";
            document.body.prepend(this.disableDiv);
        }
    };
    return PanelViewApp;
}(PanelView_1.PanelView));
exports.PanelViewApp = PanelViewApp;
