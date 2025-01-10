import BaseSetting from "../base-setting";
import { DropdownComponent, Setting, ToggleComponent } from "obsidian";
import { GROUP_STYLE, ITEM_STYLE, TAG_STYLE } from "src/data/data";
import { t } from "src/lang/inxdex";

export default class ManagerBasis extends BaseSetting {
    main(): void {
        const itemStyleBar = new Setting(this.containerEl).setName(t('设置_基础设置_目录样式_标题')).setDesc(t('设置_基础设置_目录样式_描述'));
        const itemStyleDropdown = new DropdownComponent(itemStyleBar.controlEl);
        itemStyleDropdown.addOptions(ITEM_STYLE);
        itemStyleDropdown.setValue(this.settings.ITEM_STYLE);
        itemStyleDropdown.onChange((value) => {
            this.settings.ITEM_STYLE = value;
            this.manager.saveSettings();
        });

        const groupStyleBar = new Setting(this.containerEl).setName(t('设置_基础设置_分组样式_标题')).setDesc(t('设置_基础设置_分组样式_描述'));
        const groupStyleDropdown = new DropdownComponent(groupStyleBar.controlEl);
        groupStyleDropdown.addOptions(GROUP_STYLE);
        groupStyleDropdown.setValue(this.settings.GROUP_STYLE);
        groupStyleDropdown.onChange((value) => {
            this.settings.GROUP_STYLE = value;
            this.manager.saveSettings();
        });

        const tagStyleBar = new Setting(this.containerEl).setName(t('设置_基础设置_标签样式_标题')).setDesc(t('设置_基础设置_标签样式_描述'));
        const tagStyleDropdown = new DropdownComponent(tagStyleBar.controlEl);
        tagStyleDropdown.addOptions(TAG_STYLE);
        tagStyleDropdown.setValue(this.settings.TAG_STYLE);
        tagStyleDropdown.onChange((value) => {
            this.settings.TAG_STYLE = value;
            this.manager.saveSettings();
        });

        const fadeOutDisabledPluginsBar = new Setting(this.containerEl).setName(t('设置_基础设置_淡化插件_标题')).setDesc(t('设置_基础设置_淡化插件_描述'));
        const fadeOutDisabledPluginsToggle = new ToggleComponent(fadeOutDisabledPluginsBar.controlEl);
        fadeOutDisabledPluginsToggle.setValue(this.settings.FADE_OUT_DISABLED_PLUGINS);
        fadeOutDisabledPluginsToggle.onChange((value) => {
            this.settings.FADE_OUT_DISABLED_PLUGINS = value;
            this.manager.saveSettings();
        });

        new Setting(this.containerEl)
            .setName('新安装的插件未显示原因')
            .setDesc('新插件安装后，需重启插件管理器才能显示。');

        new Setting(this.containerEl)
            .setName('首次启动需重重载所有插件原因')
            .setDesc('为确保本插件优先启动，首次使用时需重启插件，之后由本插件接管启动流程。');

    }
}