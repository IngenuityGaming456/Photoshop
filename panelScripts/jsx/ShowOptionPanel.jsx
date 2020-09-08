#include "F:\\projects\\project_photoshop\\photoshopscript\\panelScripts\\jsx\\CreateStruct.jsx";
var optionsObj = makeWindowAndPanel("Select Option", "Do you want to localise " + params.name);
var yesButton = optionsObj.panel.add('button', undefined, 'Yes');
var noButton = optionsObj.panel.add('button', undefined, 'No');
var response;
yesButton.addEventListener('click', handleYes);
noButton.addEventListener('click', handleNo);
optionsObj.window.show();

function handleYes() {
    response = "yes";
    optionsObj.window.close();
}

function handleNo() {
    response = "no";
    optionsObj.window.close();
}

response;