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
    private stateObj = {};

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
        // this.generator = params.generator;
        // this.makeStateObj();
        // this.setStartingState();
    }

    private makeStateObj() {
        this.stateObj = {
            AddedPlatformState: this.addedPlatform,
            AddedViewState: this.addedView,
            DeletedPlatformState: this.deletedPlatform,
            DeletedViewState: this.deletedView,
            NoPlatformState: this.noPlatform
        }
    }

    private setStartingState() {
        this.currentState = this.setOpenState();
        if(!this.currentState) {
            this.currentState = this.getNoPlatformState();
            this.onAllPlatformsDeletion();
        }
    }

    private setOpenState() {
        const currentStateName = this.modelFactory.getPhotoshopModel().menuCurrentState;
        return this.stateObj[currentStateName];
    }

    public setCurrentState(state: IPhotoshopState) {
        this.currentState = state;
        this.modelFactory.getPhotoshopModel().menuCurrentState = this.setModelState();
    }

    private setModelState() {
        for(let key in this.stateObj) {
            if(!this.stateObj.hasOwnProperty(key)) {
                continue;
            }
            if(this.currentState === this.stateObj[key]) {
                return key;
            }
        }
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