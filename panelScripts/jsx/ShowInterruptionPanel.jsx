app.activeDocument = app.documents[0];
var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var windowStruct = makeWindowAndPanel('Info', params.panelName);
windowStruct.panel.add('statictext', undefined, params.text);
var button = windowStruct.panel.add("button", undefined, "OK");
button.addEventListener("click", onClick);
windowStruct.window.show();

function onClick() {
    windowStruct.window.close();
}