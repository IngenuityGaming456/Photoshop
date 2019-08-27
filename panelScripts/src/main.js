(function () {
    "use strict";

    let _generator, _documentManager, _activeDocument, documentPromise = [],
        CreateView = require("./modules/CreateViewClasses").CreateView,
        CreateViewStructure = require("./modules/CreateViewStructure").CreateViewStructure,
        CreatePlatform = require("./modules/CreateViewClasses").CreatePlatform,
        inject = require("./modules/FactoryClass").inject,
        execute = require("./modules/FactoryClass").execute,
        Restructure = require("./modules/Restructure").Restructure,
        ViewParamFactory = require("./modules/ViewParamFactory").ViewParamFactory,
        CreateComponent = require("./modules/CreateComponent").CreateComponent,
        LayerManager = require("./modules/LayerManager").LayerManager,
        CreateLocalisationStructure = require("./modules/CreateLocalisationStructure").CreateLocalisationStructure,
        CreateTestingStructure = require("./modules/CreateTestingStructure").CreateTestingStructure,
        CreateLayoutStructure = require("./modules/CreateLayoutStructure").CreateLayoutStructure,
        DocumentManager = require("../lib/documentmanager"),
        menuLables = require("./res/menuLables"),
        path = require('path'), structureMap, _layerManager,
        componentsMap, viewsMap, platformsMap, layoutMap, localisationMap, testingMap;

    /**
     * This is the first function to get called by the generator.
     * @param {*} generator 
     */
    async function init(generator, config, logger) {
        _generator = generator;
        createObjects();
        await addMenuItems(menuLables);
        await initDocument(config, logger);
        activateListeners();
    }

    async function initDocument(config, logger) {
        _documentManager = new DocumentManager(_generator, config, logger);
        _documentManager.once("activeDocumentChanged", async(activeDocumentId) => {
            _activeDocument = await _documentManager.getDocument(activeDocumentId);
            _layerManager = inject({ref: LayerManager, dep: [],
                generator: _generator, activeDocument: _activeDocument});
            execute(_layerManager);
            await _generator.evaluateJSXFileSharedSafe(path.join(__dirname, "../jsx/networkEventCharSubscribe.jsx"));
            await _generator.evaluateJSXFile(path.join(__dirname, "../jsx/alert.jsx"), {
                message: "Document is ready to be updated as you work"
            });
        });
}

    function activateListeners() {
        _generator.onPhotoshopEvent("generatorMenuChanged", onButtonMenuClicked);
        _generator.onPhotoshopEvent("imageChanged", onImageChanged);
        _generator.onPhotoshopEvent("currentDocumentChanged", onDocumentChanged);

    }

    async function onImageChanged(event) {
        //console.log(_activeDocument.layers.layers.length);
        if (event.layers) {
            if(!event.layers[0].added && (event.layers[0].removed || event.layers[0].name)) {
                componentsMap.forEach(item => {
                    Restructure.searchAndModifyControlledArray(event.layers, item);
                });
            }
            _layerManager.addBufferData(event.layers);
        }
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
            { type: itemMap.label });
        documentPromise.push(jsxPromise);
        jsxPromise.then(controlledString => {
            if (!controlledString.length) {
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

    function onButtonMenuClicked(event) {
        const menu = event.generatorMenuChanged;
        const elementMap = getElementMap(menu.name);
        const classObj = structureMap.get(elementMap);
        if(classObj) {
            const factoryObj = inject({ref: classObj.ref, dep: classObj.dep,
                                               generator: _generator, menuName: menu.name,
                                               factoryMap: elementMap, activeDocument: _activeDocument});
            execute(factoryObj);
        }
    }

    function getElementMap(menuName) {
        let keysIterable = structureMap.keys();
        for (let keys of keysIterable) {
            if (keys.has(menuName)) {
                return keys;
            }
        }
    }

    async function addMenuItems(menuLables) {
        for (let menu in menuLables) {
            let menuState = true;
            if (menuLables.hasOwnProperty(menu)) {
                if (menuLables[menu].type === "comp") {
                    componentsMap.set(menuLables[menu].label,
                        {
                            label: menuLables[menu].displayName,
                            elementArray: [],
                            filteredId: []
                        });
                }
                //Only for debugging, the flow will change at time of validation.
                if(menuLables[menu].enabled !== undefined) {
                    menuState = menuLables[menu].enabled;
                }
                await _generator.addMenuItem(menuLables[menu].label,
                    menuLables[menu].displayName, menuState, false);
            }
        }
    }

    function createObjects() {
        structureMap = new Map();
        componentsMap = new Map();
        viewsMap = ViewParamFactory.makeViewMap();
        platformsMap = ViewParamFactory.makePlatformMap();
        layoutMap = ViewParamFactory.makeLayoutMap();
        localisationMap = ViewParamFactory.makeLocalisationMap();
        testingMap = ViewParamFactory.makeTestingMap();
        structureMap
        .set(componentsMap, {
            ref: CreateComponent,
            dep: []
        })
        .set(viewsMap, {
            ref: CreateViewStructure,
            dep: [CreateView]
        })
        .set(platformsMap, {
            ref: CreateViewStructure,
            dep: [CreatePlatform]
        })
        .set(layoutMap, {
            ref: CreateLayoutStructure,
            dep: []
        })
        .set(localisationMap, {
            ref: CreateLocalisationStructure,
            dep: []
        })
        .set(testingMap, {
            ref: CreateTestingStructure,
            dep: []
        });
    }

    exports.init = init;
}());