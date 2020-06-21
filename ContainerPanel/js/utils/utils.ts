export class utils {

    public static spliceFromFront(key: string, char: string) {
        const indexOfLine = key.indexOf(char);
        if (indexOfLine > -1) {
            return key.slice(0, indexOfLine);
        }
        return key;
    }

    public static spliceTillLast(key: string, char: string) {
        const indexOfLine = key.indexOf(char);
        if (indexOfLine > -1) {
            return key.slice(indexOfLine + 1);
        }
        return key;
    }

    public static spliceLastTillLast(key: string, char: string) {
        const indexOfLine = key.lastIndexOf(char);
        if (indexOfLine > -1) {
            return key.slice(indexOfLine + 1);
        }
        return key;
    }

    public static spliceLastFromFront(key: string, char: string) {
        const indexOfLine = key.lastIndexOf(char);
        if (indexOfLine > -1) {
            return key.slice(0, indexOfLine);
        }
        return key;
    }

    public static getParentLI(childInput) {
        const parent = childInput.parentElement;
        if(parent.tagName === "BODY") {
            return null;
        }
        if (parent.tagName === "LI") {
            return parent;
        } else {
            return utils.getParentLI(parent);
        }
    }

    public static mapToObject(map) {
        let obj = {};
        for (let [key, value] of map) {
            if (value instanceof Map) {
                obj[key] = utils.mapToObject(value);
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }

    public static objectToMap(obj) {
        let map = new Map();
        for (let key of Object.keys(obj)) {
            if (obj[key] instanceof Object) {
                map.set(key, utils.objectToMap(obj[key]));
            } else {
                map.set(key, obj[key])
            }
        }
        return map;
    }

    public static getView(item) {
        if(!item.parentElement) {
            return null;
        }
        if (item.parentElement.id === "parentUL") {
            return utils.getLISpan(item).childNodes[0].nodeValue;
        }
        return utils.getView(item.parentElement);
    }

    public static getViewInput(item) {
        if (item.parentElement.id === "parentUL") {
            return utils.getLIInput(item);
        }
        return utils.getViewInput(item.parentElement);
    }

    public static getLIInput(itemRef) {
        for(let item of Array.from(itemRef.children)) {
            if((item as HTMLElement).tagName === "INPUT") {
                return item;
            }
        }
    }

    public static getPlatformInput(item) {
        if (item.parentElement.tagName === "DIV") {
            return utils.getLIInput(item);
        }
        return utils.getPlatformInput(item.parentElement);
    }

    public static pushToCheckBoxes(checkedBoxes, item, hierarchyObj) {
        if (item.checked && item.parentElement.tagName === "LI") {
            if(!utils.decideCheck(item.parentElement)) {
                checkedBoxes.push({
                    platform: hierarchyObj.platform,
                    view: null,
                    key: null
                });
                return;
            }
            const parentLI = utils.getParentLI(item);
            checkedBoxes.push({
                platform: hierarchyObj.platform,
                view: utils.getView(item),
                key: utils.getLISpan(parentLI).childNodes[0].nodeValue
            });
        } else {
            checkedBoxes.push({
                platform: hierarchyObj.platform,
                view: utils.getView(item),
                key: item.childNodes[0].nodeValue
            });
        }
    }

    public static getData(item) {
        if(!item.parentElement || item.parentElement.tagName === "DIV") {
            return {
                view: null,
                platform: utils.getLISpan(item).childNodes[0].nodeValue
            }
        }
        if (item.parentElement.id === "parentUL") {
            const data = {
                view: utils.getLISpan(item).childNodes[0].nodeValue,
                platform: utils.getLISpan(item.parentElement.parentElement).childNodes[0].nodeValue
            };
            return data;
        }
        return utils.getData(item.parentElement);
    }

    public static isInBaseView(baseView, item) {
        const view = utils.getView(item);
        return view === baseView;
    }

    public static isInPlatform(platform, item) {
        return utils.getData(item).platform === platform;
    }

    public static getChildrenUL(baseLI) {
        const liChildren: Array<HTMLElement> = Array.from(baseLI.children);
        for(let item of liChildren) {
            if(~item.className.search(/(nested|active)/)) {
                return item;
            }
        }
    }

    public static getLISpan(baseLI) {
        const liChildren: Array<HTMLElement> = Array.from(baseLI.children);
        for(let item of liChildren) {
            if(item.tagName === "SPAN") {
                return item;
            }
        }
    }

    public static getItem(item) {
        return utils.getLISpan(item.parentElement);
    }

    public static decideCheck(item) {
        let value = utils.getLISpan(item).childNodes[0].nodeValue.search(/(desktop|portrait|landscape)/);
        return value === -1;
    }

    public static isInContainerOrElement(parentLI) {
        return parentLI && ~utils.getLISpan(parentLI).childNodes[0].nodeValue.search(/(Containers|Elements)/)
    }

    public static setIntermediateState(inputCheckbox) {
        const parentLI = utils.getParentLI(utils.getParentLI(inputCheckbox));
        if(parentLI && ~utils.getLISpan(parentLI).childNodes[0].nodeValue.search(/(Containers|Elements)/)) {
            const checkBoxDeletionCount = utils.getCheckboxDeletion(parentLI);
            try {
                utils.setNoDeletionState(checkBoxDeletionCount, parentLI)
                     .setAllDeletedState(checkBoxDeletionCount, parentLI)
                     .setInBetweenState(parentLI);
            }catch(err) {
                console.log("Intermediate state done");
            }
        }
    }

    public static getCheckboxDeletion(parentLI) {
        const parentUL = utils.getChildrenUL(parentLI);
        let checkboxDeletionCount = 0;
        const childArray = Array.from(parentUL.children);
        for(let item of childArray) {
            const itemCheckbox = (item as HTMLElement).children[0];
            if(!(itemCheckbox as HTMLInputElement).checked) {
                checkboxDeletionCount++;
            }
        }
        return checkboxDeletionCount;
    }

    public static setNoDeletionState(checkboxDeletionCount, parentLI) {
        if(!checkboxDeletionCount) {
            parentLI.children[0].indeterminate = false;
            parentLI.children[0].checked = true;
            throw new Error("Done");
        }
        return utils;
    }

    public static setAllDeletedState(checkboxDeletionCount, parentLI) {
        const parentUL = utils.getChildrenUL(parentLI);
        const childArray = Array.from(parentUL.children);
        const length = childArray.length;
        if(checkboxDeletionCount === length) {
            parentLI.children[0].indeterminate = false;
            parentLI.children[0].checked = false;
            throw new Error("Done");
        }
        return utils;
    }

    public static setInBetweenState(parentLI) {
        parentLI.children[0].indeterminate = true;
        parentLI.children[0].checked = false;
    }

    public static isSafeToLock(output) {
        const spanString = utils.getLISpan(utils.getParentLI(output)).childNodes[0].nodeValue;
        if(spanString !== utils.getView(output) && spanString !== utils.getData(output).platform &&
            !utils.isInContainerOrElement(utils.getParentLI(output))) {
            return true;
        }
    }

    public static isInElement(childInput) {
        return utils.getLISpan(utils.getParentLI(childInput)).childNodes[0].nodeValue === "Elements";
    }

    public static isInContainer(childInput) {
        return utils.getLISpan(utils.getParentLI(childInput)).childNodes[0].nodeValue === "Containers";
    }

    public static createBody() {
        let body;
        if(!document.body) {
            body = document.createElement("body");
        } else {
            return;
        }
        body.className = "dark";
        document.documentElement.appendChild(body);
    }

    public static createUL() {
        const parentUL = document.createElement("ul");
        parentUL.id = "parentUL";
        parentUL.className = "nested";
        return parentUL;
    }

    public static createRadio(name, checked) {
        const radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.name = name;
        radioButton.checked = checked;
        return radioButton;

    }
}