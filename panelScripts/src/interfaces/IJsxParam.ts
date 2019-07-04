export interface IJsxParam {
    parentName: string,
    childName: string,
    type?: string,
    subType?: string
}

export interface ISequence {
    id: number,
    sequence: number
}

export interface IStructure {
    drawStruct(params: Object): void;
    makeStruct(parserObject: Object, insertionPoint: string): void;
}

export interface IViewStructure {
    getElement(): Object;
    shouldDrawStruct(): Promise<string>;
}