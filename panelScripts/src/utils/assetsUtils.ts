import * as fs from "fs";

export function getAllDirectories(source) {
    return fs.readdirSync(source, {withFileTypes: true}).filter(dir => dir.isDirectory()).map(dir => dir.name);
}

export function getAllFiles(source) {
    return fs.readdirSync(source, {withFileTypes: true}).filter(dir => dir.isFile()).map(dir => dir.name);
}