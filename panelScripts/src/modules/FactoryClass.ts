import {IFactory, IFactoryConstruct} from "../interfaces/IJsxParam";

export class FactoryClass {

    private readonly _generator;
    private readonly _menuName: string;
    private readonly _factoryMap;
    private readonly  _activeDocument;

    constructor(generator, menuName, factoryMap, activeDocument) {
        this._generator = generator;
        this._menuName = menuName;
        this._factoryMap = factoryMap;
        this._activeDocument = activeDocument;
    }

    public construct(factoryConstruct: IFactoryConstruct, dependencies): IFactory {
        let dependentObjs = [];
        dependencies.forEach(item => {
            dependentObjs.push(new item());
        });
        if(dependentObjs.length) {
            return new factoryConstruct(dependentObjs);
        }
        return new factoryConstruct();
    }

    public execute(factory: IFactory) {
        factory.execute(this._generator, this._menuName, this._factoryMap, this._activeDocument);
    }

}