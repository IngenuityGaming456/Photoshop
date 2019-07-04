"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Restructure_1 = require("./Restructure");
var path = require("path");
var CreateComponent = /** @class */ (function () {
    function CreateComponent(generator, element, componentsMap) {
        var _this = this;
        this._generator = generator;
        var elementValue = componentsMap.get(element);
        var sequenceId = Restructure_1.Restructure.sequenceStructure(elementValue);
        this.callComponentJsx(sequenceId, element)
            .then(function (id) {
            _this._generator.setLayerSettingsForPlugin(elementValue.displayName, id, "LayoutPlugin");
            var controlledArray = elementValue.elementArray;
            controlledArray.push({ id: id, sequence: sequenceId });
        });
    }
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