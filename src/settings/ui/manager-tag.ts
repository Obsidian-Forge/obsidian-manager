import { t } from "src/lang/inxdex";
import BaseSetting from "../base-setting";
import { Notice, Setting } from "obsidian";

export default class ManagerTag extends BaseSetting {
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
                .setPlaceholder('名称')
                .onChange((value) => {
                    name = value;
                })
            )
            .addExtraButton(cb => cb
                .setIcon('plus')
                .onClick(() => {
                    const containsId = this.manager.settings.TAGS.some(tag => tag.id === id);
                    if (!containsId && id !== '') {
                        if (color === '') color = '#000000';
                        this.manager.settings.TAGS.push({ id, name, color });
                        this.manager.saveSettings();
                        this.settingTab.tagDisplay();
                        new Notice('[标签] 标签已添加');
                    } else {
                        new Notice('[标签] ID已存在或为空');
                    }
                })
            )
        this.manager.settings.TAGS.forEach((tag, index) => {
            const item = new Setting(this.containerEl)
            item.setClass('manager-setting-tag__item')
            item.setName(`第${index + 1}项: ${tag.id}`)
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
                    const hasTestTag = this.settings.Plugins.some(plugin => plugin.tags && plugin.tags.includes(tag.id));
                    if (!hasTestTag) {
                        this.manager.settings.TAGS = this.manager.settings.TAGS.filter(t => t.id !== tag.id);
                        this.manager.saveSettings();
                        this.settingTab.tagDisplay();
                        new Notice('[标签] 标签删除成功');
                    } else {
                        new Notice('[标签] 无法删除此标签，此标签下存在插件');
                    }
                })
            )
        });

    }
}