import {Restructure} from "./Restructure";
import * as path from "path";

export class CreateComponent {
    private readonly _generator;
    public constructor(generator, element, componentsMap) {
        this._generator = generator;
        let elementValue = componentsMap.get(element);
        let sequenceId = Restructure.sequenceStructure(elementValue);
        this.callComponentJsx(sequenceId, element)
            .then( (id) => {
                    this._generator.setLayerSettingsForPlugin(elementValue.displayName, id, "LayoutPlugin");
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