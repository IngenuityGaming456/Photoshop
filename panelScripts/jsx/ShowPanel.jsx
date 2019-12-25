//Adding polyfill for Object.keys()
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'varructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var checkCount = 1;
var selectedLayers = {};
var languagesArray = params.languages;
var languagesCount = languagesArray.length;
var windowStruct = makeWindowAndPanel('Localisation', 'Select Languages');
addElementsToPanel(windowStruct.panel, languagesArray, 'checkbox', isRecordedResponse);
var checkUncheck = windowStruct.window.add('button', undefined, 'Check/Uncheck');
checkUncheck.addEventListener('click', handleClick);
var lockResponses = windowStruct.window.add('button', undefined, 'Generate');
lockResponses.addEventListener('click', handleResponse);
windowStruct.window.show();

function isRecordedResponse(key) {
    var recordedCount = params.recordedResponse.length;
    for(var i=0;i<recordedCount;i++) {
        if(key === params.recordedResponse[i]) {
            return true;
        }
    }
    return false;
}

function handleClick() {
    for (var i = 0; i < languagesCount; i++) {
        windowStruct.panel.children[i].value = !!(checkCount % 2);
    }
    checkCount++;
}

function handleResponse() {
    for (var i = 0; i < languagesCount; i++) {
        if (windowStruct.panel.children[i].value === true) {
            selectedLayers[windowStruct.panel.children[i].text] = {
                langId: null,
                viewArray: []
            }
        }
    }
    windowStruct.window.close();
    drawStruct(selectedLayers);
}

function drawStruct(selectedLayers) {
    var selectedLangRef = [];
    var keysArray = Object.keys(selectedLayers);
    var langRef = getInsertionReferenceById(params.langId);
    var langCount = keysArray.length;
    for(var i=0;i<langCount;i++) {
        var langLayerRef = checkLayerSet(langRef, keysArray[i]);
        if(langLayerRef) {
            selectedLangRef.push(langLayerRef);
        } else {
            var langSubRef = insertLayer(langRef, keysArray[i], "layerSection");
            selectedLangRef.push(langSubRef);
            selectedLayers[langSubRef.name].langId = langSubRef.id;
        }
    }
    insertSelectedStruct(selectedLangRef);
}

function checkLayerSet(langRef, langName) {
    var langSets = langRef.layerSets;
    var layerSetCount = langSets.length;
    for(var i=0;i<layerSetCount;i++) {
        if(langSets[i].name === langName) {
            return langSets[i];
        }
    }
}

function insertSelectedStruct(selectedLangRef) {
    var selectedRefCount = selectedLangRef.length;
    var valuesCount = params.values.length;
    for(var i=0;i<selectedRefCount;i++) {
        for(var j=0;j<valuesCount;j++) {
            drawLayers(j, i, selectedLangRef);
        }
    }
}

function drawLayers(valueIndex, langIndex, selectedLangRef) {
    var item = params.values[valueIndex];
    var itemId = params.ids[valueIndex];
    var itemL = item.length;
    var parentRefs = [];
    parentRefs.push(selectedLangRef[langIndex]);
    for (var i = 0; i < itemL; i++) {
        var newLayerRef = checkLayerSet(parentRefs[i], item[i].name);
        if(newLayerRef) {
            parentRefs.push(newLayerRef);
        } else {
            parentRefs.push(insertLayer(parentRefs[i], item[i].name, "layerSection"));
        }
        if(i === 0) {
            selectedLayers[selectedLangRef[langIndex].name].viewArray.push(parentRefs[parentRefs.length - 1].id);
        }
    }
    duplicateItemLayer(itemId, parentRefs[parentRefs.length - 1]);
}

function duplicateItemLayer(itemId, parentRef) {
    var itemLayerRef = getInsertionReferenceById(itemId);
    itemLayerRef.duplicate(parentRef);
}

var selectedLayersResponse = "";
var keysArray = Object.keys(selectedLayers);
var keysCount = keysArray.length;
for(var i=0;i<keysCount;i++) {
    if(i > 0) {
        selectedLayersResponse += ":"
    }
    selectedLayersResponse += keysArray[i] + "," + selectedLayers[keysArray[i]].langId;
    var viewArray = selectedLayers[keysArray[i]].viewArray;
    var viewCount = viewArray.length;
    for(var j=0;j<viewCount;j++) {
        selectedLayersResponse += "," + viewArray[j];
    }
}
selectedLayersResponse;