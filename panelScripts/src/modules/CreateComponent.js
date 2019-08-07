"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Restructure_1 = require("./Restructure");
var path = require("path");
var CreateComponent = /** @class */ (function () {
    function CreateComponent() {
    }
    CreateComponent.prototype.execute = function (generator, element, componentsMap, activeDocument) {
        var _this = this;
        this._generator = generator;
        var elementValue = componentsMap.get(element);
        var sequenceId = Restructure_1.Restructure.sequenceStructure(elementValue);
        this.callComponentJsx(sequenceId, element)
            .then(function (id) {
            return new Promise(function (resolve) {
                _this._generator.setLayerSettingsForPlugin(elementValue.label, id, "type")
                    .then(function () {
                    resolve(id);
                });
            });
        })
            .then(function (id) {
            var controlledArray = elementValue.elementArray;
            controlledArray.push({ id: id, sequence: sequenceId });
        });
    };
    CreateComponent.prototype.callComponentJsx = function (sequenceId, jsxName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var jsxPath = path.join(__dirname, "../../jsx/" + jsxName + ".jsx");
            _this._generator.evaluateJSXFile(jsxPath, { clicks: sequenceId })
                .then(function (id) { return resolve(id); })
                .catch(function (err) { return reject(err); });
        });
    };
    return CreateComponent;
}());
exports.CreateComponent = CreateComponent;
//# sourceMappingURL=CreateComponent.js.map