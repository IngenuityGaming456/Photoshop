import * as fs from "fs";

export function getAllDirectories(source) {
    return fs.readdirSync(source, {withFileTypes: true}).filter(dir => dir.isDirectory()).map(dir => dir.name);
}

export function getAllFiles(source) {
    return fs.readdirSync(source, {withFileTypes: true}).filter(dir => dir.isFile()).map(dir => dir.name);
}

export function upperDispatch(artLayers, fileName, allArtLayers) {
    for(let key in artLayers) {
        if(key === "common") {
            const viewsObj = artLayers[key];
            for(let view in viewsObj) {
                const fileChangeArr = viewsObj[view]?.[fileName];
                if(fileChangeArr) {
                    allArtLayers.push(...fileChangeArr);
                }
            }
        } else {
            upperDispatch(artLayers[key], fileName, allArtLayers);
        }
    }
    return allArtLayers;
}

export function allCommonDispatch(artLayers, platform, fileName, allArtLayers) {
    return upperDispatch(artLayers[platform], fileName, allArtLayers);
}

export function allViewDispatch(artLayers, platform, view, fileName, allArtLayers) {
    return allArtLayers(...artLayers[platform][view][fileName]);
}