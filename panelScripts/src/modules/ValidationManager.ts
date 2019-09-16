import {IFactory, IParams} from "../interfaces/IJsxParam";
import {utlis} from "../utils/utils";
import {inject, execute} from "./FactoryClass";
import {Validation} from "./Validation";

export class ValidationManager implements IFactory {
    private questContainers = [];
    private generator;
    private storage;
    private validator: IFactory;

    public execute(params: IParams) {
        this.generator = params.generator;
        this.storage = params.storage;
        this.filterContainers();
        this.injectValidator();
        this.subscribeListeners();
    }

    private subscribeListeners() {
        this.generator.on("handleValidation", event => this.handlePhotoshopEvents(event));
    }

    private injectValidator() {
        this.validator = inject({ref: Validation, dep: []});
        execute(this.validator, {storage: this.questContainers});
    }

    private filterContainers() {
        this.storage.forEach(item => {
            this.storeContainers(item);
        });
    }

    private storeContainers(item) {
        Object.keys(item).forEach(key => {
            if (!item[key].type) {
                this.pushToContainer(key);
                this.storeContainers(item[key]);
            } else {
                if(item[key].type === "container") {
                    this.pushToContainer(key);
                }
            }
        });
    }

    private pushToContainer(key) {
        if (!utlis.isKeyExists(this.questContainers, key)) {
            this.questContainers.push(key);
        }
    }

    private handlePhotoshopEvents(event) {
        if(event.layers && !event.added && event.layers[0].name) {
            (this.validator as Validation).isInHTML(event.layers[0].name, this.questContainers);
        }
    }

}