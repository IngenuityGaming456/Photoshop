"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils/utils");
var FactoryClass_1 = require("./FactoryClass");
var Validation_1 = require("./Validation");
var ValidationManager = /** @class */ (function () {
    function ValidationManager() {
        this.questContainers = [];
    }
    ValidationManager.prototype.execute = function (params) {
        this.generator = params.generator;
        this.storage = params.storage;
        this.filterContainers();
        this.injectValidator();
        this.subscribeListeners();
    };
    ValidationManager.prototype.subscribeListeners = function () {
        var _this = this;
        this.generator.on("handleValidation", function (event) { return _this.handlePhotoshopEvents(event); });
    };
    ValidationManager.prototype.injectValidator = function () {
        this.validator = FactoryClass_1.inject({ ref: Validation_1.Validation, dep: [] });
        FactoryClass_1.execute(this.validator, { storage: this.questContainers });
    };
    ValidationManager.prototype.filterContainers = function () {
        var _this = this;
        this.storage.forEach(function (item) {
            _this.storeContainers(item);
        });
    };
    ValidationManager.prototype.storeContainers = function (item) {
        var _this = this;
        Object.keys(item).forEach(function (key) {
            if (!item[key].type) {
                _this.pushToContainer(key);
                _this.storeContainers(item[key]);
            }
            else {
                if (item[key].type === "container") {
                    _this.pushToContainer(key);
                }
            }
        });
    };
    ValidationManager.prototype.pushToContainer = function (key) {
        if (!utils_1.utlis.isKeyExists(this.questContainers, key)) {
            this.questContainers.push(key);
        }
    };
    ValidationManager.prototype.handlePhotoshopEvents = function (event) {
        if (event.layers && !event.added && event.layers[0].name) {
            this.validator.isInHTML(event.layers[0].name, this.questContainers);
        }
    };
    return ValidationManager;
}());
exports.ValidationManager = ValidationManager;
//# sourceMappingURL=ValidationManager.js.map