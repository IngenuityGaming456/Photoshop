(function () {
    "use strict";
    let _generator, _documentManager, _activeDocument, documentPromise = [],
        ModelFactory = require("./models/ModelFactory").ModelFactory,
        CreateView = require("./modules/CreateViewClasses").CreateView,
        CreateViewStructure = require("./modules/CreateViewStructure").CreateViewStructure,
        CreatePlatform = require("./modules/CreateViewClasses").CreatePlatform,
        MenuManager = require("./modules/MenuManager").MenuManager,
        inject = require("./modules/FactoryClass").inject,
        execute = require("./modules/FactoryClass").execute,
        CreateComponent = require("./modules/CreateComponent").CreateComponent,
        LayerManager = require("./modules/LayerManager").LayerManager,
        ContainerPanelResponse = require("./modules/ContainerPanelResponse").ContainerPanelResponse,
        Validation = require("./modules/Validation").Validation,
        EventsManager = require("./modules/EventsManager").EventsManager,
        CreateLocalisationStructure = require("./modules/CreateLocalisationStructure").CreateLocalisationStructure,
        CreateTestingStructure = require("./modules/CreateTestingStructure").CreateTestingStructure,
        CreateLayoutStructure = require("./modules/CreateLayoutStructure").CreateLayoutStructure,
        AddedPlatformState = require("./states/photoshopMenuStates/AddedPlatformState").AddedPlatformState,
        NoPlatformState = require("./states/photoshopMenuStates/NoPlatformState").NoPlatformState,
        DeletedViewState = require("./states/photoshopMenuStates/DeletedViewsState").DeletedViewState,
        AddedViewState = require("./states/photoshopMenuStates/AddedViewState").AddedViewState,
        DocumentManager = require("../lib/documentmanager"), _modelFactory,
        path = require('path'), structureMap, _layerManager, _containerResponse, _validation,
        componentsMap, viewsMap, platformsMap, layoutMap, localisationMap, testingMap, _socket,
        _eventsManager, io = require('socket.io')(8099), fs = require("fs"), _menuManager, _mapFactory;
        

    /**
     * This is the first function to get called by the generator.
     * @param {*} generator 
     */
    async function init(generator, config, logger) {
        _generator = generator;
        activateListeners();
        createObjects();
        createSocket();
        await initDocument(config, logger);
    }

    async function initDocument(config, logger) {
        _documentManager = new DocumentManager(_generator, config, logger);
        _documentManager.once("activeDocumentChanged", async(activeDocumentId) => {
            _activeDocument = await _documentManager.getDocument(activeDocumentId);
            await _generator.evaluateJSXFileSharedSafe(path.join(__dirname, "../jsx/networkEventCharSubscribe.jsx"));
            await _generator.evaluateJSXFile(path.join(__dirname, "../jsx/alert.jsx"), {
                message: "Document is ready to be updated as you work"
            });
            createDependencies();
            await addMenuItems();
        });
    }   

    function activateListeners() {
        _generator.onPhotoshopEvent("generatorMenuChanged", onButtonMenuClicked);
        _generator.onPhotoshopEvent("imageChanged", onImageChanged);
        _generator.on("UncheckFromContainerPanel", (layerName) => { onUncheckPanel(layerName); });
       // _generator.onPhotoshopEvent("currentDocumentChanged", onDocumentChanged);
    }

    function onUncheckPanel(layerName) {
        _socket.emit("UncheckFromContainerPanel", layerName);
    }
    
    function onImageChanged(event) {
        execute(_eventsManager, {generator: _generator, events: event});
    }

    // function onDocumentChanged() {
    //     componentsMap.forEach(handleChange);
    //     Promise.all(documentPromise)
    //         .then(
    //             _generator.evaluateJSXFile(path.join(__dirname, "../jsx/alert.jsx"), {
    //                 message: "Search is done, Happy Photoshopping"
    //             }));
    // }
    //
    // function handleChange(itemMap) {
    //     let jsxPromise = _generator.evaluateJSXFile(path.join(__dirname, "../jsx/searchDocument.jsx"),
    //         { type: itemMap.label });
    //     documentPromise.push(jsxPromise);
    //     jsxPromise.then(controlledString => {
    //         if (!controlledString.length) {
    //             return;
    //         }
    //         let controlledArrays = controlledString.split(",");
    //         controlledArrays.forEach(item => {
    //             let colonPos = item.search(":");
    //             let typeObj = {
    //                 id: Number(item.slice(0, colonPos)),
    //                 sequence: Number(item.slice(colonPos + 1))
    //             };
    //             itemMap.elementArray.push(typeObj);
    //         });
    //     });
    // }

    function onButtonMenuClicked(event) {
        const menu = event.generatorMenuChanged;
        const elementMap = getElementMap(menu.name);
        const classObj = structureMap.get(elementMap);
        if(classObj) {
            const factoryObj = inject({ref: classObj.ref, dep: classObj.dep});
            execute(factoryObj, {generator: _generator, menuName: menu.name, activeDocument: _activeDocument});
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

    async function addMenuItems() {
        execute(_menuManager, {generator: _generator});
    }

    function createSocket() {
        console.log("making a socket connection");
        io.on("connection", (socket) => {
            _socket = socket;
            _socket.on("getQuestJson", storage => {
                _modelFactory.handleSocketStorage(storage);
                setViewMap();
            });
        });
    }

    function setViewMap(responseMap) {
        viewsMap = _modelFactory.getMappingModel().getViewMap(responseMap);
        structureMap.set(viewsMap, {
            ref: CreateViewStructure,
            dep: [CreateView, ModelFactory]
        });
    }

    function createDependencies() {
        _layerManager = inject({ref: LayerManager, dep: []});
        execute(_layerManager, {generator: _generator, activeDocument: _activeDocument});
        _containerResponse = inject({ref: ContainerPanelResponse, dep: [ModelFactory]});
        execute(_containerResponse, {generator: _generator, activeDocument: _activeDocument});
        _validation = inject({ref: Validation, dep: [ModelFactory]});
        execute(_validation, {generator: _generator});
        _menuManager = inject({ref: MenuManager, dep: [ModelFactory, NoPlatformState, AddedPlatformState,
                                      AddedViewState, DeletedViewState]});
        _eventsManager = inject({ref: EventsManager, dep: []});
    }

    function createObjects() {
        instantiateModels();
        structureMap = new Map();
        _mapFactory = _modelFactory.getMappingModel();
        componentsMap = _mapFactory.getComponentsMap();
        platformsMap = _mapFactory.getPlatformMap();
        layoutMap = _mapFactory.getLayoutMap();
        localisationMap = _mapFactory.getLocalisationMap();
        testingMap = _mapFactory.getTestingMap();
        structureMap
        .set(componentsMap, {
            ref: CreateComponent,
            dep: [ModelFactory]
        })
        .set(platformsMap, {
            ref: CreateViewStructure,
            dep: [CreatePlatform, ModelFactory]
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

    function instantiateModels() {
        _modelFactory = inject({ref: ModelFactory, dep: []});
        execute(_modelFactory, {generator: _generator});
    }

    exports.init = init;
}());