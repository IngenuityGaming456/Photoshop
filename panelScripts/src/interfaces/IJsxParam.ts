export interface IJsxParam {
    parentId: string,
    childName: string,
    type?: string,
    subType?: string,
    image?: string,
    file?: string
}

export interface ISequence {
    id: number,
    sequence: number
}

export interface IViewStructure {
    shouldDrawStruct(generator,  docEmitter, getPlatform?: Function, viewDeletionObj?, menuName?);
}

export interface IFactoryConstruct {
    new(...dependencies: Array<any>): any;
}

export interface IFactory {
    deps?: Array<IFactory>;
    execute(params: IParams);
}

export interface IClassParams {
    ref,
    dep,
    isNonSingleton?: boolean
}

export interface IParams {
    generator?,
    docEmitter?,
    loggerEmitter?,
    menuName?: string,
    activeDocument?,
    storage?,
    events?
}

export interface IModel extends IFactory{
    onPhotoshopClose();
    onPhotoshopStart();
}

export interface ISubjectEvent {
    subscribeListeners();
    add(observer: IModel);
    remove(observer: IModel);
    notify();
}

export interface IDataSubModel extends IFactory {
    createElementData();
}