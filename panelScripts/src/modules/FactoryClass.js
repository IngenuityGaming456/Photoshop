"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var FactoryClass = /** @class */ (function () {
    function FactoryClass(params) {
        this.params = params;
    }
    FactoryClass.prototype.construct = function (factoryConstruct, dependencies) {
        var dependentObjs = [];
        dependencies.forEach(function (item) {
            dependentObjs.push(new item());
        });
        if (dependentObjs.length) {
            return new (factoryConstruct.bind.apply(factoryConstruct, __spread([void 0], dependentObjs)))();
        }
        return new factoryConstruct();
    };
    FactoryClass.prototype.execute = function (factory) {
        factory.execute(this.params);
    };
    return FactoryClass;
}());
exports.FactoryClass = FactoryClass;
var factoryClass;
exports.inject = function (params) {
    factoryClass = new FactoryClass(params);
    return factoryClass.construct(params.ref, params.dep);
};
exports.execute = function (factory) {
    factoryClass.execute(factory);
};
//# sourceMappingURL=FactoryClass.js.map