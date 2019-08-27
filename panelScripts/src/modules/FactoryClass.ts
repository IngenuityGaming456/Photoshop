import {IFactory, IFactoryConstruct, IParams} from "../interfaces/IJsxParam";

export class FactoryClass {

    private readonly params: IParams;

    constructor(params: IParams) {
        this.params = params;
    }

    public construct(factoryConstruct: IFactoryConstruct, dependencies): IFactory {
        let dependentObjs = [];
        dependencies.forEach(item => {
            dependentObjs.push(new item());
        });
        if(dependentObjs.length) {
            return new factoryConstruct(...dependentObjs);
        }
        return new factoryConstruct();
    }

    public execute(factory: IFactory) {
        factory.execute(this.params);
    }

}

let factoryClass;

export const inject = function (params: IParams): IFactory {
    factoryClass = new FactoryClass(params);
    return factoryClass.construct(params.ref, params.dep);
};

export const execute = function(factory: IFactory) {
    factoryClass.execute(factory);
};