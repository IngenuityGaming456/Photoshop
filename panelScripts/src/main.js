(function () {
    "use strict";

    /**
     * This enum stores the default group names as enum.
     */
    var menuGroupEnum = {
        Menu_Platform: "Menu_Platform",
        Menu_View: "Menu_View",
        Menu_UI: "Menu_UI",
        Menu_Special_UI: "Menu_Special_UI"
    };

    /**
     * This object stores all the menu items as array by groups.
     */
    var menuGroups = {
        Menu_Platform: [],
        Menu_View: [],
        Menu_UI: [],
        Menu_Special_UI: [],
    };

    /** the default checked and enabled state of all menu. */
    var _defaultMenuChecked = false;
    var _defaultMenuEnabled = false;

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

    async function init(generator) {
        _generator = generator;
        createObjects();
        await addMenuItems(menuLables);
        // TODO: check if already created.
        await setEnableMenuByGroup(undefined, false);
        await setEnableMenuByGroup(menuGroupEnum.Menu_Platform, true);
        _generator.onPhotoshopEvent("generatorMenuChanged", onButtonMenuClicked);
        _generator.onPhotoshopEvent("imageChanged", onImageChanged);
        _generator.onPhotoshopEvent("currentDocumentChanged", onDocumentChanged);
    }

    /**
     * Enables/Disables a group of Menu items.
     * @param {menuGroupEnum | menuGroupEnum[] | undefined} groupId The group whose state needs to change. If undefined, then all the groups are set to `enabled` parameter.
     * @param {boolean} [enable = true] whether to enable the menu group.
     * @returns {Array} an array of all elements which state has been switched.
     */
    async function setEnableMenuByGroup(groupId, enable) {
        if (typeof enable !== "boolean") { enable = true; }

        var targets = [], i;
        if (groupId === undefined || groupId === null) {
            // if no target group specified, then modify all menu.
            for (const group in menuGroups) {
                if (menuGroups.hasOwnProperty(group)) {
                    const elementsArray = menuGroups[group];
                    if (Array.isArray(elementsArray)) {
                        targets = targets.concat(elementsArray);
                    }
                }
            }
        }
        else if (Array.isArray(groupId)) {
            groupId.forEach(id => {
                if (Array.isArray(menuGroups[id])) {
                    targets = targets.concat(menuGroups[id]);
                }
            });
        }
        else {
            targets = menuGroups[groupId].concat();
        }

        for (i = 0; i < targets.length; i++) {
            await _generator.toggleMenu(targets[i].label, enable, _defaultMenuChecked, targets[i].displayName)
        }

        return targets;
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

    function onImageChanged(event) {
        if (event.layers && !event.layers[0].added && (event.layers[0].removed || event.layers[0].name)) {
            componentsMap.forEach(item => {
                Restructure.searchAndModifyControlledArray(event.layers, item);
            });
        }
        if (event.selection) {
            _generator.evaluateJSXFile(path.join(__dirname, "../jsx/ShowPanel.jsx"), languagesStruct);
        }
    }

    function onButtonMenuClicked(event) {
        let menu = event.generatorMenuChanged;
        let elementMap = getElementMap(menu.name);
        let classRef = structureMap.get(elementMap);
        if (classRef === CreateComponent) {
            new CreateComponent(_generator, menu.name, elementMap);
        }
        if (classRef === CreateView) {
            new CreateViewStructure(_generator, new CreateView(_generator, menu.name, elementMap));
        }
        if (classRef === CreatePlatform) {
            new CreateViewStructure(_generator, new CreatePlatform(_generator, menu.name, elementMap));
        }
        // setEnableMenuByGroup(menuGroupEnum.Menu_Special_UI, false);
        // setEnableMenuByGroup(menuGroupEnum.Menu_UI, false);
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
            if (menuLables.hasOwnProperty(menu)) {
                if (menuLables[menu].type && menuLables[menu].type === "comp") {
                    componentsMap.set(menuLables[menu].label,
                        {
                            label: menuLables[menu].displayName,
                            elementArray: [],
                            filteredId: []
                        });
                }
                await _generator.addMenuItem(menuLables[menu].label, menuLables[menu].displayName, _defaultMenuEnabled, _defaultMenuChecked);

                // save a reference of the menu in a variable.
                if (menuGroups && typeof menuLables[menu].menuGroup === "string") {
                    if (!menuGroups[menuLables[menu].menuGroup]) {
                        menuGroups[menuLables[menu].menuGroup] = [];
                    }
                    menuGroups[menuLables[menu].menuGroup].push(menuLables[menu]);
                }
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