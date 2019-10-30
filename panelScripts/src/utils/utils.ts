import * as fs from "fs";
import * as path from "path";
import * as layerClass from "../../lib/dom/layer";

export class utlis {

    public static isKeyExists(searchArray, key) {

        return ~searchArray.indexOf(key);
    }

    public static isIDExists(id, idArray) {
        return idArray.find(item => {
            if (item.id === id) {
                return true;
            }
        });
    };

    public static getConsecutiveIndexes(itemArray, index) {
        const itemLength = itemArray.length;
        let nextIndex = index + 1;
        let nextToNextIndex = index + 2;
        if (nextIndex >= itemLength) {
            nextIndex = nextIndex - itemLength;
        }
        if (nextToNextIndex >= itemLength) {
            nextToNextIndex = nextToNextIndex - itemLength;
        }
        return {
            firstIndex: nextIndex,
            secondIndex: nextToNextIndex
        }
    }

    public static mapToObject(map) {
        if (!map) {
            return null;
        }
        let obj = {};
        map.forEach((value, key) => {
            if (value instanceof Map) {
                obj[key] = utlis.mapToObject(value);
            } else {
                obj[key] = value;
            }
        });
        return obj;
    }

    public static objectToMap(obj) {
        if (!obj) {
            return null;
        }
        let map = new Map();
        for (let key of Object.keys(obj)) {
            if (obj[key] instanceof Object) {
                map.set(key, utlis.objectToMap(obj[key]));
            } else {
                map.set(key, obj[key])
            }
        }
        return map;
    }

    public static traverseObject(arrayLayers, callback) {
        let noOfLayers = arrayLayers.length;
        for (let i = 0; i < noOfLayers; i++) {
            if (arrayLayers[i].type === "layer") {
                callback(arrayLayers[i]);
            }
            if (arrayLayers[i].type === "layerSection") {
                if (arrayLayers[i].layers) {
                    utlis.traverseObject(arrayLayers[i].layers, callback);
                }
            }
        }
    }

    public static traverseBaseFreeGame(arrayLayers, callback) {
        let noOfLayers = arrayLayers.length;
        for (let i = 0; i < noOfLayers; i++) {
            if (arrayLayers[i].name === "baseGame" || arrayLayers[i].name === "freeGame") {
                callback(arrayLayers[i]);
            } else if (arrayLayers[i].layers) {
                utlis.traverseBaseFreeGame(arrayLayers[i].layers, callback);
            }
        }
    }

    public static removeFile(fileName) {
        const stats = fs.lstatSync(fileName);
        if (stats.isDirectory()) {
            fs.readdirSync(fileName).forEach(file => {
                utlis.removeFile(fileName + "/" + file);
            });
        } else {
            if (path.basename(fileName) === "Image.png") {
                fs.unlink(fileName, err => {
                    if (err) {
                        console.log("unable to remove file");
                    } else {
                        console.log("done");
                    }
                });
            }
        }
    }

    public static handleModelData(eventLayers, drawnQuestItems, viewElementalMap, sessionHandler) {
        for (let platform in viewElementalMap) {
            if (!viewElementalMap.hasOwnProperty(platform)) {
                continue;
            }
            const platformMap = viewElementalMap[platform];
            for (let view in platformMap) {
                if (!platformMap.hasOwnProperty(view)) {
                    continue;
                }
                const viewItems = platformMap[view];
                for (let itemV in viewItems) {
                    const deletionObj = {};
                    if (!viewItems.hasOwnProperty(itemV)) {
                        continue;
                    }
                    utlis.setDeletionObj(platform, view, deletionObj);
                    utlis.handleView(viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler);
                }
            }
        }
    }

    private static setDeletionObj(platform, baseView, deletionObj) {
        deletionObj["platform"] = platform;
        deletionObj["view"] = baseView;
    }

    private static setSubDeletionObj(id, name, type, deletionObj, sessionHandler) {
        deletionObj[name] = {};
        deletionObj[name]["name"] = name;
        deletionObj[name]["id"] = id;
        deletionObj[name]["type"] = type;
        sessionHandler.push(deletionObj);
    }

    private static handleView(viewItems, itemV, eventLayers, drawnQuestItems, deletionObj, sessionHandler) {
        const viewItem = viewItems[itemV];
        const indexes = [];
        if (viewItem instanceof Array) {
            viewItem.forEach((item, index) => {
                const itemRef = utlis.isIDExists(item.id, eventLayers);
                if (itemRef) {
                    indexes.push(index);
                    utlis.spliceFrom(item.id, drawnQuestItems);
                    utlis.setSubDeletionObj(item.id, item.name, itemV, deletionObj, sessionHandler);
                }
            });
            utlis.spliceFromIndexes(viewItem, indexes);
        } else {
            const itemRef = utlis.isIDExists(viewItem.id, eventLayers);
            if (itemRef) {
                utlis.spliceFrom(viewItem.id, drawnQuestItems);
                utlis.setSubDeletionObj(viewItem.id, viewItem.name, itemV, deletionObj, sessionHandler);
                delete viewItems[itemV];
            }
        }
    }

    public static getElementPlatform(element, activeLayers) {
        const activeDocumentLayers: layerClass.LayerGroup = activeLayers;
        const insertionRef = activeDocumentLayers.findLayer(element.id);
        return utlis.getElementName(insertionRef, null);
    }

    public static spliceFrom(id, array) {
        const ref = utlis.isIDExists(id, array);
        if (ref) {
            const indexOf = array.indexOf(ref);
            if (indexOf > -1) {
                array.splice(indexOf, 1);
            }
        }
    }

    public static getElementView(element, activeDocumentLayers) {
        const layers: layerClass.LayerGroup = activeDocumentLayers;
        const elementRef = layers.findLayer(element.id);
        return utlis.getElementName(elementRef, "common");
    }

    private static getElementName(elementRef, keyName) {
        if ((elementRef.layer)) {
            return utlis.getElementName(elementRef.layer.group, keyName);
        }
        if (elementRef.group && elementRef.group.name === keyName) {
            return elementRef.name;
        } else if (elementRef.group) {
            return utlis.getElementName(elementRef.group, keyName);
        } else {
            return null;
        }
    }

    public static spliceFromIndexes(arr, indexArr) {
        const indexLength = indexArr.length;
        for (let i = 0; i < indexLength; i++) {
            arr.splice(indexArr[i], 1);
            for (let j = i + 1; j < indexLength; j++) {
                indexArr[j]--;
            }
        }
    }

    public static makeDir(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }

    public static traverseAddedLayers(addedLayers, callback) {
        addedLayers.forEach(item => {
            if(item.added) {
                callback(item);
            }
            if(item.layers) {
                utlis.traverseAddedLayers(item.layers, callback);
            }
        });
    }
}

