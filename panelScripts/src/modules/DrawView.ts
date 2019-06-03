import {IJsxParam} from "../interfaces/IJsxParam";

export class DrawView {
    private _generator;

    public constructor(params, generator, menuName) {
        this._generator = generator;
        this.drawStruct(params)
            .then(() => {
                if(menuName === "AddMainView" || menuName === "AddFreeGameView") {
                    this.insertDefaultJsx();
                }
            })
    }

    private async drawStruct(params) {
        for (let keys in params) {
            if (params.hasOwnProperty(keys))
                 await this.makeStruct(params[keys], null);
        }
        return Promise.resolve();
    }

    private async makeStruct(parserObject, baseKeyName: string) {
        let layerType: string;
        for(let keys in parserObject) {
            let jsxParams: IJsxParam = {parentName: "", childName: "", type: ""};
            if(parserObject.hasOwnProperty(keys)) {
                layerType = parserObject[keys].type;
                jsxParams.childName = parserObject[keys].id;
                if(!baseKeyName) {
                    baseKeyName = keys;
                    jsxParams.childName = baseKeyName;
                    jsxParams.type = "layerSection";
                     await this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\refactoredJsx\\InsertLayer.jsx", jsxParams);
                     await this.makeStruct(parserObject[keys], baseKeyName);
                    return;
                }
                jsxParams.parentName = parserObject[keys].parent ? parserObject[keys].parent : baseKeyName;
                if(layerType === "image" || layerType === "shape" || layerType === "label") {
                    jsxParams.type = "artLayer";
                    if(layerType === "label") {
                        jsxParams.subType = "text";
                    }
                     await this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\refactoredJsx\\InsertLayer.jsx", jsxParams);
                }
                if(layerType === "container") {
                    jsxParams.type = "layerSection";
                     await this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\refactoredJsx\\InsertLayer.jsx", jsxParams);
                }

                if(layerType === "button") {
                     await this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\AddButton.jsx", jsxParams);
                }
                if(layerType === "animation") {
                     await this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\AddAnimation.jsx", jsxParams);
                }
            }
        }
    }

    private async insertDefaultJsx() {
         /*await this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\AddSymbol.jsx");
         await this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\AddPayline.jsx");
         await this._generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\AddWinFrame.jsx");
    */
    }

}