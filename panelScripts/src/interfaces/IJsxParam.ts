import {MenuManager} from "../modules/MenuManagers/MenuManager";

export interface IJsxParam {
    parentId: string,
    childName: string,
    type?: string,
    subType?: string
}

export interface ILayout extends IFactory {
    modifyPathNames();
}

export interface ISequence {
    id: number,
    sequence: number
}

export interface IViewStructure {
    shouldDrawStruct(generator): Promise<string>;
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
    menuName?: string,
    activeDocument?,
    storage?,
    events?
}

export interface IPhotoshopState {
    onViewAddition(menuManager: MenuManager, generator, menuName: string): void;
    onViewDeletion(menuManager: MenuManager, generator, menuName: string): void;
    onPlatformAddition(menuManager: MenuManager, generator, menuName: string): void;
    onAllPlatformsDeletion(menuManager: MenuManager, generator): void;
    onPlatformDeletion(menuManager: MenuManager, generator, menuName: string): void;
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