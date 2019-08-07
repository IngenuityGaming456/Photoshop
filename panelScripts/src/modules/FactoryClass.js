"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FactoryClass = /** @class */ (function () {
    function FactoryClass(generator, menuName, factoryMap, activeDocument) {
        this._generator = generator;
        this._menuName = menuName;
        this._factoryMap = factoryMap;
        this._activeDocument = activeDocument;
    }
    FactoryClass.prototype.construct = function (factoryConstruct, dependencies) {
        var dependentObjs = [];
        dependencies.forEach(function (item) {
            dependentObjs.push(new item());
        });
        if (dependentObjs.length) {
            return new factoryConstruct(dependentObjs);
        }
        return new factoryConstruct();
    };
    FactoryClass.prototype.execute = function (factory) {
        factory.execute(this._generator, this._menuName, this._factoryMap, this._activeDocument);
    };
    return FactoryClass;
}());
exports.FactoryClass = FactoryClass;
//# sourceMappingURL=FactoryClass.js.map