import { App, ExtraButtonComponent, Modal, Setting } from 'obsidian';
import { ManagerSettings } from '../settings/data';
import Manager from 'main';

export class DeleteModal extends Modal {
    settings: ManagerSettings;
    manager: Manager;

    private deleteCallback: () => void;

    constructor(app: App, manager: Manager, deleteCallback: () => void) {
        super(app);
        this.manager = manager;
        this.deleteCallback = deleteCallback;
    }

    private async showHead() {
        //@ts-ignore
        const modalEl: HTMLElement = this.contentEl.parentElement;
        modalEl.addClass('manager-editor__container');
        modalEl.removeChild(modalEl.getElementsByClassName('modal-close-button')[0]);
        this.titleEl.parentElement?.addClass('manager-container__header');
        this.contentEl.addClass('manager-item-container');

        // [标题行]
        const titleBar = new Setting(this.titleEl)
        titleBar.setClass('manager-delete__title')
        titleBar.setName(this.manager.translator.t('卸载_标题'));

        // [标题行] 关闭按钮
        const closeButton = new ExtraButtonComponent(titleBar.controlEl)
        closeButton.setIcon('circle-x')
        closeButton.onClick(() => this.close());
    }

    private async showData() {
        const titleBar = new Setting(this.titleEl)
        titleBar.setName(this.manager.translator.t('卸载_提示'));
        const actionBar = new Setting(this.titleEl)
        actionBar.setClass('manager-delete__action')
        actionBar.addButton(cb => cb
            .setWarning()
            .setButtonText(this.manager.translator.t('卸载_卸载'))
            .onClick(() => {
                this.deleteCallback();
                this.close();
            })
        );
        actionBar.addButton(cb => cb
            .setButtonText(this.manager.translator.t('卸载_取消'))
            .onClick(() => { this.close(); })
        );
    }

    async onOpen() {
        await this.showHead();
        await this.showData();
    }

    async onClose() {
        this.contentEl.empty();
    }
}

