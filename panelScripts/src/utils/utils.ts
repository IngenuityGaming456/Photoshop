import * as fs from "fs";
import * as path from "path";
import * as layerClass from "../../lib/dom/layer";

export class utlis {

    public static isKeyExists(searchArray, key) {
        return ~searchArray.indexOf(key);
    }

    public static isIDExists(id, idArray) {
        return idArray.find(item => {
            if(item.id === id) {
                return true;
            }
        });
    };

    public static getConsecutiveIndexes(itemArray, index) {
        const itemLength = itemArray.length;
        let nextIndex = index + 1;
        let nextToNextIndex = index + 2;
        if(nextIndex >= itemLength) {
            nextIndex = nextIndex - itemLength;
        }
        if(nextToNextIndex >= itemLength) {
            nextToNextIndex = nextToNextIndex - itemLength;
        }
        return {
            firstIndex: nextIndex,
            secondIndex: nextToNextIndex
        }
    }

    public static mapToObject(map) {
        let obj = {};
        map.forEach((value, key) => {
            if(value instanceof Map) {
                obj[key] = utlis.mapToObject(value);
            }
            else {
                obj[key] = value;
            }
        });
        return obj;
    }

    public static objectToMap(obj) {
        let map = new Map();
        for(let key of Object.keys(obj)) {
            if(obj[key] instanceof Object) {
                map.set(key, utlis.objectToMap(obj[key]));
            }
            else {
                map.set(key, obj[key])
            }
        }
        return map;
    }
    
    public static traverseObject(arrayLayers, callback) {
        let noOfLayers = arrayLayers.length;
        for(let i=0;i<noOfLayers;i++) {
            if(arrayLayers[i].type === "layer") {
                callback(arrayLayers[i]);
            }
            if(arrayLayers[i].type === "layerSection") {
                if(arrayLayers[i].layers) {
                    utlis.traverseObject(arrayLayers[i].layers, callback);
                }
            }
        }
    }

    public static removeFile(fileName) {
        const stats = fs.lstatSync(fileName);
        if(stats.isDirectory()) {
            fs.readdirSync(fileName).forEach(file => {
                utlis.removeFile(fileName + "/" + file);
            });
        } else {
            if(path.basename(fileName) === "Image.png") {
                fs.unlink(fileName, err=> {
                    if(err) {
                        console.log("unable to remove file");
                    } else {
                        console.log("done");
                    }
                });
            }
        }
    }

    public static handleModelData(eventLayers, drawnQuestItems, viewElementalMap) {
        for(let platform in viewElementalMap) {
            if(!viewElementalMap.hasOwnProperty(platform)) {
                continue;
            }
            const platformMap = viewElementalMap[platform];
            for(let view in platformMap) {
                if(!platformMap.hasOwnProperty(view)) {
                    continue;
                }
                const viewItems = platformMap[view];
                for(let itemV in viewItems) {
                    if(!viewItems.hasOwnProperty(itemV)) {
                        continue;
                    }
                    utlis.handleView(viewItems, itemV, eventLayers, drawnQuestItems);
                }
            }
        }
    }

    private static handleView(viewItems, itemV, eventLayers, drawnQuestItems) {
        const viewItem = viewItems[itemV];
        if(viewItem instanceof Array) {
            viewItem.forEach((item, index) => {
                const itemRef = utlis.isIDExists(item.id, eventLayers);
                if(itemRef) {
                    viewItem.splice(index, 1);
                    utlis.spliceFrom(item.id, drawnQuestItems);
                }
            });
        } else {
            const itemRef = utlis.isIDExists(viewItem.id, eventLayers);
            if(itemRef) {
                delete viewItems[itemV];
                utlis.spliceFrom(itemV.id, drawnQuestItems);
            }
        }
    }

    private static spliceFrom(id, array) {
        const ref = utlis.isIDExists(id, array);
        if(ref) {
            const indexOf = array.indexOf(ref);
            if(indexOf > -1) {
                array.splice(indexOf, 1);
            }
        }
    }

    public static getElementView(element, activeDocumentLayers) {
        const layers: layerClass.LayerGroup = activeDocumentLayers;
        const elementRef = layers.findLayer(element.id);
        return utlis.getView(elementRef);
    }

    private static getView(elementRef) {
        if((elementRef.layer)) {
            return utlis.getView(elementRef.layer.group);
        }
        if(elementRef.group.name === "common")  {
            return elementRef.name;
        } else if(elementRef.group){
            return utlis.getView(elementRef.group);
        }
    }

}