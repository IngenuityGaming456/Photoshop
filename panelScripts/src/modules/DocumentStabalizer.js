"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentStabalizer = void 0;
const path = require("path");
class DocumentStabalizer {
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.generator = params.generator;
            yield this.forceSave();
        });
    }
    removeBackgroundLayer() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/DeleteErrorLayer.jsx"), { level: 1 });
        });
    }
    forceSave() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.generator.evaluateJSXString(`app.activeDocument.artLayers.add()`);
            yield this.generator.evaluateJSXString(`app.activeDocument.activeLayer.remove()`);
            const response = yield this.generator.evaluateJSXString(`try {
                                                                        app.activeDocument.save();
                                                                        }catch(err) {
                                                                         false;
                                                                        }`);
            if (!response) {
                yield this.removeBackgroundLayer();
                this.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/ShowInterruptionPanel.jsx"), {
                    panelName: "Status",
                    text: "Save Document To Start Working"
                });
            }
        });
    }
}
exports.DocumentStabalizer = DocumentStabalizer;
//# sourceMappingURL=DocumentStabalizer.js.map