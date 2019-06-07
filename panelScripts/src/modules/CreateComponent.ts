import {Restructure} from "./Restructure";
import * as path from "path";

export class CreateComponent {
    private readonly _componentsMap;
    private _generator;
    public constructor(generator, element, componentsMap) {
        this._generator = generator;
        this._componentsMap = componentsMap;
        let sequenceId = this.findSequence(element);
        this.callComponentJsx(sequenceId, element.label)
            .then( (id) => {
                    this._generator.setLayerSettingsForPlugin(element.displayName, id, "LayoutPlugin");
                    let controlledArray = componentsMap.get(element.label).elementArray;
                    controlledArray.push({id: id, sequence: sequenceId});
            });
    }

    private findSequence(element) {
        return Restructure.sequenceStructure(element, this._componentsMap);
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