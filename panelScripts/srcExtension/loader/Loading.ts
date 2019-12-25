import {PhotoshopModel} from "../../src/models/PhotoshopModels/PhotoshopModel";
import {PhotoshopModelApp} from "../models/PhotoshopModels/PhotoshopModelApp";
import {LayerManager} from "../../src/modules/LayerManager";
import {LayerManagerApp} from "../modules/LayerManagerApp";

export const loadingMap = new Map();
loadingMap.set(PhotoshopModel, PhotoshopModelApp)
          .set(LayerManager, LayerManagerApp);