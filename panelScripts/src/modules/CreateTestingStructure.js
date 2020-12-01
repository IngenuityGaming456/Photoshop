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
exports.CreateTestingStructure = void 0;
const path = require("path");
class CreateTestingStructure {
    constructor(modelFactory) {
        this.modifiedIds = [];
        this.modifiedIds = modelFactory.getPhotoshopModel().allModifiedIds || [];
        this.modelFactory = modelFactory;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const modifiedIdsCount = this.modifiedIds.length;
            this.modelFactory.getPhotoshopModel().lastRemovalId = Number(this.modifiedIds[modifiedIdsCount - 1]);
            this.modelFactory.getPhotoshopModel().isRemoval = true;
            for (let i = 0; i < modifiedIdsCount; i++) {
                yield params.generator.evaluateJSXFile(path.join(__dirname, "../../jsx/addPath.jsx"), { id: this.modifiedIds[i],
                    remove: true
                });
            }
            this.modifiedIds.length = 0;
        });
    }
}
exports.CreateTestingStructure = CreateTestingStructure;
//# sourceMappingURL=CreateTestingStructure.js.map