import { t } from "src/lang/inxdex";
import BaseSetting from "../base-setting";
import { Notice, Setting } from "obsidian";

export default class ManagerGroup extends BaseSetting {
    main(): void {
        let id = '';
        let name = '';
        let color = '';
        new Setting(this.containerEl)
            .setHeading()
            .setName(t('通用_新增_文本'))
            .addColorPicker(cb => cb
                .setValue(color)
                .onChange((value) => {
                    color = value;
                })
            )
            .addText(cb => cb
                .setPlaceholder('ID')
                .onChange((value) => {
                    id = value;
                    this.manager.saveSettings();
                })
            )
            .addText(cb => cb
                .setPlaceholder(t('通用_名称_文本'))
                .onChange((value) => {
                    name = value;
                })
            )
            .addExtraButton(cb => cb
                .setIcon('plus')
                .onClick(() => {
                    const containsId = this.manager.settings.GROUPS.some(tag => tag.id === id);
                    if (!containsId && id !== '') {
                        if (color === '') color = '#000000';
                        this.manager.settings.GROUPS.push({ id, name, color });
                        this.manager.saveSettings();
                        this.settingTab.groupDisplay();
                        new Notice(t('设置_分组设置_通知_一'));
                    } else {
                        new Notice(t('设置_分组设置_通知_二'));
                    }
                })
            )
        this.manager.settings.GROUPS.forEach((tag, index) => {
            const item = new Setting(this.containerEl)
            item.settingEl.addClass('manager-setting-group__item')
            item.setName(`${index + 1}. ${tag.id}`)
            item.addColorPicker(cb => cb
                .setValue(tag.color)
                .onChange((value) => {
                    tag.color = value;
                    this.manager.saveSettings();
                })
            )
            item.addText(cb => cb
                .setValue(tag.name)
                .onChange((value) => {
                    tag.name = value;
                    this.manager.saveSettings();
                })
            )
            item.addExtraButton(cb => cb
                .setIcon('trash-2')
                .onClick(() => {
                    const hasTestGroup = this.settings.Plugins.some(plugin => plugin.group === tag.id);
                    if (!hasTestGroup) {
                        this.manager.settings.GROUPS = this.manager.settings.GROUPS.filter(t => t.id !== tag.id);
                        this.manager.saveSettings();
                        this.settingTab.groupDisplay();
                        new Notice(t('设置_分组设置_通知_三'));
                    } else {
                        new Notice(t('设置_分组设置_通知_四'));
                    }
                })
            )
        });

    }
}