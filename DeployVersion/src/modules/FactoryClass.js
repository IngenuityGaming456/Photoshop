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
    function FactoryClass() {
        this.dependencyMap = new Map();
        this.cache = new Map();
    }
    FactoryClass.getInstance = function () {
        if (FactoryClass.instance) {
            return FactoryClass.instance;
        }
        FactoryClass.instance = new FactoryClass();
        return FactoryClass.instance;
    };
    FactoryClass.prototype.construct = function (factoryConstruct, dependencies, isNonSingleton) {
        var _this = this;
        if (this.cache.get(factoryConstruct)) {
            return this.cache.get(factoryConstruct);
        }
        var instance = new (factoryConstruct.bind.apply(factoryConstruct, __spread([void 0], dependencies.map(function (item) { return _this.construct(item, _this.getItemDependencies(item), isNonSingleton); }))))();
        if (!isNonSingleton) {
            this.cache.set(factoryConstruct, instance);
        }
        return instance;
    };
    FactoryClass.prototype.getItemDependencies = function (item) {
        if (!this.dependencyMap.get(item)) {
            return item.deps ? item.deps : [];
        }
        return this.dependencyMap.get(item);
    };
    Object.defineProperty(FactoryClass, "factoryInstance", {
        set: function (ref) {
            FactoryClass.instance = ref;
        },
        enumerable: true,
        configurable: true
    });
    return FactoryClass;
}());
exports.FactoryClass = FactoryClass;
exports.inject = function (params) {
    var factoryClass = FactoryClass.getInstance();
    factoryClass.dependencyMap.set(params.ref, params.dep);
    params.isNonSingleton = params.isNonSingleton ? params.isNonSingleton : false;
    return factoryClass.construct(params.ref, params.dep, params.isNonSingleton);
};
exports.execute = function (factory, params) {
    factory.execute(params);
};
//# sourceMappingURL=FactoryClass.js.map