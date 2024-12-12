import { App, ExtraButtonComponent, Modal, Setting } from 'obsidian';
import { ManagerSettings } from '../settings/data';

export class DeleteModal extends Modal {
    settings: ManagerSettings;

    private deleteCallback: () => void;

    constructor(app: App, deleteCallback: () => void) {
        super(app);
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
        titleBar.setName('卸载插件');

        // [标题行] 关闭按钮
        const closeButton = new ExtraButtonComponent(titleBar.controlEl)
        closeButton.setIcon('circle-x')
        closeButton.onClick(() => this.close());
    }

    private async showData() {
        const titleBar = new Setting(this.titleEl)
        titleBar.setName('你确定要卸载此插件吗？这将删除插件的文件夹。');
        const actionBar = new Setting(this.titleEl)
        actionBar.setClass('manager-delete__action')
        actionBar.addButton(cb => cb
            .setWarning()
            .setButtonText('卸载')
            .onClick(() => {
                this.deleteCallback();
                this.close();
            })
        );
        actionBar.addButton(cb => cb
            .setButtonText('取消')
            .onClick(() => {
                this.close();
            })
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

