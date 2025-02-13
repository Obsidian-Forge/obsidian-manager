import BaseSetting from "../base-setting";
import { DropdownComponent, Setting, ToggleComponent } from "obsidian";
import Commands from "src/command";
// import { GROUP_STYLE, ITEM_STYLE, TAG_STYLE } from "src/data/data";

export default class ManagerBasis extends BaseSetting {
    private ITEM_STYLE = {
        'alwaysExpand': this.manager.translator.t('设置_基础设置_目录样式_选项_一'),
        'neverExpand': this.manager.translator.t('设置_基础设置_目录样式_选项_二'),
        'hoverExpand': this.manager.translator.t('设置_基础设置_目录样式_选项_三'),
        'clickExpand': this.manager.translator.t('设置_基础设置_目录样式_选项_四'),
    }
    private GROUP_STYLE = {
        'a': this.manager.translator.t('设置_基础设置_分组样式_选项_一'),
        'b': this.manager.translator.t('设置_基础设置_分组样式_选项_二'),
        'c': this.manager.translator.t('设置_基础设置_分组样式_选项_三'), 
        'd': this.manager.translator.t('设置_基础设置_分组样式_选项_四')
    }
    private TAG_STYLE = {
        'a': this.manager.translator.t('设置_基础设置_标签样式_选项_一'),
        'b': this.manager.translator.t('设置_基础设置_标签样式_选项_二'),
        'c': this.manager.translator.t('设置_基础设置_标签样式_选项_三'),
        'd': this.manager.translator.t('设置_基础设置_标签样式_选项_四')
    }


    main(): void {
        const languageBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_语言_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_语言_描述'));
        const languageDropdown = new DropdownComponent(languageBar.controlEl);
        languageDropdown.addOptions(this.manager.translator.language);
        languageDropdown.setValue(this.settings.LANGUAGE);
        languageDropdown.onChange((value) => {
            this.settings.LANGUAGE = value;
            this.manager.saveSettings();
            this.settingTab.basisDisplay();
            Commands(this.app, this.manager);
        });

        const topBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_界面居中_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_界面居中_描述'));
        const topToggle = new ToggleComponent(topBar.controlEl);
        topToggle.setValue(this.settings.CENTER);
        topToggle.onChange((value) => {
            this.settings.CENTER = value;
            this.manager.saveSettings();
        });

        // 
        const persistenceBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_筛选持久化_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_筛选持久化_描述'));
        const persistenceToggle = new ToggleComponent(persistenceBar.controlEl);
        persistenceToggle.setValue(this.settings.PERSISTENCE);
        persistenceToggle.onChange((value) => {
            this.settings.PERSISTENCE = value;
            this.manager.saveSettings();
        });


        const itemStyleBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_目录样式_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_目录样式_描述'));
        const itemStyleDropdown = new DropdownComponent(itemStyleBar.controlEl);
        itemStyleDropdown.addOptions(this.ITEM_STYLE);
        itemStyleDropdown.setValue(this.settings.ITEM_STYLE);
        itemStyleDropdown.onChange((value) => {
            this.settings.ITEM_STYLE = value;
            this.manager.saveSettings();
        });

        const groupStyleBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_分组样式_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_分组样式_描述'));
        const groupStyleDropdown = new DropdownComponent(groupStyleBar.controlEl);
        groupStyleDropdown.addOptions(this.GROUP_STYLE);
        groupStyleDropdown.setValue(this.settings.GROUP_STYLE);
        groupStyleDropdown.onChange((value) => {
            this.settings.GROUP_STYLE = value;
            this.manager.saveSettings();
        });

        const tagStyleBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_标签样式_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_标签样式_描述'));
        const tagStyleDropdown = new DropdownComponent(tagStyleBar.controlEl);
        tagStyleDropdown.addOptions(this.TAG_STYLE);
        tagStyleDropdown.setValue(this.settings.TAG_STYLE);
        tagStyleDropdown.onChange((value) => {
            this.settings.TAG_STYLE = value;
            this.manager.saveSettings();
        });

        const DelayBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_延时启动_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_延时启动_描述'));
        const DelayToggle = new ToggleComponent(DelayBar.controlEl);
        DelayToggle.setValue(this.settings.DELAY);
        DelayToggle.onChange((value) => {
            this.settings.DELAY = value;
            this.manager.saveSettings();
            value ? this.manager.enableDelaysForAllPlugins() : this.manager.disableDelaysForAllPlugins();
        });

        const fadeOutDisabledPluginsBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_淡化插件_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_淡化插件_描述'));
        const fadeOutDisabledPluginsToggle = new ToggleComponent(fadeOutDisabledPluginsBar.controlEl);
        fadeOutDisabledPluginsToggle.setValue(this.settings.FADE_OUT_DISABLED_PLUGINS);
        fadeOutDisabledPluginsToggle.onChange((value) => {
            this.settings.FADE_OUT_DISABLED_PLUGINS = value;
            this.manager.saveSettings();
        });

        const CommandItemBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_单独命令_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_单独命令_描述'));
        const CommandItemToggle = new ToggleComponent(CommandItemBar.controlEl);
        CommandItemToggle.setValue(this.settings.COMMAND_ITEM);
        CommandItemToggle.onChange((value) => {
            this.settings.COMMAND_ITEM = value;
            this.manager.saveSettings();
            Commands(this.app, this.manager);
        });

        const CommandGroupBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_分组命令_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_分组命令_描述'));
        const CommandGroupToggle = new ToggleComponent(CommandGroupBar.controlEl);
        CommandGroupToggle.setValue(this.settings.COMMAND_GROUP);
        CommandGroupToggle.onChange((value) => {
            this.settings.COMMAND_GROUP = value;
            this.manager.saveSettings();
            Commands(this.app, this.manager);
        });

        new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_提示_一_标题'))
            .setDesc(this.manager.translator.t('设置_提示_一_描述'));
    }
}