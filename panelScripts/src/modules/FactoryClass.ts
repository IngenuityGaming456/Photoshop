import {IClassParams, IFactory, IFactoryConstruct, IParams} from "../interfaces/IJsxParam";
import {loadingMap} from "../../srcExtension/loader/Loading";

export class FactoryClass {
    public dependencyMap = new Map();
    public cache = new Map<IFactoryConstruct, IFactory>();
    private static instance;
    
    public static getInstance() {
        if(FactoryClass.instance) {
            return FactoryClass.instance;
        }
        FactoryClass.instance = new FactoryClass();
        return FactoryClass.instance;
    }
    
    public construct(factoryConstruct: IFactoryConstruct, dependencies: Array<any>, isNonSingleton): any {
        if(this.cache.get(factoryConstruct))  {
            return this.cache.get(factoryConstruct);
        }
        const instance = new factoryConstruct(...dependencies.map(item => this.construct(item, this.getItemDependencies(item), isNonSingleton)));
        if (!isNonSingleton) {
            this.cache.set(factoryConstruct, instance);
        }
        return instance;
    }

    private getItemDependencies(item: any) {
        if(!this.dependencyMap.get(item)) {
            return item.deps ? item.deps : [];
        }
        return this.dependencyMap.get(item);
    }

    static set factoryInstance(ref) {
        FactoryClass.instance = ref;
}

}

export const inject = function (params: IClassParams): any {
    const factoryClass = FactoryClass.getInstance();
    const subClassRef = loadingMap.get(params.ref);
    params.ref = subClassRef ? subClassRef : params.ref;
    factoryClass.dependencyMap.set(params.ref, params.dep);
    params.isNonSingleton = params.isNonSingleton ? params.isNonSingleton : false;
    return factoryClass.construct(params.ref, params.dep, params.isNonSingleton);
};

export const execute = function(factory: IFactory, params: IParams) {
    factory.execute(params);
};