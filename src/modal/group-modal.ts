import { App, ExtraButtonComponent, Modal, Notice, Setting } from 'obsidian';
import { ManagerSettings } from '../settings/data';
import Manager from 'main';
import { ManagerModal } from './manager-modal';
import { ManagerPlugin } from 'src/data/types';
import Commands from 'src/command';

export class GroupModal extends Modal {
    settings: ManagerSettings;
    manager: Manager;
    managerModal: ManagerModal;
    managerPlugin: ManagerPlugin;
    selected: string;
    add: boolean;

    constructor(app: App, manager: Manager, managerModal: ManagerModal, managerPlugin: ManagerPlugin) {
        super(app);
        this.settings = manager.settings;
        this.manager = manager;
        this.managerModal = managerModal;
        this.managerPlugin = managerPlugin;
        this.selected = '';
        this.add = false;
    }

    private async showHead() {
        //@ts-ignore
        const modalEl: HTMLElement = this.contentEl.parentElement;
        modalEl.addClass('manager-editor__container');
        modalEl.removeChild(modalEl.getElementsByClassName('modal-close-button')[0]);
        this.titleEl.parentElement?.addClass('manager-container__header');
        this.contentEl.addClass('manager-item-container');

        // [标题行]
        const titleBar = new Setting(this.titleEl).setClass('manager-bar__title').setName(`[${this.managerPlugin.name}]`);
        // [标题行] 关闭按钮
        const closeButton = new ExtraButtonComponent(titleBar.controlEl)
        closeButton.setIcon('circle-x')
        closeButton.onClick(() => this.close());
    }

    private async showData() {
        for (const group of this.settings.GROUPS) {
            const itemEl = new Setting(this.contentEl)
            itemEl.setClass('manager-editor__item')
            if (this.selected == '' || this.selected != group.id) {
                itemEl.addExtraButton(cb => cb
                    .setIcon('settings')
                    .onClick(() => {
                        this.selected = group.id;
                        this.reloadShowData();
                    })
                )
                itemEl.addToggle(cb => cb
                    .setValue(group.id === this.managerPlugin.group)
                    .onChange(() => {
                        this.managerPlugin.group = this.managerPlugin.group === group.id ? '' : group.id;
                        this.manager.saveSettings();
                        this.managerModal.reloadShowData();
                        this.reloadShowData();
                    })
                )
                const groupEl = createSpan({ cls: 'manager-item__name-group' });
                itemEl.nameEl.appendChild(groupEl);
                const tag = this.manager.createTag(group.name, group.color, this.settings.GROUP_STYLE);
                groupEl.appendChild(tag);
            }
            if (this.selected != '' && this.selected == group.id) {
                itemEl.addColorPicker(cb => cb
                    .setValue(group.color)
                    .onChange((value) => {
                        group.color = value;
                        this.manager.saveSettings();
                        this.reloadShowData();
                    })
                )
                itemEl.addText(cb => cb
                    .setValue(group.name)
                    .onChange((value) => {
                        group.name = value;
                        this.manager.saveSettings();
                    })
                    .inputEl.addClass('manager-editor__item-input')
                )
                itemEl.addExtraButton(cb => cb
                    .setIcon('trash-2')
                    .onClick(() => {
                        const hasTestGroup = this.settings.Plugins.some(plugin => plugin.group === group.id);
                        if (!hasTestGroup) {
                            this.manager.settings.GROUPS = this.manager.settings.GROUPS.filter(t => t.id !== group.id);
                            this.manager.saveSettings();
                            this.reloadShowData();
                            Commands(this.app, this.manager);
                            new Notice(this.manager.translator.t('设置_分组设置_通知_三'));
                        } else {
                            new Notice(this.manager.translator.t('设置_分组设置_通知_四'));
                        }
                    })
                )
                itemEl.addExtraButton(cb => cb
                    .setIcon('save')
                    .onClick(() => {
                        this.selected = '';
                        this.reloadShowData();
                        this.managerModal.reloadShowData();
                    })
                )
                const groupEl = createSpan({ cls: 'manager-item__name-group' });
                itemEl.nameEl.appendChild(groupEl);
                const tag = this.manager.createTag(group.name, group.color, this.settings.GROUP_STYLE);
                groupEl.appendChild(tag);
            }
        }
        if (this.add) {
            let id = '';
            let name = '';
            let color = '';
            const foodBar = new Setting(this.contentEl).setClass('manager-bar__title');
            foodBar.infoEl.remove();
            foodBar.addColorPicker(cb => cb
                .setValue(color)
                .onChange((value) => {
                    color = value;
                })
            )
            foodBar.addText(cb => cb
                .setPlaceholder('ID')
                .onChange((value) => { id = value; this.manager.saveSettings(); })
                .inputEl.addClass('manager-editor__item-input')
            )
            foodBar.addText(cb => cb
                .setPlaceholder(this.manager.translator.t('通用_名称_文本'))
                .onChange((value) => { name = value; })
                .inputEl.addClass('manager-editor__item-input')
            )
            foodBar.addExtraButton(cb => cb
                .setIcon('plus')
                .onClick(() => {
                    const containsId = this.manager.settings.GROUPS.some(tag => tag.id === id);
                    if (!containsId && id !== '') {
                        if (color === '') color = '#000000';
                        this.manager.settings.GROUPS.push({ id, name, color });
                        this.manager.saveSettings();
                        this.add = false;
                        this.reloadShowData();
                        Commands(this.app, this.manager);
                        new Notice(this.manager.translator.t('设置_分组设置_通知_一'));
                    } else {
                        new Notice(this.manager.translator.t('设置_分组设置_通知_二'));
                    }
                })
            )
        } else {
            // [底部行] 新增
            const foodBar = new Setting(this.contentEl).setClass('manager-bar__title').setName(this.manager.translator.t('通用_新增_文本'));
            const addButton = new ExtraButtonComponent(foodBar.controlEl)
            addButton.setIcon('circle-plus')
            addButton.onClick(() => {
                this.add = true;
                this.reloadShowData();
            });
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

