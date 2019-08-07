import {Restructure} from "./Restructure";
import * as path from "path";
import {IFactory} from "../interfaces/IJsxParam";

export class CreateComponent implements IFactory{
    private _generator;

    public execute(generator, element, componentsMap, activeDocument) {
        this._generator = generator;
        let elementValue = componentsMap.get(element);
        let sequenceId = Restructure.sequenceStructure(elementValue);
        this.callComponentJsx(sequenceId, element)
            .then( id => {
                return new Promise(resolve => {
                    this._generator.setLayerSettingsForPlugin(
                        elementValue.label, id, "type")
                        .then(() => {
                            resolve(id);
                            }
                        );
                });
            })
            .then(id => {
                let controlledArray = elementValue.elementArray;
                controlledArray.push({id: id, sequence: sequenceId});
            });
    }

    private callComponentJsx(sequenceId: number, jsxName: string): Promise<number> {
        return new Promise((resolve, reject) => {
            let jsxPath = path.join(__dirname, "../../jsx/" + jsxName + ".jsx");
            this._generator.evaluateJSXFile(jsxPath, {clicks: sequenceId})
                .then(id => resolve(id))
                .catch(err => reject(err));
        });
    }

}