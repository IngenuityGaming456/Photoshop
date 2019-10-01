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
        for(let[key, value] of map) {
            if(value instanceof Map) {
                obj[key] = utlis.mapToObject(value);
            }
            else {
                obj[key] = value;
            }
        }
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

}