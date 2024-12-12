import { App, ExtraButtonComponent, Modal, Setting } from 'obsidian';
import { ManagerSettings } from '../settings/data';
import Manager from 'main';
import { ManagerModal } from './manager-modal';
import { ManagerPlugin } from 'src/data/types';

export class GroupModal extends Modal {
    settings: ManagerSettings;
    manager: Manager;
    managerModal: ManagerModal;
    managerPlugin: ManagerPlugin;

    constructor(app: App, manager: Manager, managerModal: ManagerModal, managerPlugin: ManagerPlugin) {
        super(app);
        this.settings = manager.settings;
        this.manager = manager;
        this.managerModal = managerModal;
        this.managerPlugin = managerPlugin;
    }

    private async showHead() {
        //@ts-ignore
        const modalEl: HTMLElement = this.contentEl.parentElement;
        modalEl.addClass('manager-editor__container');
        modalEl.removeChild(modalEl.getElementsByClassName('modal-close-button')[0]);
        this.titleEl.parentElement?.addClass('manager-container__header');
        this.contentEl.addClass('manager-item-container');

        // [标题行]
        const titleBar = new Setting(this.titleEl).setClass('manager-bar__title').setName(this.managerPlugin.name);

        // [标题行] 关闭按钮
        const closeButton = new ExtraButtonComponent(titleBar.controlEl)
        closeButton.setIcon('circle-x')
        closeButton.onClick(() => this.close());
    }

    private async showData() {
        // @ts-ignore
        const allGroups: Record<string, string> = this.settings.GROUPS.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {});
        for (const group in allGroups) {
            new Setting(this.contentEl)
                .setClass('manager-editor__item')
                .setName(allGroups[group])
                .addToggle(cb => cb
                    .setValue(group === this.managerPlugin.group)
                    .onChange(() => {
                        this.managerPlugin.group = group;
                        this.manager.saveSettings();
                        this.managerModal.reloadShowData();
                        this.reloadShowData();
                    })
                );
        }
    }

    private async reloadShowData() {
        let scrollTop = 0;
        const modalElement: HTMLElement = this.contentEl;
        scrollTop = modalElement.scrollTop;
        modalElement.empty();
        await this.showData();
        modalElement.scrollTo(0, scrollTop);
    }

    async onOpen() {
        await this.showHead();
        await this.showData();
    }

    async onClose() {
        this.contentEl.empty();
    }
}

