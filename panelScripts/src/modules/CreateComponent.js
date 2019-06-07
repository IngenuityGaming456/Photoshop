"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Restructure_1 = require("./Restructure");
var path = require("path");
var CreateComponent = /** @class */ (function () {
    function CreateComponent(generator, element, componentsMap) {
        var _this = this;
        this._generator = generator;
        this._componentsMap = componentsMap;
        var sequenceId = this.findSequence(element);
        this.callComponentJsx(sequenceId, element.label)
            .then(function (id) {
            _this._generator.setLayerSettingsForPlugin(element.displayName, id, "LayoutPlugin");
            var controlledArray = componentsMap.get(element.label).elementArray;
            controlledArray.push({ id: id, sequence: sequenceId });
        });
    }
    CreateComponent.prototype.findSequence = function (element) {
        return Restructure_1.Restructure.sequenceStructure(element, this._componentsMap);
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