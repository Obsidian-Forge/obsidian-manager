import BaseSetting from "../base-setting";
import { DropdownComponent, Setting, ToggleComponent } from "obsidian";
import Commands from "src/command";
// import { GROUP_STYLE, ITEM_STYLE, TAG_STYLE } from "src/data/data";

export default class ManagerBasis extends BaseSetting {

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
            this.settingTab.display(); // 重新渲染整个设置界面
            this.display(); // 保持当前内容区的刷新
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
            this.settingTab.display(); // 重新渲染整个设置界面
            this.display(); // 保持当前内容区的刷新
        });

        const persistenceBar = new Setting(this.containerEl)
            .setName(this.manager.translator.t('设置_基础设置_筛选持久化_标题'))
            .setDesc(this.manager.translator.t('设置_基础设置_筛选持久化_描述'));
        const persistenceToggle = new ToggleComponent(persistenceBar.controlEl);
        persistenceToggle.setValue(this.settings.PERSISTENCE);
        persistenceToggle.onChange((value) => {
            this.settings.PERSISTENCE = value;
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