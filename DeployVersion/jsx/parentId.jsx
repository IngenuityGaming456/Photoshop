var path = (new File($.fileName)).parent;
var pathNew = path + "/Plug-ins/Generator/DeployVersion/jsx/CreateStruct.jsx";
$.evalFile(pathNew);
var parentRef = getInsertionReferenceById(params.parentId);
var childRef = getInsertionReference(parentRef, params.childName);
childRef.id;