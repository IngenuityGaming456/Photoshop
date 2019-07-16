/**
 * Returns an array of all chilren name of selected item.
 */

var childrenArray = [];

if (app.activeDocument.activeLayer.layerSets && app.activeDocument.activeLayer.layerSets.length) {
    for (var i = 0; i < app.activeDocument.activeLayer.layerSets.length; i++) {
        var childSet = app.activeDocument.activeLayer.layerSets[i];
        childrenArray.push(childSet.name);
    }
}

// returns an array of children names.
childrenArray;
