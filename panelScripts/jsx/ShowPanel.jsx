#include "D:\\UIBuilderDevelopment\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
if (app.activeDocument.activeLayer.name === "languages") {
    var languagesArray = params.languages;
    var languagesCount = languagesArray.length;
    var localisationWindow = new Window('dialog', 'Localisation');
    var languagePanel = localisationWindow.add('panel', undefined, 'Select Languages');
    languagePanel.orientation = "column";
    languagePanel.alignChildren = "center";
    languagePanel.spacing = 0;
    for (var i = 0; i < languagesCount; i++) {
        var deCheckbox = languagePanel.add('checkbox', undefined, languagesArray[i]);
        deCheckbox.size = [20, 20];
        deCheckbox.value = true;
    }
    var lockResponses = localisationWindow.add('button', undefined, 'Lock Responses');
    lockResponses.addEventListener('click', handleResponse);
    localisationWindow.show();
}

function handleResponse() {
    var selectedLanguages = [];
    for (var i = 0; i < languagesCount; i++) {
        if (languagePanel.children[i].value === true) {
            selectedLanguages.push(languagePanel.children[i].text);
        }
    }
    localisationWindow.close();
    drawStruct(selectedLanguages);
}

function drawStruct(selectedLanguages) {
    var selectedLanguagesCount = selectedLanguages.length;
    var parentRef = app.activeDocument.activeLayer;
    for (var i = 0; i < selectedLanguagesCount; i++) {
        insertLayer(parentRef, selectedLanguages[i], "layerSection");
    }
}


