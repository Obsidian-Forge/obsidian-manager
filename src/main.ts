import { Plugin, PluginManifest, Workspace } from 'obsidian';
import { DEFAULT_SETTINGS, ManagerSettings } from './settings/data';
import { ManagerSettingTab } from './settings';
import { t } from './lang/inxdex';
import { ManagerModal } from './modal/manager-modal';
import Commands from './command';

export default class Manager extends Plugin {
    public settings: ManagerSettings;
    public managerModal: ManagerModal;
    public appPlugins: any;
    public appWorkspace: Workspace;

    public async onload() {
        // @ts-ignore
        this.appPlugins = this.app.plugins;
        this.appWorkspace = this.app.workspace;

        console.log(`%c ${this.manifest.name} %c v${this.manifest.version} `, `padding: 2px; border-radius: 2px 0 0 2px; color: #fff; background: #5B5B5B;`, `padding: 2px; border-radius: 0 2px 2px 0; color: #fff; background: #409EFF;`);
        await this.loadSettings();
        this.addRibbonIcon('folder-cog', t('通用_管理器_文本'), () => { this.managerModal = new ManagerModal(this.app, this); this.managerModal.open(); });
        this.addSettingTab(new ManagerSettingTab(this.app, this));
        const plugins = Object.values(this.appPlugins.manifests).filter((pm: PluginManifest) => pm.id !== this.manifest.id) as PluginManifest[];
        // 检测插件是否开启 如果开启则关闭
        // plugins.forEach((plugin: PluginManifest) => this.initPlugin(plugin));
        // // 检查配置文件
        // this.removeMissingPlugins(plugins);
        this.synchronizePlugins(plugins);
        // 开始延时启动插件
        plugins.forEach((plugin: PluginManifest) => this.startPlugin(plugin.id));
        Commands(this.app, this);
    }

    public async onunload() {
        const plugins = Object.values(this.appPlugins.manifests).filter((pm: PluginManifest) => pm.id !== this.manifest.id);
        plugins.forEach(async (pm: PluginManifest) => {
            const plugin = this.settings.Plugins.find(p => p.id === pm.id)
            if (plugin) {
                if (plugin.enabled) {
                    await this.appPlugins.disablePlugin(pm.id);
                    await this.appPlugins.enablePluginAndSave(pm.id);
                }
            }
        });
    }

    public async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
    public async saveSettings() { await this.saveData(this.settings); }

    // private initPlugin(plugin: PluginManifest) {
    //     const isEnabled = this.appPlugins.enabledPlugins.has(plugin.id);
    //     if (isEnabled) this.appPlugins.disablePluginAndSave(plugin.id);
    //     if (!(this.settings.Plugins.some(p => p.id === plugin.id))) {
    //         const mp: ManagerPlugin = {
    //             'id': plugin.id,
    //             'name': plugin.name,
    //             'desc': plugin.description,
    //             'group': '',
    //             'tags': [],
    //             'enabled': isEnabled,
    //             'delay': '',
    //         }
    //         this.settings.Plugins.push(mp);
    //         this.saveSettings();
    //     }
    // }

    public startPlugin(id: string) {
        const plugin = this.settings.Plugins.find(p => p.id === id);
        if (plugin && plugin.enabled) {
            const delay = this.settings.DELAYS.find(item => item.id === plugin.delay);
            const time = delay ? delay.time : 0;
            setTimeout(() => {
                this.appPlugins.enablePlugin(id);
            }, time * 1000);
        }
    }

    public removeMissingPlugins(p1: PluginManifest[]) {
        const p2 = this.settings.Plugins;
        if (p1.length < p2.length) {
            const missingPlugins = p2.filter(p2Item => !p1.some(p1Item => p1Item.id === p2Item.id));
            this.settings.Plugins = this.settings.Plugins.filter(pm => !missingPlugins.some(mp => mp.id === pm.id));
            this.saveSettings();
        }
    }

    public synchronizePlugins(p1: PluginManifest[]) {
        const p2 = this.settings.Plugins;
        p2.forEach(p2Item => {
            if (!p1.some(p1Item => p1Item.id === p2Item.id)) {
                this.settings.Plugins = this.settings.Plugins.filter(pm => pm.id !== p2Item.id);
            }
        });
        p1.forEach(p1Item => {
            if (!p2.some(p2Item => p2Item.id === p1Item.id)) {
                const isEnabled = this.appPlugins.enabledPlugins.has(p1Item.id);
                if (isEnabled) this.appPlugins.disablePluginAndSave(p1Item.id);
                this.settings.Plugins.push({
                    'id': p1Item.id,
                    'name': p1Item.name,
                    'desc': p1Item.description,
                    'group': '',
                    'tags': [],
                    'enabled': isEnabled,
                    'delay': '',
                });
            }
        });

        // 保存设置
        this.saveSettings();
    }

    // 工具函数
    public createTag(text: string, color: string, type: string) {
        const style = this.generateTagStyle(color, type);
        const tag = createEl('span', {
            text: text,
            cls: 'manager-tag',
            attr: { 'style': style }
        })
        return tag;
    }
    public generateTagStyle(color: string, type: string) {
        let style;
        const [r, g, b] = this.hexToRgbArray(color);
        switch (type) {
            case 'a':
                style = `color: #fff; background-color: ${color}; border-color: ${color};`;
                break;
            case 'b':
                style = `color: ${color}; background-color: transparent; border-color: ${color};`;
                break;
            case 'c':
                style = `color: ${color}; background-color: rgba(${r}, ${g}, ${b}, 0.3); border-color: ${color};`;
                break;
            case 'd':
                style = `color: ${color}; background-color: ${this.adjustColorBrightness(color, 50)}; border-color: ${this.adjustColorBrightness(color, 50)};`;
                break;
            default:
                style = `background-color: transparent;border-style: dashed;`;
        }
        return style;
    }
    public hexToRgbArray(hex: string) {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16);
        const g = ((rgb >> 8) & 0x00FF);
        const b = (rgb & 0x0000FF);
        return [r, g, b];
    }
    public adjustColorBrightness(hex: string, amount: number) {
        const rgb = parseInt(hex.slice(1), 16);
        const r = Math.min(255, Math.max(0, ((rgb >> 16) & 0xFF) + amount));
        const g = Math.min(255, Math.max(0, ((rgb >> 8) & 0xFF) + amount));
        const b = Math.min(255, Math.max(0, (rgb & 0xFF) + amount));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
}

