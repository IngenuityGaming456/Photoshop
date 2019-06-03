(function () {
    "use strict";
    let _generator, clickCount = 0;
    let DrawView = require("./modules/DrawView").DrawView;
    let baseGameStruct = require("./res/baseGame");
    let bigWinStruct = require("./res/bigWin");
    let paytableStruct = require("./res/paytable");
    let introOutroStruct = require("./res/IntroOutro");
    let freeGameStruct = require("./res/freeGame");
    let backgroundStruct = require("./res/background");
    function init(generator) {
        _generator = generator;
        const menuLables = getMenuItems();
        addMenuItems(menuLables);
        _generator.onPhotoshopEvent("generatorMenuChanged", onButtonMenuClicked);
    }

    function onButtonMenuClicked(event) {
        clickCount++;
        let menu = event.generatorMenuChanged;
        let params = {clicks: clickCount};
        if(menu.name === "AddMainView") {
            let baseGameSec = backgroundStruct.backgrounds;
            let baseGameObj = {backgrounds: baseGameSec};
            params = {
                baseGame: baseGameStruct,
            };
            new DrawView(params, _generator, menu.name);
        }
        if(menu.name === "AddPaytable") {
            params = {
                paytable: paytableStruct
            };
            new DrawView(params, _generator, menu.name);
        }
        if(menu.name === "AddIntroOutro") {
            params = {
                introOutro: introOutroStruct
            };
            new DrawView(params, _generator, menu.name);
        }
        if(menu.name === "AddFreeGameView") {
            let freeGameSec = backgroundStruct.fgbackgrounds;
            let freeGameObj = {fgbackgrounds: freeGameSec};
            menu.name = "AddMainView";
            params = {
                freeGame: freeGameStruct,
                background: freeGameObj
            };
            new DrawView(params, _generator, menu.name);
        } /*else {
            _generator.evaluateJSXFile("C:\\Users\\hswaroop\\photoshop-scripting\\panelScripts\\jsx\\"
                + menu.name + ".jsx", params)
                .then((data) => console.log(data));
        }*/
    }

    function addMenuItems(menuLables) {
        for(let menu in menuLables) {
            if(menuLables.hasOwnProperty(menu)) {
                _generator.addMenuItem(menuLables[menu].label, menuLables[menu].displayName, true, false);
            }
        }
    }

    function getMenuItems() {
        let menus = {
            FreeGameView: {
                label: "AddFreeGameView",
                displayName: "FreeGameView"
            },
            IntroOutro: {
                label: "AddIntroOutro",
                displayName: "IntroOutro"
            },
            Paytable: {
                label: "AddPaytable",
                displayName: "Paytable"
            },
            MainView: {
                label: "AddMainView",
                displayName: "MainView"
            },
            EmptyContainer: {
                label: "AddEmptyCont",
                displayName: "EmptyContainer"
            },
            Button: {
                label: "AddButton",
                displayName: "Button"
            },
            Animation: {
                label: "AddAnimation",
                displayName: "Animation"
            },
            Symbol: {
                label: "AddSymbol",
                displayName: "Symbol"
            },
            Payline: {
                label: "AddPayline",
                displayName: "Payline"
            },
            WinFrame: {
                label: "AddWinFrame",
                displayName: "WinFrame"
            }
        };
        return menus;
    }

    exports.init = init;
}());