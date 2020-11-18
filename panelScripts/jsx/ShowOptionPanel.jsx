var path = (new File($.fileName)).parent;
var upperPath = path + "/Plug-ins/DeployVersion";
var innerPath = path + "/Plug-ins/Generator/DeployVersion";
var fol = new Folder(upperPath);
var selPath = fol.exists ? upperPath : innerPath;
var pathNew = selPath + "/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
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