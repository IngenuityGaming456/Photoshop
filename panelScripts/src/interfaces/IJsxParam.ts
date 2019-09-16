import {MenuManager} from "../modules/MenuManager";

export interface IJsxParam {
    parentId: string,
    childName: string,
    type?: string,
    subType?: string
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
    dep
}

export interface IParams {
    generator?,
    menuName?: string,
    activeDocument?,
    storage?,
    events?
}

export interface IPhotoshopState {
    checkMenuState(generator): void;
    onViewAddition(menuManager: MenuManager, generator, menuName: string): void;
    onViewDeletion(menuManager: MenuManager, generator, menuName: string): void;
    onPlatformAddition(menuManager: MenuManager, generator, menuName: string): void;
    onAllPlatformsDeletion(menuManager: MenuManager, generator): void;
}

export interface IModel extends IFactory{

}