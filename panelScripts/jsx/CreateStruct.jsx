function insertLayer(parentRef, childName, layerType, layerConfig, layerKindConfig) {
    var childLayer;
    if (layerType === "layerSection") {
        childLayer = parentRef.layerSets.add();
    }
    if (layerType === "artLayer") {
        childLayer = parentRef.artLayers.add();
        if (layerConfig && layerConfig.hasOwnProperty("kind")) {
            childLayer.name = childName;
            childLayer.kind = layerConfig.kind;
            childLayer.textItem.contents = layerKindConfig ? layerKindConfig.contents : "temp";
            translate(childLayer);
        }
    }
    childLayer.name = childName;
    return childLayer;
}

function getInsertionReference(upperLevelRef, searchKey) {
    var referenceResult = [];
    var layerSetsArray = upperLevelRef.layerSets;
    var layerSetsCount = layerSetsArray.length;
    try {
        return upperLevelRef.layerSets.getByName(searchKey);
    } catch (err) {
        for (var i = 0; i < layerSetsCount; i++) {
            referenceResult.push(getInsertionReference(layerSetsArray[i], searchKey));
        }
    }
    var referenceResultLength = referenceResult.length;
    for (var i = 0; i < referenceResultLength; i++) {
        if (referenceResult[i]) {
            return referenceResult[i];
        }
    }
    return null;
}

function getInsertionReferenceById(id) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID('Lyr '), Number(id));
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref );
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO );
    return app.activeDocument.activeLayer;
}

function getPathName(layerRef, pathName, baseName, level, type) {
    if(level === 2) {
        if(layerRef === app.activeDocument) {
            return pathName;
        }
        pathName = setNameToStatic(layerRef, pathName);
        return getPathName(layerRef.parent, pathName, baseName, level, type);
    }
    if(level === 1) {
        if(layerRef.parent.name === "common" || (layerRef.parent.parent && layerRef.parent.parent.name === "languages")) {
            if(type && type === "static") {
                pathName = setNameToStatic(layerRef, pathName);
            } else {
                pathName = setNameToAnimations(layerRef, pathName);
            }
            level = 2;
        }
        return getPathName(layerRef.parent, pathName, baseName, level, type);
    }
    if(layerRef.name === baseName) {
        level = 1;
    }
    pathName = setNameToStatic(layerRef, pathName);
    return getPathName(layerRef.parent, pathName, baseName, level, type);
}

function setNameToStatic(layerRef, pathName) {
    if(!pathName.length) {
        pathName = layerRef.name;
    } else {
        pathName = layerRef.name + "/" + pathName;
    }
    return pathName;
}

function setNameToAnimations(layerRef, pathName) {
    if(!pathName.length) {
        pathName = layerRef.name;
    } else {
        pathName = layerRef.name + "Animation" +  "/" + pathName;
    }
    return pathName;
}

/**
 * Returns the parent reference to be used when creating a new Element.
 * @param {optional} params parameters for the elements to be created.
 */
function getParentRef() {
    var parentRef;
    var selectedLayers = $.evalFile("F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\SelectedLayers.jsx");
    var selectedLayersString = selectedLayers.toString();

    if (selectedLayersString.length && !app.activeDocument.activeLayer.kind) {
        // if a container is selected.
        parentRef = app.activeDocument.activeLayer;
    } else {
        parentRef = app.activeDocument;
    }

    return parentRef;
}

function duplicateContainer(mappedItemRef, childLayerRef) {
    try{
        var tempLayer = insertLayer(childLayerRef, "tempName", "layerSection");
        var mappedLayers = mappedItemRef.layers;
        var mappedLength = mappedLayers.length;
        for(var i=0;i<mappedLength;i++) {
            var mappedRef = mappedLayers[i];
            var duplicateLayer = mappedRef.duplicate(tempLayer, ElementPlacement.PLACEBEFORE);
            duplicateLayer.name = mappedRef.name;
            if(duplicateLayer instanceof LayerSet) {
                makeNameSame(duplicateLayer.layers);
            }
        }
        tempLayer.remove();
    } catch(err) {
        alert(err);
    }
}

function makeNameSame(duplicateLayers) {
    var layersCount = duplicateLayers.length;
    for(var i=0;i<layersCount;i++) {
        var copyIndex = duplicateLayers[i].name.search(/(copy)/);
        if(copyIndex > -1) {
            duplicateLayers[i].name = duplicateLayers[i].name.substring(0, copyIndex-1);
        }
        if(duplicateLayers[i] instanceof LayerSet) {
            makeNameSame(duplicateLayers[i].layers);
        }
    }
}

function duplicateTextLayer(mappedLayerRef, childLayerRef) {
    childLayerRef.textItem.contents = mappedLayerRef.textItem.contents;
    childLayerRef.textItem.color = mappedLayerRef.textItem.color;
    childLayerRef.textItem.font = mappedLayerRef.textItem.font;
    childLayerRef.textItem.position = mappedLayerRef.textItem.position;
    childLayerRef.textItem.size = mappedLayerRef.textItem.size;
}

function quickMaker(type) {
    var makerWindow = new Window('dialog', 'QuickMaker');
    var makerPanel = makerWindow.add('panel', undefined, type);
    makerPanel.orientation = "column";
    makerPanel.alignChildren = "center";
    var countBox = makerPanel.add("edittext", [0,0,150,60], "0");
    var submitButton = makerPanel.add('button', undefined, 'Generate');
    submitButton.addEventListener("click", onSubmitButtonClick);
    makerWindow.show();
    return countBox.text;
}

function onSubmitButtonClick(event) {
    event.currentTarget.parent.parent.close();
}

function getStartCount(layerRef) {
    var layerSets = layerRef.layerSets;
    var layerSetCount = layerSets.length;
    var maxCount = 0;
    for(var i=0; i<layerSetCount; i++) {
        var layerSetSequence = getLayerSetSequence(layerSets[i]);
        if(layerSetSequence > 0 && layerSetSequence > maxCount) {
            maxCount = layerSetSequence;
        }
    }
    return maxCount;
}

function getLayerSetSequence(layerSet) {
    var sequence = layerSet.name[layerSet.name.length - 1];
    if(Number(sequence)) {
        return sequence;
    }
    return 0;
}

function translate(textLayer) {
    var x = app.activeDocument.width/2 - textLayer.bounds[0];
    var y = app.activeDocument.height/2 - textLayer.bounds[1];
    textLayer.translate(x, y);
}

function makeWindowAndPanel(windowName, panelName) {
    var window = new Window('dialog', windowName);
    var panel = window.add('panel', undefined, panelName);
    panel.orientation = "column";
    panel.alignChildren = "center";
    panel.spacing = 0;
    return {
        window: window,
        panel: panel
    };
}

function addElementsToPanel(panel, elementArray, elementName, callback) {
    var elementCount = elementArray.length;
    for(var i=0;i<elementCount;i++) {
        var element = panel.add(elementName, undefined, elementArray[i]);
        element.size = [20, 20];
        element.value = callback ? callback(elementArray[i]) : false;
    }
}

function getRadioResponse(panel, count) {
    for(var i=0;i<count;i++) {
        if(panel.children[i].value) {
            return panel.children[i].text;
        }
    }
    return null;
}

function getElementRef(params, key) {
    var elementName = params.childName ? params.childName : key + params.clicks;
    var elementRef = params.parentId ? getInsertionReferenceById(params.parentId) :
        getParentRef();
    return {
        name: elementName,
        ref: elementRef
    };
}