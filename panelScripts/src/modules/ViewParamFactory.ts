let baseGameStruct = require("../res/baseGame"),
    bigWinStruct = require("../res/bigWin"),
    paytableStruct = require("../res/paytable"),
    introOutroStruct = require("../res/IntroOutro"),
    freeGameStruct = require("../res/freeGame"),
    backgroundStruct = require("../res/background"),
    platformStruct = require("../res/platform");

export class ViewParamFactory {

    public static makeViewMap() {
        let viewMap = new Map(),
            backgroundBG = { backgrounds: backgroundStruct.backgrounds },
            backgroundFG = { backgroundsFg: backgroundStruct.fgbackgrounds };
        viewMap.set("AddMainView", {
            background: backgroundBG,
            bigWin: bigWinStruct,
            baseGame: baseGameStruct
        }).set("AddPaytable", {
            paytable: paytableStruct
        }).set("AddIntroOutro", {
            introOutro: introOutroStruct
        }).set("AddFreeGameView", {
            background: backgroundFG,
            freeGame: freeGameStruct
        });
        return viewMap;
    };

    public static makePlatformMap() {
        let desktopPlatform = { desktop: platformStruct.desktop },
            mobilePlatform = { mobile: platformStruct.mobile };
        let platformMap = new Map();
        platformMap.set("DesktopView", {
            desktop: desktopPlatform
        }).set("MobileView", {
            mobile: mobilePlatform
        });
        return platformMap;
    }

    public static makeLayoutMap() {
        const layoutMap = new Map();
        layoutMap.set("LayoutEnabled", {});
        return layoutMap;
    }

    public static makeTestingMap() {
        const testingMap = new Map();
        testingMap.set("Testing", {});
        return testingMap;
    }
}
