import {PanelController} from "./PanelController";
import {utils} from "../utils/utils";

export class PanelControllerApp extends PanelController {

    protected processSubmission() {
        super.processSubmission();
        this.view.checkBoxArray.forEach(item => {
            const parentLI = utils.getParentLI(item);
            if (utils.isInContainerOrElement(parentLI)) {
                this.handleCheckbox(parentLI, item);
            }
        });
    }

    protected handleOutputElement(output) {
        super.handleOutputElement(output);
        const parentLI = utils.getParentLI(utils.getParentLI(output));
        if (utils.isInContainerOrElement(parentLI)) {
            this.handleUncheck(parentLI);
            output.disabled = parentLI.children[0].disabled;
        }
    }

    protected subscribeListeners() {
        super.subscribeListeners();
        this.eventsObj.on("safeToLock", this.onSafeToLock.bind(this));
    }

    protected listenToConnection() {
        super.listenToConnection();
        this.socket.on("destroy", () => {
            this.onDestroy();
        });
        this.socket.on("enablePage", () => this.onEnablePage());
        this.socket.on("disablePage", () => this.onDisablePage());
    }

    private onSafeToLock(childInput) {
        this.lockedItems.push(childInput);
        utils.setIntermediateState(childInput);
    }

    private handleUncheck(parentLI) {
        const checkBoxDeletionCount = utils.getCheckboxDeletion(parentLI);
        if (checkBoxDeletionCount && utils.getParentLI(parentLI).children[0].checked) {
            parentLI.children[0].disabled = false;
        }
        try {
            utils.setAllDeletedState(checkBoxDeletionCount, parentLI)
                .setInBetweenState(parentLI);
        } catch (err) {
            console.log("Uncheck handled");
        }
    }

    private handleCheckbox(parentLI, itemCheckbox) {
        const baseUL = utils.getChildrenUL(parentLI);
        let checkboxCount = 0;
        const totalChildren = Array.from(baseUL.children).length;
        Array.from(baseUL.children).forEach(itemLI => {
            const input = itemLI.children[0];
            if (this.isInLockedState(input)) {
                checkboxCount++;
            }
        });
        if (checkboxCount === totalChildren) {
            itemCheckbox.disabled = true;
        }
    }

    private isInLockedState(item) {
        return item.checked && item.disabled;
    }

    private onDestroy() {
        this.csInterface.closeExtension();
    }

    private onEnablePage() {
        this.view.enablePage();
    }

    private onDisablePage() {
        this.view.disablePage();
    }
}