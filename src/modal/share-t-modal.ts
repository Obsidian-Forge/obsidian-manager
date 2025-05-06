import { App, ExtraButtonComponent, Modal, Notice, Setting } from 'obsidian';
import { ManagerSettings } from '../settings/data';
import Manager from 'main';

export class ShareTModal extends Modal {
    settings: ManagerSettings;
    manager: Manager;
    url: string = '';
    private deleteCallback: (type: string, url?: string) => void;

    constructor(app: App, manager: Manager, deleteCallback: (type: string, url?: string) => void) {
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
        titleBar.setName('共享插件');

        // [标题行] 关闭按钮
        const closeButton = new ExtraButtonComponent(titleBar.controlEl)
        closeButton.setIcon('circle-x')
        closeButton.onClick(() => this.close());
    }

    private async showData() {
        const titleBar = new Setting(this.titleEl)
        titleBar.setName('分享链接')
        titleBar.addText((cb) => {
            cb.setValue('')
            cb.setPlaceholder('请输入分享链接')
            cb.onChange((value) => {
                this.url = value;
            })
        })


        const actionBar = new Setting(this.titleEl)
        actionBar.setClass('manager-delete__action')
        actionBar.addButton(cb => cb
            .setButtonText('导入')
            .onClick(() => {
                if (!this.url) { new Notice('请输入分享链接'); return; }
                this.deleteCallback('import', this.url);
                this.close();
            })
        );
        actionBar.addButton(cb => cb
            .setButtonText('导出')
            .onClick(() => {
                this.deleteCallback('export');
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

