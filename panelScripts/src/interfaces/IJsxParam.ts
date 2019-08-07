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

// export interface IStructure extends IFactory {
//     drawStruct(params: Object): void;
//     makeStruct(parserObject: Object, insertionPoint: string): void;
// }
//
export interface IViewStructure {
    shouldDrawStruct(generator): Promise<string>;
}

export interface IFactoryConstruct {
    new(dependencies?): IFactory;
}

export interface IFactory {
    execute(generator, menuName: string, factoryMap, activeDocument);
}