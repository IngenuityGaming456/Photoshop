(function () {
    "use strict";
    let _generator, documentPromise = [],
        CreateView = require("./modules/CreateViewClasses").CreateView,
        CreatePlatform = require("./modules/CreateViewClasses").CreatePlatform,
        CreateViewStructure = require("./modules/CreateViewStructure").CreateViewStructure,
        Restructure = require("./modules/Restructure").Restructure,
        ViewParamFactory = require("./modules/ViewParamFactory").ViewParamFactory,
        CreateComponent = require("./modules/CreateComponent").CreateComponent,
        menuLables = require("./res/menuLables"),
        languagesStruct = require("./res/languages"),
        path = require('path'), structureMap,
        componentsMap, viewsMap, platformsMap;

    function init(generator) {
        _generator = generator;
        createObjects();
        addMenuItems(menuLables);
        _generator.onPhotoshopEvent("generatorMenuChanged", onButtonMenuClicked);
        _generator.onPhotoshopEvent("imageChanged", onImageChanged);
        _generator.onPhotoshopEvent("currentDocumentChanged", onDocumentChanged);
    }

    function onDocumentChanged() {
        componentsMap.forEach(handleChange);
        Promise.all(documentPromise)
               .then(
                _generator.evaluateJSXFile(path.join(__dirname, "../jsx/alert.jsx"), {
                    message: "Search is done, Happy Photoshopping"
                }));
    }

    function handleChange(itemMap) {
        let jsxPromise = _generator.evaluateJSXFile(path.join(__dirname, "../jsx/searchDocument.jsx"),
            {type: itemMap.label});
        documentPromise.push(jsxPromise);
        jsxPromise.then(controlledString => {
            if(!controlledString.length) {
                return;
            }
            let controlledArrays = controlledString.split(",");
            controlledArrays.forEach(item => {
                let colonPos = item.search(":");
                let typeObj = {
                    id: Number(item.slice(0, colonPos)),
                    sequence: Number(item.slice(colonPos + 1))
                };
                itemMap.elementArray.push(typeObj);
            });
        });
    }

    function onImageChanged(event) {
        if(event.layers && !event.layers[0].added && (event.layers[0].removed || event.layers[0].name)) {
            componentsMap.forEach(item => {
                Restructure.searchAndModifyControlledArray(event.layers, item);
            });
        }
        if(event.selection) {
            _generator.evaluateJSXFile(path.join(__dirname, "../jsx/ShowPanel.jsx"), languagesStruct);
        }
    }

    function onButtonMenuClicked(event) {
        let menu = event.generatorMenuChanged;
        let elementMap = getElementMap(menu.name);
        let classRef = structureMap.get(elementMap);
        if(classRef === CreateComponent) {
            new CreateComponent(_generator, menu.name, elementMap);
        }
        if(classRef === CreateView) {
            new CreateViewStructure(_generator, new CreateView(_generator, menu.name, elementMap));
        }
        if(classRef === CreatePlatform) {
            new CreateViewStructure(_generator, new CreatePlatform(_generator, menu.name, elementMap));
        }
    }

    function getElementMap(menuName) {
        let keysIterable = structureMap.keys();
        for(let keys of keysIterable) {
            if(keys.has(menuName)) {
                return keys;
            }
        }
    }

    function addMenuItems(menuLables) {
        for(let menu in menuLables) {
            if(menuLables.hasOwnProperty(menu)) {
                if(menuLables[menu].type && menuLables[menu].type === "comp") {
                    componentsMap.set(menuLables[menu].label,
                        {
                            label: menuLables[menu].displayName,
                            elementArray: [],
                            filteredId: []
                        });
                }
                _generator.addMenuItem(menuLables[menu].label, menuLables[menu].displayName, true, false);
            }
        }
    }

    function createObjects() {
        structureMap = new Map();
        componentsMap = new Map();
        viewsMap = ViewParamFactory.makeViewMap();
        platformsMap = ViewParamFactory.makePlatformMap();
        createStructureMap(componentsMap, CreateComponent);
        createStructureMap(viewsMap, CreateView);
        createStructureMap(platformsMap, CreatePlatform);
    }

    function createStructureMap(typeMap, typeClass) {
        structureMap.set(typeMap, typeClass);
    }

    exports.init = init;
}());