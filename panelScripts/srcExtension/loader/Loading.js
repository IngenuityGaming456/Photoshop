"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingMap = void 0;
var PhotoshopModel_1 = require("../../src/models/PhotoshopModels/PhotoshopModel");
var PhotoshopModelApp_1 = require("../models/PhotoshopModels/PhotoshopModelApp");
var LayerManager_1 = require("../../src/modules/LayerManager");
var LayerManagerApp_1 = require("../modules/LayerManagerApp");
exports.loadingMap = new Map();
exports.loadingMap.set(PhotoshopModel_1.PhotoshopModel, PhotoshopModelApp_1.PhotoshopModelApp)
    .set(LayerManager_1.LayerManager, LayerManagerApp_1.LayerManagerApp);
//# sourceMappingURL=Loading.js.map