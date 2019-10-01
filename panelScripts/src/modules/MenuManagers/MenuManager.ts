import {IFactory, IParams, IPhotoshopState} from "../../interfaces/IJsxParam";
import {Generator} from "../../../../generator-core/lib/generator";
import {ModelFactory} from "../../models/ModelFactory";

export class MenuManager implements IFactory {

    deps?: IFactory[];
    private generator: Generator;
    private readonly noPlatform: IPhotoshopState;
    private readonly addedPlatform: IPhotoshopState;
    private readonly deletedView: IPhotoshopState;
    private readonly addedView: IPhotoshopState;
    private readonly deletedPlatform: IPhotoshopState;
    private currentState: IPhotoshopState;
    private modelFactory: ModelFactory;
    private platformStack = [];
    private platformArray = [];
    private viewArray = [];

    public constructor(modelFactory: ModelFactory, noPlatform: IPhotoshopState, addedPlatform: IPhotoshopState, 
                       addedView: IPhotoshopState, deletedView: IPhotoshopState, deletedPlatformState: IPhotoshopState) {
        this.modelFactory = modelFactory;
        this.noPlatform = noPlatform;
        this.addedPlatform = addedPlatform;
        this.addedView = addedView;
        this.deletedView = deletedView;
        this.deletedPlatform = deletedPlatformState;
    }

    public async execute(params: IParams) {
        this.generator = params.generator;
        this.setStartingState();
    }
    
    private setStartingState() {
        this.currentState = this.getNoPlatformState();
        this.onAllPlatformsDeletion();
    }

    public setCurrentState(state: IPhotoshopState) {
        this.currentState = state;
    }

    public onViewAddition(viewMenuName: string) {
        this.currentState.onViewAddition(this, this.generator, viewMenuName);
    }
    
    public onViewDeletion(viewMenuName: string) {
        this.currentState.onViewDeletion(this, this.generator, viewMenuName);
    }

    public onPlatformAddition(platformMenuName) {
        this.currentState.onPlatformAddition(this, this.generator, platformMenuName);
    }

    public onAllPlatformsDeletion() {
        this.currentState.onAllPlatformsDeletion(this, this.generator);
    }

    public onPlatformDeletion(platformMenuName) {
        this.currentState.onPlatformDeletion(this, this.generator, platformMenuName);
    }

    public getNoPlatformState() {
        return this.noPlatform;
    }
    
    public getPlatformAdditionState() {
        return this.addedPlatform;
    }
    
    public getViewDeletionState() {
        return this.deletedView;
    }
    
    public getAddedViewState() {
        return this.addedView;
    }

    public getDeletedPlatformState() {
        return this.deletedPlatform;
    }

}