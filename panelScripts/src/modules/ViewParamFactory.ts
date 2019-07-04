let baseGameStruct =   require("../res/baseGame"),
    bigWinStruct =     require("../res/bigWin"),
    paytableStruct =   require("../res/paytable"),
    introOutroStruct = require("../res/IntroOutro"),
    freeGameStruct =   require("../res/freeGame"),
    backgroundStruct = require("../res/background"),
    platformStruct =   require("../res/platform");

export class ViewParamFactory {

    public static makeViewMap() {
        let viewMap = new Map(),
            backgroundBG = {backgrounds: backgroundStruct.backgrounds},
            backgroundFG = {backgroundsFg: backgroundStruct.fgbackgrounds};
        viewMap.set("AddMainView", {
            baseGame: baseGameStruct,
            bigWin: bigWinStruct,
            background: backgroundBG
        });
        viewMap.set("AddPaytable", {
            paytable: paytableStruct
        });
        viewMap.set("AddIntroOutro", {
            introOutro: introOutroStruct
        });
        viewMap.set("AddFreeGameView", {
            freeGame: freeGameStruct,
            background: backgroundFG
        });
        return viewMap;
    };

    public static makePlatformMap() {
        let desktopPlatform = {desktop: platformStruct.desktop},
            mobilePlatform = {mobile: platformStruct.mobile};
        let platformMap = new Map();
        platformMap.set("DesktopView", {
            desktop: desktopPlatform
        });
        platformMap.set("MobileView", {
            mobile: mobilePlatform
        });
        return platformMap;
    }
}
