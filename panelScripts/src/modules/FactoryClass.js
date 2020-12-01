"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.inject = exports.FactoryClass = void 0;
const Loading_1 = require("../../srcExtension/loader/Loading");
class FactoryClass {
    constructor() {
        this.dependencyMap = new Map();
        this.cache = new Map();
    }
    static getInstance() {
        if (FactoryClass.instance) {
            return FactoryClass.instance;
        }
        FactoryClass.instance = new FactoryClass();
        return FactoryClass.instance;
    }
    construct(factoryConstruct, dependencies, isNonSingleton) {
        if (this.cache.get(factoryConstruct)) {
            return this.cache.get(factoryConstruct);
        }
        const instance = new factoryConstruct(...dependencies.map(item => this.construct(item, this.getItemDependencies(item), isNonSingleton)));
        if (!isNonSingleton) {
            this.cache.set(factoryConstruct, instance);
        }
        return instance;
    }
    getItemDependencies(item) {
        if (!this.dependencyMap.get(item)) {
            return item.deps ? item.deps : [];
        }
        return this.dependencyMap.get(item);
    }
    static set factoryInstance(ref) {
        FactoryClass.instance = ref;
    }
}
exports.FactoryClass = FactoryClass;
const inject = function (params) {
    const factoryClass = FactoryClass.getInstance();
    const subClassRef = Loading_1.loadingMap.get(params.ref);
    params.ref = subClassRef ? subClassRef : params.ref;
    factoryClass.dependencyMap.set(params.ref, params.dep);
    params.isNonSingleton = params.isNonSingleton ? params.isNonSingleton : false;
    return factoryClass.construct(params.ref, params.dep, params.isNonSingleton);
};
exports.inject = inject;
const execute = function (factory, params) {
    factory.execute(params);
};
exports.execute = execute;
//# sourceMappingURL=FactoryClass.js.map