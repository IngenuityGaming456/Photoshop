function insertLayer(parentRef, childName, layerType, layerConfig, layerKindConfig) {
    var childLayer;
    if (layerType === "layerSection") {
        childLayer = parentRef.layerSets.add();
    }
    if (layerType === "artLayer") {
        childLayer = parentRef.artLayers.add();
        if (layerConfig && layerConfig.hasOwnProperty("opacity")) {
            childLayer.opacity = layerConfig.opacity;
        }
        if (layerConfig && layerConfig.hasOwnProperty("kind")) {
            childLayer.name = childName;
            childLayer.kind = layerConfig.kind;
            childLayer.textItem.contents = layerKindConfig ? layerKindConfig.contents : "Default";
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

function getPathName(layerRef, pathName) {
    if (layerRef === app.activeDocument) {
        return pathName;
    }
    pathName = layerRef.name + "/" + pathName;
    return getPathName(layerRef.parent, pathName);
}

/**
 * Returns the parent reference to be used when creating a new Element.
 * @param {optional} params parameters for the elements to be created.
 */
function getParentRef() {
    var parentRef;
    var selectedLayers = $.evalFile("D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\SelectedLayers.jsx");
    var selectedLayersString = selectedLayers.toString();

    if (selectedLayersString.length && !app.activeDocument.activeLayer.kind) {
        // if a container is selected.
        parentRef = app.activeDocument.activeLayer;
    } else {
        parentRef = app.activeDocument;
    }

    return parentRef;
}

/**
 * Display a toast message, which hides after some time. 
 * @param params The message | {message: "custom message", duration: 1000}
 */
function showToastMessage(params) {
    var win = new Window("palette");
    var duration = (params && params.duration) ? params.duration : 1000;
    var message = (params && params.message) ? params.message : message;

    win.someMessage = win.add("statictext", undefined, message);
    win.show();
    $.sleep(duration);
    // app.refresh();
    win.close();
}  
