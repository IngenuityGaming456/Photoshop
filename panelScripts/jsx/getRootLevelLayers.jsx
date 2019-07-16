/**
 * Returns an array of root level layer names.
 */

var rootLevelItems = [];
for (var index = 0; index < app.activeDocument.layers.length; index++) {
    var element = app.activeDocument.layers[index];
    rootLevelItems = rootLevelItems.concat(element.name);
}

rootLevelItems;