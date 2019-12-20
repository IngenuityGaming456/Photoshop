#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var checkCount = 1;
var selectedLayers = [];
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
    if(checkCount % 2) {
        for (var i = 0; i < languagesCount; i++) {
            languagePanel.children[i].value = true;
        }
    } else {
        for (var i = 0; i < languagesCount; i++) {
            languagePanel.children[i].value = false;
        }
    }
    checkCount++;
}

function handleResponse() {
    for (var i = 0; i < languagesCount; i++) {
        if (languagePanel.children[i].value === true) {
            selectedLayers.push(languagePanel.children[i].text);
        }
    }
    windowStruct.window.close();
    drawStruct(selectedLayers);
}

function drawStruct(selectedLayers) {
    var selectedLangRef = [];
    var langRef = getInsertionReferenceById(params.langId);
    var langCount = selectedLayers.length;
    for(var i=0;i<langCount;i++) {
        var langLayerRef = checkLayerSet(langRef, selectedLayers[i]);
        if(langLayerRef) {
            selectedLangRef.push(langLayerRef);
        } else {
            selectedLangRef.push(insertLayer(langRef, selectedLayers[i], "layerSection"));
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
    }
    duplicateItemLayer(itemId, parentRefs[parentRefs.length - 1]);
}

function duplicateItemLayer(itemId, parentRef) {
    var itemLayerRef = getInsertionReferenceById(itemId);
    itemLayerRef.duplicate(parentRef);
}
selectedLayers;