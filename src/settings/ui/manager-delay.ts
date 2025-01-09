import { t } from "src/lang/inxdex";
import BaseSetting from "../base-setting";
import { Notice, Setting } from "obsidian";

export default class ManagerDelay extends BaseSetting {
    main(): void {
        let id = '';
        let name = '';
        let time = 0;
        new Setting(this.containerEl)
            .setHeading()
            .setName(t('通用_新增_文本'))
            .addSlider(cb => cb
                .setLimits(0, 100, 1)
                .setValue(time)
                .setDynamicTooltip()
                .onChange((value) => {
                    time = value;
                })
            )
            .addText(cb => cb
                .setPlaceholder('ID')
                .onChange((value) => {
                    id = value;
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
                    const containsId = this.manager.settings.DELAYS.some(delay => delay.id === id);
                    if (!containsId && id !== '') {
                        this.manager.settings.DELAYS.push({ id, name, time });
                        this.manager.saveSettings();
                        this.settingTab.delayDisplay();
                        new Notice(t('设置_延迟设置_通知_一'));
                    } else {
                        new Notice(t('设置_延迟设置_通知_二'));
                    }
                })
            ) 
        this.manager.settings.DELAYS.forEach((delay, index) => {
            const item = new Setting(this.containerEl)
            item.settingEl.addClass('manager-setting-group__item')
            item.setName(`${index + 1}. ${delay.id}`)
            item.addSlider(cb => cb
                .setLimits(0, 100, 1)
                .setValue(delay.time)
                .setDynamicTooltip()
                .onChange((value) => {
                    delay.time = value
                    this.manager.saveSettings();
                })
            )
            item.addText(cb => cb
                .setValue(delay.name)
                .onChange((value) => {
                    delay.name = value;
                    this.manager.saveSettings();
                })
            )
            item.addExtraButton(cb => cb
                .setIcon('trash-2')
                .onClick(() => {
                    const hasTestGroup = this.settings.Plugins.some(plugin => plugin.delay === delay.id);
                    if (!hasTestGroup) {
                        this.manager.settings.DELAYS = this.manager.settings.DELAYS.filter(t => t.id !== delay.id);
                        this.manager.saveSettings();
                        this.settingTab.delayDisplay();
                        new Notice(t('设置_延迟设置_通知_三'));
                    } else {
                        new Notice(t('设置_延迟设置_通知_四'));
                    }
                })
            )
        });

    }
}