var localisationWindow = new Window('dialog', 'Info');
var infoPanel = localisationWindow.add('panel', undefined, params.panelName);
infoPanel.add('statictext', undefined, params.text);
var button = infoPanel.add("button", undefined, "OK");
button.addEventListener("click", onClick);
localisationWindow.show();

function onClick() {
    localisationWindow.close();
}